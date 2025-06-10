import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analisarEmail, gerarRespostaEmail, extrairPalavrasChave, avaliarComplexidade } from "@/lib/openai"
import { processEmailJob } from "@/src/trigger/processEmail"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { emailId } = body

    if (!emailId) {
      return NextResponse.json({ 
        success: false, 
        message: "ID do email é obrigatório" 
      }, { status: 400 })
    }

    // Buscar o email no banco
    const email = await prisma.email.findFirst({
      where: {
        id: emailId,
        userId: session.user.id,
      },
    })

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email não encontrado" 
      }, { status: 404 })
    }

    // Verificar se já foi processado
    if (email.aiAnalyzed) {
      return NextResponse.json({ 
        success: false, 
        message: "Email já foi processado pela IA" 
      }, { status: 400 })
    }

    console.log(`🤖 Iniciando processamento IA do email ${emailId}`)

    // Opção 1: Usar Trigger.dev para processamento assíncrono
    // Descomente para usar filas ao invés de processamento direto
    /*
    const handle = await processEmailJob.trigger({
      emailId,
      userId: session.user.id
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Email enviado para processamento",
      jobId: handle.id
    })
    */

    // Opção 2: Processamento direto (atual)

    // Processar com IA
    const [categoria, palavrasChave, complexidade] = await Promise.all([
      analisarEmail(email.subject, email.content),
      extrairPalavrasChave(email.subject, email.content),
      avaliarComplexidade(email.subject, email.content),
    ])

    console.log(`📊 Resultados da análise:`, {
      categoria,
      palavrasChave,
      complexidade
    })

    // Gerar resposta automática se a complexidade for baixa
    let aiResponse = null
    let shouldAutoRespond = false

    if (complexidade <= 3) {
      try {
        aiResponse = await gerarRespostaEmail(
          email.subject,
          email.content,
          email.from.split('@')[0] || "Cliente",
          categoria,
          palavrasChave
        )
        shouldAutoRespond = true
        console.log(`✨ Resposta automática gerada`)
      } catch (error) {
        console.error("Erro ao gerar resposta:", error)
      }
    } else {
      console.log(`⚠️ Complexidade alta (${complexidade}) - Requer intervenção humana`)
    }

    // Determinar novo status
    let newStatus = email.status
    if (shouldAutoRespond) {
      newStatus = "respondidos"
    } else if (complexidade >= 4) {
      newStatus = "pendentes"
    } else {
      newStatus = "processados"
    }

    // Atualizar email com resultados da IA
    const updatedEmail = await prisma.email.update({
      where: { id: emailId },
      data: {
        category: categoria,
        aiKeywords: palavrasChave,
        aiComplexity: complexidade,
        aiResponse: aiResponse,
        aiAnalyzed: true,
        status: newStatus,
        processedAt: new Date(),
        ...(shouldAutoRespond && { respondedAt: new Date() }),
        updatedAt: new Date(),
      },
    })

    const result = {
      emailId,
      analysis: {
        category: categoria,
        keywords: palavrasChave,
        complexity: complexidade,
        autoResponded: shouldAutoRespond,
        newStatus,
      },
      ...(aiResponse && { aiResponse }),
    }

    console.log(`✅ Processamento concluído para email ${emailId}`)

    return NextResponse.json({ 
      success: true, 
      data: result 
    })

  } catch (error) {
    console.error("Erro no processamento IA:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro interno no processamento" 
    }, { status: 500 })
  }
}
