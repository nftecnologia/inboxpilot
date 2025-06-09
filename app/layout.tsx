import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NextAuthSessionProvider } from "@/components/providers/session-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] })

export const metadata: Metadata = {
  title: "InboxPilot - Centralização e Automação de E-mails",
  description:
    "Centralize e automatize o atendimento via e-mail de suporte da sua empresa, utilizando IA para classificar e responder automaticamente.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <NextAuthSessionProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
