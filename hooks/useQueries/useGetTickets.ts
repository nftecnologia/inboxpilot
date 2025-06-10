"use client"

import { useQuery } from "@tanstack/react-query"
import type { TicketFilters } from "@/types/crm"

interface UseGetTicketsParams extends TicketFilters {
  limit?: number
}

export function useGetTickets(params: UseGetTicketsParams = {}) {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      
      if (params.status && params.status.length > 0) {
        searchParams.append("status", params.status.join(","))
      }
      
      if (params.priority && params.priority.length > 0) {
        searchParams.append("priority", params.priority.join(","))
      }
      
      if (params.assigneeId) {
        searchParams.append("assigneeId", params.assigneeId)
      }
      
      if (params.category) {
        searchParams.append("category", params.category)
      }
      
      if (params.search) {
        searchParams.append("search", params.search)
      }
      
      if (params.limit) {
        searchParams.append("limit", params.limit.toString())
      }

      const response = await fetch(`/api/tickets?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error("Erro ao buscar tickets")
      }
      
      const data = await response.json()
      return data.tickets || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}
