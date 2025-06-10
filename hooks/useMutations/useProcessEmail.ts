import { useMutation, useQueryClient } from "@tanstack/react-query"

interface ProcessEmailParams {
  emailId: string
}

interface ProcessEmailResult {
  emailId: string
  analysis: {
    category: string
    keywords: string[]
    complexity: number
    autoResponded: boolean
    newStatus: string
  }
  aiResponse?: string
}

async function processEmailWithAI({ emailId }: ProcessEmailParams): Promise<ProcessEmailResult> {
  const response = await fetch("/api/emails/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emailId }),
  })

  if (!response.ok) {
    throw new Error("Erro ao processar email com IA")
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao processar email")
  }

  return result.data
}

export function useProcessEmail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: processEmailWithAI,
    onSuccess: (data) => {
      // Invalidar queries relacionadas aos emails
      queryClient.invalidateQueries({ queryKey: ["emails"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      
      // Atualizar o cache específico do email se existir
      queryClient.setQueryData(["email", data.emailId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            ...data.analysis,
            aiResponse: data.aiResponse,
          }
        }
        return oldData
      })
    },
    onError: (error) => {
      console.error("Erro no processamento IA:", error)
    },
  })
}
