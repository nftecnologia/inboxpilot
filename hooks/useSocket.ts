"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export interface SocketContextType {
  socket: any | null
  isConnected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
}

export function useSocket(): SocketContextType {
  const [isConnected, setIsConnected] = useState(true) // Simular conexão sempre ativa
  const { data: session } = useSession()

  useEffect(() => {
    // Simular conexão ativa sem fazer requests
    console.log("🔌 Notificações em tempo real simuladas (desenvolvimento)")
    setIsConnected(true)
  }, [])

  const emit = async (event: string, data?: any) => {
    try {
      console.log(`📡 Emitindo evento: ${event}`, data)
      
      const response = await fetch("/api/socket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          data,
          userId: session?.user?.id,
        }),
      })

      const result = await response.json()
      console.log("✅ Evento enviado:", result)
    } catch (error) {
      console.error("❌ Erro ao emitir evento:", error)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    // Para esta implementação simplificada, vamos simular eventos
    console.log(`👂 Listener registrado para: ${event}`)
  }

  const off = (event: string, callback?: (data: any) => void) => {
    console.log(`🔇 Listener removido para: ${event}`)
  }

  return {
    socket: null,
    isConnected,
    emit,
    on,
    off,
  }
}

// Hook para notificações em tempo real
export function useRealTimeNotifications() {
  const { on, off, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!isConnected) return

    const handleNewEmail = (data: any) => {
      console.log("📧 Novo email recebido:", data)
      setNotifications(prev => [
        {
          id: Date.now(),
          type: "new-email",
          title: "Novo Email",
          message: `De: ${data.from} - ${data.subject}`,
          timestamp: new Date(),
          data,
        },
        ...prev.slice(0, 4) // Manter apenas os 5 mais recentes
      ])
    }

    const handleEmailProcessed = (data: any) => {
      console.log("🤖 Email processado pela IA:", data)
      setNotifications(prev => [
        {
          id: Date.now(),
          type: "ai-processed",
          title: "Email Processado",
          message: `${data.category} - Complexidade: ${data.complexity}`,
          timestamp: new Date(),
          data,
        },
        ...prev.slice(0, 4)
      ])
    }

    const handleAutoResponse = (data: any) => {
      console.log("⚡ Resposta automática enviada:", data)
      setNotifications(prev => [
        {
          id: Date.now(),
          type: "auto-response",
          title: "Resposta Automática",
          message: `Respondido automaticamente: ${data.subject}`,
          timestamp: new Date(),
          data,
        },
        ...prev.slice(0, 4)
      ])
    }

    const handleDashboardUpdate = (data: any) => {
      console.log("📊 Atualização do dashboard:", data)
      // Invalidar queries do React Query para atualizar dados
      // Isso será implementado quando integrarmos com o QueryClient
    }

    // Registrar listeners
    on("new-email", handleNewEmail)
    on("email-processed", handleEmailProcessed)
    on("auto-response", handleAutoResponse)
    on("dashboard-update", handleDashboardUpdate)

    return () => {
      // Limpar listeners
      off("new-email", handleNewEmail)
      off("email-processed", handleEmailProcessed)
      off("auto-response", handleAutoResponse)
      off("dashboard-update", handleDashboardUpdate)
    }
  }, [isConnected, on, off])

  const clearNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    clearNotifications,
    removeNotification,
    isConnected,
  }
}
