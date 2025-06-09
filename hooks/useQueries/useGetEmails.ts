import { useQuery } from "@tanstack/react-query"
import { prisma } from "@/lib/prisma"

interface UseGetEmailsParams {
  userId?: string
  status?: string
  category?: string
  limit?: number
}

async function fetchEmails({ userId, status, category, limit = 50 }: UseGetEmailsParams) {
  if (!userId) throw new Error("User ID é obrigatório")

  const emails = await prisma.email.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(category && { category }),
    },
    orderBy: {
      receivedAt: "desc",
    },
    take: limit,
  })

  return emails
}

export function useGetEmails(params: UseGetEmailsParams) {
  return useQuery({
    queryKey: ["emails", params],
    queryFn: () => fetchEmails(params),
    enabled: !!params.userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}
