"use client"

import { AppLayout } from "@/components/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/hooks/useSocket"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MessageCircle, 
  Clock, 
  User, 
  Phone, 
  Mail,
  Send,
  Bot,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  userName?: string
  userEmail?: string
  userPhone?: string
  status: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
  client?: {
    name?: string
    email: string
    phone?: string
    company?: string
  }
  ticket?: {
    number: number
    priority: string
  }
  metadata?: {
    waitingTime?: number
    lastAIConfidence?: number
  }
}

interface ChatMessage {
  id: string
  role: string
  content: string
  confidence?: number
  createdAt: string
}

export default function AtendimentoPage() {
  const queryClient = useQueryClient()
  const socket = useSocket()
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Buscar sessões em espera e ativas
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["live-chat-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/chat/live-sessions")
      if (!response.ok) throw new Error("Erro ao buscar sessões")
      return response.json()
    },
    refetchInterval: 2000 // Reduzido para 2 segundos
  })

  // Assumir chat
  const assumeChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/assume`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Erro ao assumir chat")
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["live-chat-sessions"] })
      setSelectedSession(data)
      toast({
        title: "Chat assumido!",
        description: `Você está atendendo ${data.userName || data.userEmail}`,
      })
    }
  })

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          role: "ASSISTANT",
          isHuman: true 
        })
      })
      if (!response.ok) throw new Error("Erro ao enviar mensagem")
      return response.json()
    },
    onSuccess: (data) => {
      setMessage("")
      // Atualizar a sessão selecionada imediatamente
      if (selectedSession) {
        const updatedSessions = sessions.map((s: ChatSession) => {
          if (s.id === selectedSession.id) {
            return {
              ...s,
              messages: [...s.messages, data.message]
            }
          }
          return s
        })
        queryClient.setQueryData(["live-chat-sessions"], updatedSessions)
        
        // Atualizar sessão selecionada
        const updatedSession = updatedSessions.find((s: ChatSession) => s.id === selectedSession.id)
        if (updatedSession) {
          setSelectedSession(updatedSession)
        }
      }
      queryClient.invalidateQueries({ queryKey: ["live-chat-sessions"] })
    }
  })

  // Finalizar atendimento
  const finishChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/finish`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Erro ao finalizar chat")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-chat-sessions"] })
      setSelectedSession(null)
      toast({
        title: "Atendimento finalizado",
        description: "O chat foi encerrado com sucesso.",
      })
    }
  })

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!socket) return

    socket.on("chat:new_message", (data: any) => {
      // Invalidar query para forçar atualização
      queryClient.invalidateQueries({ queryKey: ["live-chat-sessions"] })
    })

    socket.on("chat:escalated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["live-chat-sessions"] })
      toast({
        title: "Novo chat na fila!",
        description: `${data.userName || "Cliente"} está aguardando atendimento`,
        action: (
          <Button
            size="sm"
            onClick={() => assumeChatMutation.mutate(data.sessionId)}
          >
            Atender
          </Button>
        )
      })
    })

    return () => {
      socket.off("chat:new_message")
      socket.off("chat:escalated")
    }
  }, [socket])

  // Filtrar sessões por status
  const waitingSessions = sessions.filter((s: ChatSession) => s.status === "ESCALATED")
  const activeSessions = sessions.filter((s: ChatSession) => s.status === "ACTIVE")

  // Atualizar sessão selecionada quando sessions mudar
  useEffect(() => {
    if (selectedSession) {
      const updatedSession = sessions.find((s: ChatSession) => s.id === selectedSession.id)
      if (updatedSession) {
        setSelectedSession(updatedSession)
      }
    }
  }, [sessions])

  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedSession?.messages])

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!message.trim() || !selectedSession) return
    
    sendMessageMutation.mutate({
      sessionId: selectedSession.id,
      content: message
    })
  }

  // Calcular tempo de espera
  const getWaitingTime = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    return minutes
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Lista de Chats */}
        <div className="w-80 border-r bg-gray-50">
          <Tabs defaultValue="waiting" className="h-full flex flex-col">
            <TabsList className="m-4">
              <TabsTrigger value="waiting" className="flex-1">
                Em Espera ({waitingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Ativos ({activeSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="waiting" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {waitingSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum chat aguardando</p>
                    </div>
                  ) : (
                    waitingSessions.map((session: ChatSession) => (
                      <Card
                        key={session.id}
                        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => assumeChatMutation.mutate(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {(session.userName || session.userEmail || "?")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {session.userName || session.userEmail || "Cliente"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.client?.company || "Sem empresa"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-orange-500" />
                                <span className="text-xs text-orange-500">
                                  {getWaitingTime(session.createdAt)} min esperando
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Atender
                          </Button>
                        </div>
                        {session.ticket && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                          >
                            Ticket #{session.ticket.number}
                          </Badge>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum chat ativo</p>
                    </div>
                  ) : (
                    activeSessions.map((session: ChatSession) => (
                      <Card
                        key={session.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                          selectedSession?.id === session.id && "bg-blue-50 border-blue-300"
                        )}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {(session.userName || session.userEmail || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {session.userName || session.userEmail || "Cliente"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {session.client?.company || "Sem empresa"}
                            </p>
                            <Badge 
                              variant="default" 
                              className="mt-1 bg-green-500"
                            >
                              Em atendimento
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              {/* Header do Chat */}
              <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(selectedSession.userName || selectedSession.userEmail || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedSession.userName || selectedSession.userEmail || "Cliente"}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {selectedSession.userEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {selectedSession.userEmail}
                          </div>
                        )}
                        {selectedSession.userPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedSession.userPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.ticket && (
                      <Badge variant="outline">
                        Ticket #{selectedSession.ticket.number}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => finishChatMutation.mutate(selectedSession.id)}
                    >
                      Finalizar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {selectedSession.messages.map((msg: ChatMessage, index: number) => (
                    <div
                      key={msg.id || `msg-${index}`}
                      className={cn(
                        "flex animate-in fade-in slide-in-from-bottom-1",
                        msg.role === "USER" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.role === "USER"
                            ? "bg-gray-100 text-gray-900"
                            : "bg-[#0088FF] text-white"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.role === "ASSISTANT" && msg.confidence && (
                            <div className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              <span className="text-xs opacity-70">
                                IA ({Math.round(msg.confidence * 100)}%)
                              </span>
                            </div>
                          )}
                          <span className="text-xs opacity-70">
                            {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Nenhum chat selecionado</h3>
                <p className="text-sm">
                  Selecione um chat ativo ou assuma um chat em espera
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
