import { useQuery } from "@tanstack/react-query"

interface AIAnalytics {
  overview: {
    totalEmails: number
    processedEmails: number
    autoRespondedEmails: number
    aiAdoptionRate: number
    autoResponseRate: number
  }
  complexityBreakdown: {
    simple: number
    moderate: number
    complex: number
  }
  categoryStats: Array<{
    category: string
    count: number
  }>
  trends: Array<{
    date: string
    total: number
    autoResponded: number
    rate: number
  }>
  topKeywords: Array<{
    keyword: string
    count: number
  }>
  insights: Array<{
    type: 'success' | 'info' | 'warning' | 'error'
    title: string
    description: string
    value: number
  }>
}

async function fetchAIAnalytics(): Promise<AIAnalytics> {
  const response = await fetch("/api/analytics/ai")
  
  if (!response.ok) {
    throw new Error("Erro ao buscar analytics de IA")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao buscar analytics")
  }

  return result.data
}

export function useGetAIAnalytics() {
  return useQuery({
    queryKey: ["ai-analytics"],
    queryFn: fetchAIAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}
