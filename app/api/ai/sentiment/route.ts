import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const { text, includeEmotions = true, includeTone = true } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: "Texto é obrigatório" 
      }, { status: 400 })
    }

    // Análise de sentimento avançada com OpenAI
    const prompt = `
Analise o seguinte texto e forneça uma análise de sentimento detalhada em JSON:

Texto: "${text}"

Retorne APENAS um JSON válido com esta estrutura:
{
  "sentiment": {
    "overall": "positive|negative|neutral",
    "confidence": 0.95,
    "polarity": 0.8,
    "subjectivity": 0.6
  },
  "emotions": {
    "joy": 0.1,
    "anger": 0.0,
    "fear": 0.0,
    "sadness": 0.0,
    "surprise": 0.0,
    "disgust": 0.0,
    "trust": 0.8,
    "anticipation": 0.4
  },
  "tone": {
    "formal": 0.7,
    "urgent": 0.2,
    "frustrated": 0.1,
    "satisfied": 0.6,
    "confused": 0.0,
    "grateful": 0.4
  },
  "keywords": ["palavra1", "palavra2"],
  "urgency_level": 3,
  "customer_intent": "support_request|complaint|question|compliment|other",
  "recommended_response_tone": "empathetic|professional|friendly|urgent",
  "priority_score": 7
}

Valores devem estar entre 0 e 1 para porcentagens, e 1-10 para scores.
`

    const { text: responseText } = await generateText({
      model: openai("gpt-4o"),
      system: "Você é um especialista em análise de sentimento. Retorne sempre JSON válido e preciso.",
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    })
    
    if (!responseText) {
      throw new Error("Resposta vazia da OpenAI")
    }

    try {
      const analysis = JSON.parse(responseText)
      
      // Validar estrutura básica
      if (!analysis.sentiment || !analysis.emotions || !analysis.tone) {
        throw new Error("Estrutura de análise inválida")
      }

      // Adicionar insights automáticos
      const insights = generateInsights(analysis)
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...analysis,
          insights,
          processed_at: new Date().toISOString(),
          text_length: text.length
        }
      })

    } catch (parseError) {
      console.error("Erro ao parsear JSON da OpenAI:", parseError)
      return NextResponse.json({ 
        success: false, 
        message: "Erro na análise de sentimento" 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Erro na API de sentimento:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro interno do servidor" 
    }, { status: 500 })
  }
}

function generateInsights(analysis: any) {
  const insights = []

  // Insight de urgência
  if (analysis.urgency_level >= 8) {
    insights.push({
      type: "urgent",
      title: "Alta Urgência Detectada",
      description: "Este email requer atenção imediata do atendimento.",
      action: "Priorizar resposta"
    })
  }

  // Insight de sentimento negativo
  if (analysis.sentiment.overall === "negative" && analysis.sentiment.confidence > 0.7) {
    insights.push({
      type: "negative",
      title: "Cliente Insatisfeito",
      description: "Cliente demonstra insatisfação. Resposta empática recomendada.",
      action: "Resposta personalizada"
    })
  }

  // Insight de frustração
  if (analysis.tone.frustrated > 0.6) {
    insights.push({
      type: "frustrated",
      title: "Cliente Frustrado",
      description: "Sinais de frustração detectados. Considere escalação.",
      action: "Considerar escalação"
    })
  }

  // Insight de satisfação
  if (analysis.sentiment.overall === "positive" && analysis.tone.satisfied > 0.7) {
    insights.push({
      type: "positive",
      title: "Cliente Satisfeito",
      description: "Cliente demonstra satisfação. Boa oportunidade para feedback.",
      action: "Solicitar avaliação"
    })
  }

  // Insight de complexidade
  if (analysis.emotions.confusion > 0.5 || analysis.text_length > 500) {
    insights.push({
      type: "complex",
      title: "Caso Complexo",
      description: "Email extenso ou confuso. Pode requerer atenção especializada.",
      action: "Análise detalhada"
    })
  }

  return insights
}
