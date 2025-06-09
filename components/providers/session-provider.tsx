"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function NextAuthSessionProvider({ children, session }: SessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
