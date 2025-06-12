"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Users,
  Bot,
  CheckCircle2,
  XCircle,
  Send,
  Loader2
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

// Tipos temporários até o Prisma gerar os tipos corretos
interface ChatSession {
  id: string
  userName?: string | null
  userEmail?: string | null
  status: string
  createdAt: Date
  messages: ChatMessage[]
}

interface ChatMessage {
  id: string
  sessionId: string
  role: string
  content: string
  confidence?: number | null
  createdAt: Date
}

export function ChatPage() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Buscar sessões de chat
  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["chat-sessions", statusFilter, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/chat/sessions?status=${statusFilter}&search=${searchTerm}`)
      return response.json()
    },
  })

  // Buscar analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["chat-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/chat/analytics")
      return response.json()
    },
  })

  // Buscar mensagens da sessão selecionada
  const { data: sessionDetails } = useQuery({
    queryKey: ["chat-session", selectedSession],
    queryFn: async () => {
      if (!selectedSession) return null
      const response = await fetch(`/api/chat/sessions/${selectedSession}`)
      return response.json()
    },
    enabled: !!selectedSession,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "IDLE":
        return "bg-yellow-500"
      case "CLOSED":
        return "bg-gray-500"
      case "ESCALATED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativo"
      case "IDLE":
        return "Inativo"
      case "CLOSED":
        return "Fechado"
      case "ESCALATED":
        return "Escalado"
      default:
        return status
    }
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header com cor consistente */}
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Chat de Suporte</h1>
          <p className="text-sm text-gray-500">
            Gerencie e monitore as conversas do chat automatizado com IA
          </p>
        </div>

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de sessões */}
            <Card className="lg:col-span-1 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ACTIVE">Ativos</SelectItem>
                      <SelectItem value="ESCALATED">Escalados</SelectItem>
                      <SelectItem value="CLOSED">Fechados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {loadingSessions && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#2A65F9]" />
                      </div>
                    )}
                    {sessions?.map((session: ChatSession) => (
                      <div
                        key={session.id}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all",
                          selectedSession === session.id 
                            ? "bg-[#2A65F9]/10 border border-[#2A65F9]" 
                            : "hover:bg-gray-50 border border-transparent"
                        )}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">
                                {session.userName || session.userEmail || "Anônimo"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(session.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                            {session.messages && session.messages[0] && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {session.messages[0].content}
                              </p>
                            )}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>

            {/* Detalhes da conversa */}
            <Card className="lg:col-span-2">
              {sessionDetails ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {sessionDetails.userName || sessionDetails.userEmail || "Anônimo"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Iniciado em {format(new Date(sessionDetails.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={cn("text-white", getStatusColor(sessionDetails.status))}>
                        {getStatusText(sessionDetails.status)}
                      </Badge>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {sessionDetails.messages?.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.role === "USER" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%]",
                              message.role === "USER" ? "order-2" : ""
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.role === "ASSISTANT" && (
                                <Bot className="h-4 w-4 text-[#2A65F9]" />
                              )}
                              <span className="text-xs text-gray-500">
                                {format(new Date(message.createdAt), "HH:mm")}
                              </span>
                              {message.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {(message.confidence * 100).toFixed(0)}% confiança
                                </Badge>
                              )}
                            </div>
                            <div
                              className={cn(
                                "rounded-lg px-4 py-2",
                                message.role === "USER"
                                  ? "bg-[#2A65F9] text-white"
                                  : message.role === "SYSTEM"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione uma conversa para ver os detalhes</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Sessões</p>
                  <p className="text-2xl font-bold text-[#2E2E2E]">{analytics?.totalSessions || 0}</p>
                </div>
                <div className="h-12 w-12 bg-[#2A65F9]/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-[#2A65F9]" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolvidos por IA</p>
                  <p className="text-2xl font-bold text-[#2E2E2E]">{analytics?.resolvedByAI || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Escalados</p>
                  <p className="text-2xl font-bold text-[#2E2E2E]">{analytics?.escalatedToHuman || 0}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Confiança Média</p>
                  <p className="text-2xl font-bold text-[#2E2E2E]">
                    {analytics?.avgConfidence ? `${(analytics.avgConfidence * 100).toFixed(0)}%` : "N/A"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Perguntas Mais Frequentes</h3>
              <div className="space-y-3">
                {analytics?.topQuestions?.length > 0 ? (
                  analytics.topQuestions.map((q: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">{q.question}</p>
                      <Badge variant="secondary">{q.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma pergunta registrada ainda</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Tópicos com Baixa Confiança</h3>
              <div className="space-y-3">
                {analytics?.lowConfidenceTopics?.length > 0 ? (
                  analytics.lowConfidenceTopics.map((topic: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{topic.topic}</p>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {(topic.avgConfidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum tópico com baixa confiança</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configurações do Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações de Pré-atendimento */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Pré-atendimento</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mensagem de Boas-vindas</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    rows={3}
                    defaultValue="Olá! Sou o assistente virtual da Kirvano. Como posso ajudá-lo hoje?"
                    placeholder="Digite a mensagem de boas-vindas..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Perguntas Frequentes Iniciais</label>
                  <div className="space-y-2 mt-1">
                    <Input 
                      placeholder="Ex: Como criar uma conta?" 
                      defaultValue="Como criar uma conta?"
                      className="text-sm"
                    />
                    <Input 
                      placeholder="Ex: Como resetar minha senha?" 
                      defaultValue="Como resetar minha senha?"
                      className="text-sm"
                    />
                    <Input 
                      placeholder="Ex: Como funciona a plataforma?" 
                      defaultValue="Como funciona a plataforma?"
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" className="w-full">
                      <Bot className="h-4 w-4 mr-2" />
                      Adicionar Pergunta
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Horário de Atendimento</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input type="time" defaultValue="08:00" className="text-sm" />
                    <Input type="time" defaultValue="18:00" className="text-sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Fora deste horário, o chat informará sobre indisponibilidade
                  </p>
                </div>
              </div>
            </Card>

            {/* Configurações de IA */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Inteligência Artificial</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Modelo OpenAI</label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-1106-preview">GPT-4 Turbo Preview (Mais recente - Nov 2023)</SelectItem>
                      <SelectItem value="gpt-4-vision-preview">GPT-4 Vision (Com análise de imagens)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Mais rápido e eficiente)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Otimizado para custo)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Última versão estável)</SelectItem>
                      <SelectItem value="gpt-4-32k">GPT-4 32K (Contexto expandido)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4 (Mais preciso)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo-1106">GPT-3.5 Turbo Latest</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais econômico)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K (Contexto maior)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    GPT-4o é recomendado para melhor custo-benefício
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nível de Confiança para Escalar</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue="80" 
                      className="w-20 text-sm"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Respostas com confiança abaixo deste valor serão escaladas
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Temperatura da IA</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      defaultValue="0.3" 
                      className="w-20 text-sm"
                    />
                    <span className="text-xs text-gray-500">(0 = mais preciso, 1 = mais criativo)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Integração com Base de Conhecimento */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Base de Conhecimento</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pinecone Integrado</p>
                    <p className="text-xs text-gray-500">Busca semântica ativa</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Categorias Habilitadas</label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Geral</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Produtos</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Checkout e Conversão</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Integrações</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Número de Contextos</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      min="1" 
                      max="10" 
                      defaultValue="5" 
                      className="w-20 text-sm"
                    />
                    <span className="text-xs text-gray-500">documentos relevantes</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Configurações Avançadas */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-[#2E2E2E]">Configurações Avançadas</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Webhook de Escalação</label>
                  <Input 
                    type="url" 
                    placeholder="https://api.exemplo.com/webhook" 
                    className="mt-1 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL chamada quando uma conversa é escalada
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tempo Máximo de Inatividade</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      min="1" 
                      max="60" 
                      defaultValue="30" 
                      className="w-20 text-sm"
                    />
                    <span className="text-sm text-gray-500">minutos</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sessão será fechada após este período sem atividade
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Salvar histórico de conversas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Habilitar análise de sentimento</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Modo debug (logs detalhados)</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              Cancelar
            </Button>
            <Button className="bg-[#2A65F9] hover:bg-[#2A65F9]/90">
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  )
}
