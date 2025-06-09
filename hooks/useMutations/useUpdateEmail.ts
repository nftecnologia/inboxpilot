import { useMutation, useQueryClient } from "@tanstack/react-query"
import { prisma } from "@/lib/prisma"

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
  return await prisma.email.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
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
