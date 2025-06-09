import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UpdateEmailParams {
  id: string
  data: {
    status?: string
    isRead?: boolean
    isStarred?: boolean
    category?: string
    aiResponse?: string
  }
}

async function updateEmail({ id, data }: UpdateEmailParams) {
  const response = await fetch(`/api/emails/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Erro ao atualizar email")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao atualizar email")
  }

  return result.data
}

export function useUpdateEmail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateEmail,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["emails"] })
      
      const previousEmails = queryClient.getQueryData(["emails"])
      
      queryClient.setQueryData(["emails"], (old: any) => {
        if (!old) return old
        return old.map((email: any) => 
          email.id === id ? { ...email, ...data } : email
        )
      })
      
      return { previousEmails }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousEmails) {
        queryClient.setQueryData(["emails"], context.previousEmails)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] })
    },
  })
}
