import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRelevantContext } from "@/lib/pinecone"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { CONFIDENCE_THRESHOLD, MAX_CONTEXT_MESSAGES } from "@/types/chat"

// Declare global type for Socket.io
declare global {
  var io: any
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, content } = body

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "sessionId e content são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar sessão existente
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: MAX_CONTEXT_MESSAGES,
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Criar mensagem do usuário
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "USER",
        content,
      },
    })

    // Buscar configurações do chat
    const settingsResponse = await fetch(`${request.nextUrl.origin}/api/chat/settings`, {
      headers: request.headers,
    })
    const settings = await settingsResponse.json()

    // Buscar contexto relevante no Pinecone
    console.log("🔍 Buscando contexto relevante para:", content)
    const context = await getRelevantContext(
      content, 
      settings.knowledgeBase?.enabledCategories || undefined, 
      settings.knowledgeBase?.maxContexts || 5
    )
    
    // Preparar histórico de conversa para contexto
    const conversationHistory = session.messages
      .reverse()
      .map((msg: any) => ({
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
      }))

    // Gerar resposta com OpenAI
    const prompt = `
      Você é o assistente virtual inteligente da Kirvano, especializado em suporte ao cliente.
      
      🧠 MEMÓRIA/BASE DE CONHECIMENTO:
      ${context || 'Nenhum contexto específico encontrado.'}
      
      💬 HISTÓRICO COMPLETO DA CONVERSA:
      ${conversationHistory.map((m: any) => `${m.role === 'user' ? '👤 Cliente' : '🤖 Assistente'}: ${m.content}`).join('\n')}
      
      ❓ PERGUNTA ATUAL:
      ${content}
      
      📋 INSTRUÇÕES DETALHADAS:
      1. PRIORIZE informações da base de conhecimento acima
      2. Seja PRECISO, mas também EMPÁTICO e HUMANO
      3. Use linguagem SIMPLES e CLARA (evite jargões técnicos)
      4. Formate respostas com:
         • Bullet points para listas
         • Parágrafos curtos
         • Emojis quando apropriado (mas com moderação)
      5. Se não souber algo, seja TRANSPARENTE:
         - "Não encontrei essa informação específica..."
         - "Vou verificar isso com nossa equipe..."
      6. Para questões COMPLEXAS ou SENSÍVEIS:
         - Reconheça a importância
         - Sugira atendimento especializado
      7. SEMPRE termine com algo útil:
         - Uma pergunta de confirmação
         - Próximos passos
         - Oferta de mais ajuda
      
      🎯 CONTEXTO IMPORTANTE:
      - Horário comercial: 8h às 18h (segunda a sexta)
      - Somos especialistas em suporte inteligente
      - Foco em resolver rapidamente
      - Tratamento personalizado
      
      ⚡ ANÁLISE NECESSÁRIA:
      - CONFIANÇA: Avalie de 0.0 a 1.0 sua certeza na resposta
      - PERGUNTAS RELACIONADAS: Sugira até 3 perguntas que o cliente pode ter
      - ESCALAR: Determine se precisa de atendimento humano (complexidade/sensibilidade)
      
      📝 FORMATO OBRIGATÓRIO DA RESPOSTA:
      RESPOSTA: [Sua resposta completa e útil aqui]
      CONFIANÇA: [0.0 a 1.0 - seja conservador]
      PERGUNTAS_RELACIONADAS: [pergunta1|pergunta2|pergunta3]
      ESCALAR: [true/false - true se complexo ou sensível]
    `

    console.log("📤 Gerando resposta com OpenAI...")
    const { text } = await generateText({
      model: openai(settings.ai?.model || "gpt-4o"),
      prompt,
      temperature: settings.ai?.temperature || 0.3,
      maxTokens: 1000,
    })

    // Extrair informações da resposta
    console.log("📝 Resposta bruta da IA:", text);
    
    let resposta = ""
    let confianca = 0.8
    let perguntasRelacionadas: string[] = []
    let deveEscalar = false

    // Dividir o texto em seções
    const sections = text.split('\n');
    let currentSection = '';
    
    for (const line of sections) {
      if (line.startsWith('RESPOSTA:')) {
        currentSection = 'resposta';
        const content = line.substring('RESPOSTA:'.length).trim();
        if (content) resposta = content;
      } else if (line.startsWith('CONFIANÇA:')) {
        currentSection = 'confianca';
        const value = line.substring('CONFIANÇA:'.length).trim();
        confianca = parseFloat(value) || 0.8;
      } else if (line.startsWith('PERGUNTAS_RELACIONADAS:')) {
        currentSection = 'perguntas';
        const questions = line.substring('PERGUNTAS_RELACIONADAS:'.length).trim();
        if (questions) {
          perguntasRelacionadas = questions
            .split('|')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      } else if (line.startsWith('ESCALAR:')) {
        currentSection = 'escalar';
        const value = line.substring('ESCALAR:'.length).trim();
        deveEscalar = value === 'true';
      } else if (currentSection === 'resposta' && line.trim()) {
        // Continuar adicionando linhas à resposta se ainda estamos nessa seção
        resposta += '\n' + line;
      }
    }

    // Se não conseguiu extrair a resposta no formato esperado, usar o texto completo
    if (!resposta) {
      console.log("⚠️ Formato de resposta não reconhecido, usando texto completo");
      resposta = text.trim();
    }

    console.log("✅ Resposta extraída:", { 
      resposta: resposta.substring(0, 100) + '...', 
      confianca, 
      perguntasRelacionadas, 
      deveEscalar 
    });

    // Criar mensagem do assistente
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: resposta,
        confidence: confianca,
        sources: context ? { knowledgeBase: context.substring(0, 1000) } : undefined,
        metadata: {
          suggestedQuestions: perguntasRelacionadas,
          shouldEscalate: deveEscalar || confianca < CONFIDENCE_THRESHOLD,
        },
      },
    })

    // Usar threshold configurado ou padrão
    const confidenceThreshold = (settings.ai?.confidenceThreshold || 80) / 100

    // Atualizar status da sessão se precisar escalar
    if (deveEscalar || confianca < confidenceThreshold) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: "ESCALATED" },
      })

      // Chamar webhook se configurado
      if (settings.advanced?.webhookUrl) {
        try {
          await fetch(settings.advanced.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              userMessage: content,
              confidence: confianca,
              reason: deveEscalar ? "ai_suggested" : "low_confidence",
            }),
          })
        } catch (webhookError) {
          console.error("❌ Erro ao chamar webhook:", webhookError)
        }
      }
    }

    // Emitir evento via Socket.io para atualização em tempo real
    const io = global.io
    if (io) {
      io.to(sessionId).emit("new-message", assistantMessage)
    }

    return NextResponse.json({
      message: assistantMessage,
      suggestedQuestions: perguntasRelacionadas,
      shouldEscalate: deveEscalar || confianca < CONFIDENCE_THRESHOLD,
    })
  } catch (error) {
    console.error("❌ Erro no chat:", error)
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    )
  }
}

// Criar nova sessão de chat
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, userName, userPhone, source = "widget", metadata } = body

    // Validar dados obrigatórios
    if (!userEmail || !userName || !userPhone) {
      return NextResponse.json(
        { error: "Nome, e-mail e telefone são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar ou criar cliente
    let client = await prisma.client.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { phone: userPhone }
        ]
      }
    })

    if (!client) {
      // Criar novo cliente
      client = await prisma.client.create({
        data: {
          email: userEmail,
          name: userName,
          phone: userPhone,
        }
      })
    } else {
      // Atualizar dados do cliente se necessário
      const updates: any = {}
      if (!client.name && userName) updates.name = userName
      if (!client.phone && userPhone) updates.phone = userPhone
      
      if (Object.keys(updates).length > 0) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: updates
        })
      }
    }

    // Criar ticket para o chat
    const ticket = await prisma.ticket.create({
      data: {
        subject: `Chat iniciado - ${userName}`,
        description: `Chat iniciado em ${new Date().toLocaleString('pt-BR')}`,
        status: "OPEN",
        priority: "MEDIUM",
        source: "chat",
        clientId: client.id,
        category: "Chat Support",
      }
    })

    // Incrementar contador de tickets do cliente
    await prisma.client.update({
      where: { id: client.id },
      data: { totalTickets: { increment: 1 } }
    })

    // Criar sessão de chat vinculada ao cliente e ticket
    const session = await prisma.chatSession.create({
      data: {
        userEmail,
        userName,
        userPhone,
        clientId: client.id,
        ticketId: ticket.id,
        source,
        metadata: {
          ...metadata,
          ticketNumber: ticket.number
        },
        status: "ACTIVE",
      },
    })

    // Buscar configurações do chat
    const settingsResponse = await fetch(`${request.nextUrl.origin}/api/chat/settings`, {
      headers: request.headers,
    })
    const settings = await settingsResponse.json()

    // Verificar horário de atendimento
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const businessHours = settings.preAttendance?.businessHours
    
    let welcomeContent = settings.preAttendance?.welcomeMessage || "Olá! Sou o assistente virtual da Kirvano. Como posso ajudá-lo hoje?"
    
    if (businessHours && (currentTime < businessHours.start || currentTime > businessHours.end)) {
      welcomeContent = `Olá! Nosso horário de atendimento é das ${businessHours.start} às ${businessHours.end}. Fora deste horário, nosso assistente virtual está disponível para ajudar com perguntas frequentes.`
    }

    // Criar mensagem de boas-vindas
    const welcomeMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "SYSTEM",
        content: welcomeContent,
        metadata: {
          suggestedQuestions: settings.preAttendance?.initialQuestions || [
            "Como criar uma conta?",
            "Como resetar minha senha?",
            "Como funciona a plataforma?",
          ],
        },
      },
    })

    return NextResponse.json({
      session,
      welcomeMessage,
    })
  } catch (error) {
    console.error("❌ Erro ao criar sessão:", error)
    return NextResponse.json(
      { error: "Erro ao criar sessão de chat" },
      { status: 500 }
    )
  }
}

// Fechar sessão de chat
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId é obrigatório" },
        { status: 400 }
      )
    }

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("❌ Erro ao fechar sessão:", error)
    return NextResponse.json(
      { error: "Erro ao fechar sessão" },
      { status: 500 }
    )
  }
}
