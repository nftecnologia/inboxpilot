import { useMutation } from "@tanstack/react-query"

interface SentimentAnalysisRequest {
  text: string
  includeEmotions?: boolean
  includeTone?: boolean
}

interface SentimentAnalysisResponse {
  sentiment: {
    overall: "positive" | "negative" | "neutral"
    confidence: number
    polarity: number
    subjectivity: number
  }
  emotions: {
    joy: number
    anger: number
    fear: number
    sadness: number
    surprise: number
    disgust: number
    trust: number
    anticipation: number
  }
  tone: {
    formal: number
    urgent: number
    frustrated: number
    satisfied: number
    confused: number
    grateful: number
  }
  keywords: string[]
  urgency_level: number
  customer_intent: "support_request" | "complaint" | "question" | "compliment" | "other"
  recommended_response_tone: "empathetic" | "professional" | "friendly" | "urgent"
  priority_score: number
  insights: Array<{
    type: string
    title: string
    description: string
    action: string
  }>
  processed_at: string
  text_length: number
}

async function analyzeSentiment(data: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> {
  const response = await fetch("/api/ai/sentiment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Erro ao analisar sentimento")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro na análise de sentimento")
  }

  return result.data
}

export function useSentimentAnalysis() {
  return useMutation({
    mutationFn: analyzeSentiment,
    onError: (error) => {
      console.error("Erro na análise de sentimento:", error)
    },
  })
}
