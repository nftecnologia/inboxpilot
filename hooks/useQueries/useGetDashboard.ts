import { useQuery } from "@tanstack/react-query"

interface DashboardMetrics {
  totalEmails: number
  unreadEmails: number
  processedEmails: number
  respondedEmails: number
  responseRate: number
  averageResponseTime: number
  knowledgeArticles: number
  emailsByCategory: Array<{
    category: string
    count: number
  }>
  emailsByStatus: Array<{
    status: string
    count: number
  }>
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch("/api/dashboard")
  
  if (!response.ok) {
    throw new Error("Erro ao buscar métricas do dashboard")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao buscar métricas")
  }

  return result.data
}

export function useGetDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardMetrics,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
    refetchInterval: 1000 * 60 * 5, // Refetch a cada 5 minutos
  })
}
