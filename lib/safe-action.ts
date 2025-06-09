import { createSafeActionClient } from "next-safe-action"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { appErrors } from "@/types/actions"

export const actionClient = createSafeActionClient({
  handleReturnedServerError: (error) => {
    console.error("Action error:", error)
    return appErrors.UNEXPECTED_ERROR
  },
})

export const authenticatedActionClient = actionClient.use(async ({ next }) => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED")
  }

  return next({ ctx: { userId: session.user.id } })
})
