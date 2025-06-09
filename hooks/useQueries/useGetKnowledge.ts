import { useQuery } from "@tanstack/react-query"

interface KnowledgeItem {
  id: string
  title: string
  category: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface UseGetKnowledgeParams {
  category?: string
  search?: string
  limit?: number
}

async function fetchKnowledge({ category, search, limit = 50 }: UseGetKnowledgeParams = {}): Promise<KnowledgeItem[]> {
  const params = new URLSearchParams()
  
  if (category) params.append("category", category)
  if (search) params.append("search", search)
  params.append("limit", limit.toString())

  const response = await fetch(`/api/knowledge?${params}`)
  
  if (!response.ok) {
    throw new Error("Erro ao buscar conhecimentos")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao buscar conhecimentos")
  }

  return result.data
}

async function fetchKnowledgeStats() {
  const response = await fetch("/api/knowledge?stats=true")
  
  if (!response.ok) {
    throw new Error("Erro ao buscar estatísticas")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao buscar estatísticas")
  }

  return result.data
}

export function useGetKnowledge(params: UseGetKnowledgeParams = {}) {
  return useQuery({
    queryKey: ["knowledge", params],
    queryFn: () => fetchKnowledge(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}

export function useGetKnowledgeStats() {
  return useQuery({
    queryKey: ["knowledge-stats"],
    queryFn: fetchKnowledgeStats,
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  })
}
