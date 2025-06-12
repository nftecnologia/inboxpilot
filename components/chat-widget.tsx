"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Loader2, ChevronDown, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/useSocket"
// Tipos locais já que @prisma/client não exporta diretamente
interface ChatMessage {
  id: string
  sessionId: string
  role: string
  content: string
  confidence?: number | null
  createdAt: Date | string
  metadata?: any
}

interface ChatSession {
  id: string
  userName?: string | null
  userEmail?: string | null
  userPhone?: string | null
  status: string
  createdAt: Date | string
  metadata?: any
}

interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left"
  primaryColor?: string
  title?: string
  subtitle?: string
  placeholder?: string
  welcomeMessage?: string
}

export function ChatWidget({
  position = "bottom-right",
  primaryColor = "#2A65F9",
  title = "Suporte Kirvano",
  subtitle = "Estamos aqui para ajudar!",
  placeholder = "Digite sua mensagem...",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [shouldEscalate, setShouldEscalate] = useState(false)
  const [showUserForm, setShowUserForm] = useState(true)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const socket = useSocket()

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Não criar sessão automaticamente - aguardar dados do usuário

  // Conectar ao Socket.io para receber mensagens em tempo real
  useEffect(() => {
    if (socket && session) {
      // Entrar na sala do chat (formato correto)
      socket.emit("join", `chat:${session.id}`)
      
      // Escutar mensagens do agente
      socket.on("new-message", (data: any) => {
        // Se tem a estrutura {message, from}
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
        } else {
          // Se é diretamente a mensagem
          setMessages((prev) => [...prev, data])
        }
      })
      
      // Escutar quando agente assume o chat
      socket.on("chat:assumed", (data: any) => {
        const systemMessage: Partial<ChatMessage> = {
          id: `system-${Date.now()}`,
          sessionId: session.id,
          role: "SYSTEM",
          content: `${data.agent.name} assumiu o chat`,
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, systemMessage as ChatMessage])
      })

      return () => {
        socket.emit("leave", `chat:${session.id}`)
        socket.off("new-message")
        socket.off("chat:assumed")
      }
    }
  }, [socket, session])
  // Buscar mensagens após criar sessão e fazer polling
  useEffect(() => {
    if (session?.id) {
      // Função para buscar mensagens
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/chat/sessions/${session.id}/messages`)
          if (response.ok) {
            const messages = await response.json()
            if (Array.isArray(messages)) {
              setMessages(messages)
            }
          }
        } catch (error) {
          console.error('Erro ao buscar mensagens:', error)
        }
      }
      
      // Buscar imediatamente
      fetchMessages()
      
      // Configurar polling a cada 2 segundos
      const interval = setInterval(fetchMessages, 2000)
      
      // Limpar intervalo ao desmontar
      return () => clearInterval(interval)
    }
  }, [session?.id])

  const createSession = async () => {
    // Validar dados do usuário
    if (!userData.name || !userData.email || !userData.phone) {
      return // Não criar sessão sem dados obrigatórios
    }

    try {
      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userData.name,
          userEmail: userData.email,
          userPhone: userData.phone,
          source: "widget",
          metadata: { userAgent: navigator.userAgent },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        setMessages([data.welcomeMessage])
        setShowUserForm(false)
        
        // Definir perguntas sugeridas da mensagem de boas-vindas
        if (data.welcomeMessage.metadata?.suggestedQuestions) {
          setSuggestedQuestions(data.welcomeMessage.metadata.suggestedQuestions)
        }
      }
    } catch (error) {
      console.error("Erro ao criar sessão:", error)
    }
  }

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSession()
  }

  const sendMessage = async (content: string) => {
    if (!session || !content.trim()) return

    // Adicionar mensagem do usuário localmente
    const userMessage: Partial<ChatMessage> = {
      id: `temp-${Date.now()}`,
      sessionId: session.id,
      role: "USER",
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage as ChatMessage])
    setInput("")
    setIsLoading(true)
    setSuggestedQuestions([])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Remover mensagem temporária e adicionar resposta real
        setMessages((prev) => 
          prev.filter((msg) => !msg.id.startsWith("temp-"))
        )
        
        if (data.suggestedQuestions) {
          setSuggestedQuestions(data.suggestedQuestions)
        }
        
        if (data.shouldEscalate) {
          setShouldEscalate(true)
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      // Remover mensagem temporária em caso de erro
      setMessages((prev) => 
        prev.filter((msg) => !msg.id.startsWith("temp-"))
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const escalateToHuman = async () => {
    if (!session) return

    try {
      const response = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })

      if (response.ok) {
        // Adicionar mensagem informando que está sendo transferido
        const systemMessage: Partial<ChatMessage> = {
          id: `system-${Date.now()}`,
          sessionId: session.id,
          role: "SYSTEM",
          content: "Você está sendo transferido para um atendente humano. Por favor, aguarde...",
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, systemMessage as ChatMessage])
        setShouldEscalate(false)
      }
    } catch (error) {
      console.error("Erro ao escalar chat:", error)
    }
  }

  const closeChat = async () => {
    if (session) {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })
    }
    setIsOpen(false)
    setSession(null)
    setMessages([])
    setSuggestedQuestions([])
    setShouldEscalate(false)
    setShowUserForm(true)
    setUserData({ name: "", email: "", phone: "" })
  }

  const positionClasses = position === "bottom-right" 
    ? "bottom-4 right-4" 
    : "bottom-4 left-4"

  return (
    <>
      {/* Botão flutuante */}
      <div className={cn("fixed z-50", positionClasses)}>
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Widget do chat */}
      {isOpen && (
        <Card className={cn(
          "fixed z-50 w-[420px] h-[650px] flex flex-col shadow-2xl border-0 overflow-hidden",
          positionClasses
        )}>
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 text-white rounded-t-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm opacity-90">{subtitle}</p>
            </div>
            <Button
              onClick={closeChat}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Formulário de dados do usuário */}
          {showUserForm ? (
            <form onSubmit={handleUserFormSubmit} className="flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Antes de começar...</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Para oferecer um melhor atendimento, precisamos de algumas informações:
                  </p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nome completo *
                  </label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    E-mail *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Telefone *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                  disabled={!userData.name || !userData.email || !userData.phone}
                >
                  Iniciar conversa
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Seus dados serão usados apenas para este atendimento
                </p>
              </div>
            </form>
          ) : (
          /* Área de mensagens */
          <ScrollArea className="flex-1 p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                    message.role === "USER" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      message.role === "USER" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      <AvatarFallback className={cn(
                        message.role === "USER" 
                          ? "bg-blue-500 text-white" 
                          : message.role === "SYSTEM"
                          ? "bg-gray-500 text-white"
                          : "bg-green-500 text-white"
                      )}>
                        {message.role === "USER" ? "V" : 
                         message.role === "SYSTEM" ? "S" : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      {/* Nome/Role do remetente */}
                      <span className={cn(
                        "text-xs font-medium px-2",
                        message.role === "USER" ? "text-right" : "text-left",
                        message.role === "SYSTEM" ? "text-gray-500" : "text-gray-700"
                      )}>
                        {message.role === "USER" ? "Você" : 
                         message.role === "SYSTEM" ? "Sistema" : 
                         message.role === "ASSISTANT" && message.metadata?.isHuman ? "Atendente" : "Assistente IA"}
                      </span>
                      
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2.5 shadow-sm",
                          message.role === "USER"
                            ? "bg-blue-500 text-white"
                            : message.role === "SYSTEM"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : message.role === "ASSISTANT" && message.metadata?.isHuman
                            ? "bg-green-100 text-green-900 border border-green-200"
                            : "bg-white text-gray-900 border border-gray-200"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {/* Timestamp */}
                        <p className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === "USER" ? "text-blue-100" : "text-gray-500"
                        )}>
                          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {message.confidence && message.confidence < 0.8 && (
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs border-orange-300 text-orange-600"
                          >
                            Confiança: {(message.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2">
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gray-500 text-white">A</AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">Digitando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          )}

          {/* Perguntas sugeridas */}
          {!showUserForm && suggestedQuestions.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Perguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Aviso de escalação */}
          {!showUserForm && shouldEscalate && (
            <div className="mx-4 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 mb-2">
                Esta questão pode precisar de atendimento humano.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={escalateToHuman}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Falar com Atendente
              </Button>
            </div>
          )}

          {/* Input de mensagem */}
          {!showUserForm && (
          <div className="border-t">
            {/* Botão de atendimento humano */}
            <div className="p-2 border-b bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={escalateToHuman}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Prefiro falar com um atendente
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4" />
              </Button>
              </div>
            </form>
          </div>
          )}
        </Card>
      )}
    </>
  )
}
