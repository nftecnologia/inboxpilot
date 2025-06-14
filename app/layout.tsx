import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NextAuthSessionProvider } from "@/components/providers/session-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { ChatWidget } from "@/components/chat-widget"

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] })

export const metadata: Metadata = {
  title: "Kirvano Suporte - Centralização e Automação de E-mails",
  description:
    "Centralize e automatize o atendimento via e-mail de suporte da sua empresa, utilizando IA para classificar e responder automaticamente.",
    generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <NextAuthSessionProvider>
          <QueryProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="light" 
              enableSystem={false} 
              disableTransitionOnChange
              storageKey="kirvano-theme"
            >
              <ErrorBoundary>
                {children}
                <ChatWidget />
              </ErrorBoundary>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
