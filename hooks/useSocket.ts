"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
}

let socket: Socket | null = null

export function useSocket(): SocketContextType {
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    // Inicializar socket apenas uma vez
    if (!socket) {
      console.log("🔌 Iniciando conexão Socket.IO...")
      
      socket = io(process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000", {
        path: "/api/socket",
        addTrailingSlash: false,
      })

      socket.on("connect", () => {
        console.log("✅ Socket conectado:", socket?.id)
        setIsConnected(true)
      })

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket desconectado:", reason)
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("🚫 Erro de conexão Socket:", error)
        setIsConnected(false)
      })
    }

    return () => {
      // Não desconectar o socket aqui para mantê-lo ativo entre mudanças de componente
    }
  }, [])

  // Entrar na sala do usuário quando estiver autenticado
  useEffect(() => {
    if (socket && isConnected && session?.user?.id) {
      console.log("🏠 Entrando na sala do usuário:", session.user.id)
      socket.emit("join-user", session.user.id)
    }
  }, [isConnected, session?.user?.id])

  const emit = (event: string, data?: any) => {
    if (socket) {
      socket.emit(event, data)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  return {
    socket,
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
