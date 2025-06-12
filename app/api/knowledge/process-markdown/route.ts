import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

// Verificar se estamos em ambiente de build
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.OPENAI_API_KEY;

// Criar instância apenas se a variável estiver disponível
let openai: OpenAI | null = null;

if (!isBuildTime && process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Categorias disponíveis
const categories = [
  "Cadastro e Conta",
  "Produtos",
  "Marketplace",
  "Área de Membros",
  "Checkout e Conversão",
  "Integrações",
  "Afiliados",
  "Geral",
  "Consumidor",
  "Plágio",
  "Upsell One Click",
  "Biometria",
  "Finanças",
]

export async function POST(request: NextRequest) {
  console.log('🔍 POST /api/knowledge/process-markdown iniciado')
  
  // Verificar se OpenAI está configurada
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não configurada')
    return NextResponse.json({ 
      error: "Chave OpenAI não configurada. Por favor, configure OPENAI_API_KEY no arquivo .env" 
    }, { status: 500 })
  }
  
  console.log('✅ OPENAI_API_KEY encontrada:', process.env.OPENAI_API_KEY.substring(0, 8) + '...')
  
  // Ler o body uma única vez no início
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file || (!file.name.endsWith('.md') && !file.name.endsWith('.markdown'))) {
    return NextResponse.json({ error: "Arquivo Markdown inválido" }, { status: 400 })
  }

  // Ler conteúdo do arquivo uma única vez
  const content = await file.text()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    console.log(`✅ Sessão válida para: ${session.user?.email}`)
    console.log(`📄 Markdown processado: ${file.name}`)
    console.log(`📏 Tamanho: ${content.length} caracteres`)
    
    // Verificar se OpenAI está disponível
    if (!openai) {
      console.error('❌ OpenAI não está configurado')
      // Retornar resposta básica sem IA
      return NextResponse.json({
        title: file.name.replace(/\.(md|markdown)$/, ''),
        category: "Geral",
        content: content
      })
    }
    
    // Usar OpenAI para analisar e categorizar o conteúdo
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em analisar documentação e organizá-la para base de conhecimento.
          
          Categorias disponíveis: ${categories.join(", ")}
          
          Analise o conteúdo Markdown e retorne um JSON com:
          - title: Um título conciso e descritivo (máximo 100 caracteres)
          - category: A categoria mais apropriada da lista fornecida
          - content: O conteúdo formatado em Markdown, mantendo a estrutura original mas melhorando quando necessário
          
          Importante:
          - Se o documento já tiver um título (# Título), use-o como base
          - Preserve TODA a informação do documento
          - Mantenha formatação Markdown (títulos, listas, códigos, links, etc)
          - Se houver seções mal formatadas, corrija-as
          - Adicione estrutura se o documento estiver desorganizado`
        },
        {
          role: "user",
          content: `Analise este documento Markdown e organize-o conforme solicitado:
          
          Nome do arquivo: ${file.name}
          
          CONTEÚDO DO MARKDOWN:
          ${content}
          
          Por favor:
          1. Extraia ou crie um título apropriado
          2. Escolha a categoria mais adequada
          3. Retorne o conteúdo completo, bem formatado em Markdown`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    
    // Validar categoria
    if (!categories.includes(result.category)) {
      result.category = "Geral"
    }

    return NextResponse.json({
      title: result.title || file.name.replace(/\.(md|markdown)$/, ''),
      category: result.category || "Geral",
      content: result.content || content
    })

  } catch (error) {
    console.error("❌ Erro ao processar Markdown com OpenAI:", error)
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Tipo de erro:", error.name)
      console.error("Mensagem:", error.message)
      console.error("Stack:", error.stack)
    }
    
    // Mensagem de erro mais específica
    let errorMessage = "Erro ao processar documento."
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = "Chave OpenAI inválida. Verifique sua OPENAI_API_KEY."
      } else if (error.message.includes('429')) {
        errorMessage = "Limite de requisições OpenAI excedido. Tente novamente em alguns minutos."
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage = "Cota OpenAI esgotada. Verifique seus créditos."
      } else if (error.message.includes('model')) {
        errorMessage = "Modelo OpenAI não disponível. Tente novamente."
      } else {
        errorMessage = `Erro OpenAI: ${error.message}`
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}
