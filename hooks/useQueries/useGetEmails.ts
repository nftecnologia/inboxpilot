import { useQuery } from "@tanstack/react-query"

interface UseGetEmailsParams {
  status?: string
  category?: string
  limit?: number
}

async function fetchEmails({ status, category, limit = 50 }: UseGetEmailsParams) {
  const params = new URLSearchParams()
  
  if (status) params.append("status", status)
  if (category) params.append("category", category)
  params.append("limit", limit.toString())

  const response = await fetch(`/api/emails?${params}`)
  
  if (!response.ok) {
    throw new Error("Erro ao buscar emails")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao buscar emails")
  }

  return result.data
}

export function useGetEmails(params: UseGetEmailsParams = {}) {
  return useQuery({
    queryKey: ["emails", params],
    queryFn: () => fetchEmails(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}
