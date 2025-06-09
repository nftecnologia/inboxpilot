import { useMutation, useQueryClient } from "@tanstack/react-query"

interface CreateKnowledgeParams {
  title: string
  category: string
  content: string
}

interface UpdateKnowledgeParams {
  id: string
  data: {
    title?: string
    category?: string
    content?: string
  }
}

interface DeleteKnowledgeParams {
  id: string
}

async function createKnowledge(params: CreateKnowledgeParams) {
  const response = await fetch("/api/knowledge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error("Erro ao criar conhecimento")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao criar conhecimento")
  }

  return result.data
}

async function updateKnowledge({ id, data }: UpdateKnowledgeParams) {
  const response = await fetch(`/api/knowledge/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Erro ao atualizar conhecimento")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao atualizar conhecimento")
  }

  return result.data
}

async function deleteKnowledge({ id }: DeleteKnowledgeParams) {
  const response = await fetch(`/api/knowledge/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Erro ao deletar conhecimento")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao deletar conhecimento")
  }

  return result.data
}

export function useCreateKnowledge() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
      queryClient.invalidateQueries({ queryKey: ["knowledge-stats"] })
    },
  })
}

export function useUpdateKnowledge() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateKnowledge,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["knowledge"] })
      
      const previousKnowledge = queryClient.getQueryData(["knowledge"])
      
      queryClient.setQueryData(["knowledge"], (old: any) => {
        if (!old) return old
        return old.map((item: any) => 
          item.id === id ? { ...item, ...data } : item
        )
      })
      
      return { previousKnowledge }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousKnowledge) {
        queryClient.setQueryData(["knowledge"], context.previousKnowledge)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
    },
  })
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteKnowledge,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["knowledge"] })
      
      const previousKnowledge = queryClient.getQueryData(["knowledge"])
      
      queryClient.setQueryData(["knowledge"], (old: any) => {
        if (!old) return old
        return old.filter((item: any) => item.id !== id)
      })
      
      return { previousKnowledge }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousKnowledge) {
        queryClient.setQueryData(["knowledge"], context.previousKnowledge)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
      queryClient.invalidateQueries({ queryKey: ["knowledge-stats"] })
    },
  })
}
