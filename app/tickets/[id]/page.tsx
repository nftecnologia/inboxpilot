"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Clock, 
  User, 
  Calendar, 
  MessageSquare, 
  ChevronRight,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Timer,
  Building,
  Mail,
  Phone,
  Hash,
  FileText
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TicketInteraction {
  id: string
  type: string
  content: string
  createdAt: string
  user?: {
    id: string
    name: string | null
    email: string
  }
}

interface Ticket {
  id: string
  number: number
  subject: string
  description: string
  status: string
  priority: string
  category: string | null
  source: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  client: {
    id: string
    name: string | null
    email: string
    phone: string | null
    company: string | null
  }
  interactions: TicketInteraction[]
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
  chatSession?: {
    id: string
    messages: Array<{
      id: string
      role: string
      content: string
      createdAt: string
    }>
  }
}

const statusConfig = {
  OPEN: { label: "Aberto", color: "bg-blue-500", icon: AlertCircle },
  IN_PROGRESS: { label: "Em Andamento", color: "bg-yellow-500", icon: Timer },
  RESOLVED: { label: "Resolvido", color: "bg-green-500", icon: CheckCircle },
  CLOSED: { label: "Fechado", color: "bg-gray-500", icon: CheckCircle }
}

const priorityConfig = {
  LOW: { label: "Baixa", color: "text-blue-600 bg-blue-50" },
  MEDIUM: { label: "Média", color: "text-yellow-600 bg-yellow-50" },
  HIGH: { label: "Alta", color: "text-orange-600 bg-orange-50" },
  URGENT: { label: "Urgente", color: "text-red-600 bg-red-50" }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [response, setResponse] = useState("")

  // Buscar detalhes do ticket
  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ["ticket", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${params.id}`)
      if (!response.ok) throw new Error("Erro ao buscar ticket")
      return response.json()
    }
  })

  // Adicionar resposta ao ticket
  const addResponseMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/tickets/${params.id}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "RESPONSE",
          content 
        })
      })
      if (!response.ok) throw new Error("Erro ao adicionar resposta")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", params.id] })
      setResponse("")
      toast({
        title: "Resposta enviada!",
        description: "A resposta foi adicionada ao ticket.",
      })
    }
  })

  // Atualizar status do ticket
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error("Erro ao atualizar status")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", params.id] })
      toast({
        title: "Status atualizado!",
        description: "O status do ticket foi alterado com sucesso.",
      })
    }
  })

  // Assumir ticket
  const assignTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tickets/${params.id}/assign`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Erro ao assumir ticket")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", params.id] })
      toast({
        title: "Ticket assumido!",
        description: "Você agora é responsável por este ticket.",
      })
    }
  })

  const handleSendResponse = () => {
    if (!response.trim()) return
    addResponseMutation.mutate(response)
  }

  const getTimeElapsed = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    return `${hours}h`
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando ticket...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Ticket não encontrado</h3>
            <p className="text-gray-600 mt-2">O ticket solicitado não existe ou foi removido.</p>
            <Button onClick={() => router.push("/tickets")} className="mt-4">
              Voltar aos Tickets
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.OPEN
  const StatusIcon = statusInfo.icon

  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/tickets")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-gray-500" />
              <h1 className="text-2xl font-bold">Ticket #{ticket.number}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
                {!ticket.assignee && (
              <Button
                onClick={() => assignTicketMutation.mutate()}
                disabled={assignTicketMutation.isPending}
              >
                Assumir Ticket
              </Button>
            )}
            <Badge 
              className={cn(
                "text-white",
                statusInfo.color
              )}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Ticket */}
            <Card>
              <CardHeader>
                <CardTitle>{ticket.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeElapsed(ticket.createdAt)} em aberto
                  </div>
                  <Badge className={priorityConfig[ticket.priority as keyof typeof priorityConfig].color}>
                    {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chat do Ticket (se houver) */}
            {ticket.chatSession && ticket.chatSession.messages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversa do Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {ticket.chatSession.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
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
                            <p className="text-xs opacity-70 mb-1">
                              {msg.role === "USER" ? "Cliente" : "Assistente"} • 
                              {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Interações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                      {ticket.interactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Nenhuma interação registrada ainda.
                        </p>
                      ) : (
                        ticket.interactions.map((interaction) => (
                          <div key={interaction.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {interaction.user?.name || interaction.user?.email || "Sistema"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(interaction.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <Badge variant="outline">{interaction.type}</Badge>
                            </div>
                            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{interaction.content}</p>
                          </div>
                        ))
                      )}
                </div>

                {/* Adicionar Resposta */}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-medium">Adicionar Resposta</h4>
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleSendResponse}
                      disabled={!response.trim() || addResponseMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{ticket.client.name || "Sem nome"}</p>
                  {ticket.client.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3" />
                      {ticket.client.company}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${ticket.client.email}`} className="text-blue-600 hover:underline">
                      {ticket.client.email}
                    </a>
                  </div>
                  {ticket.client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${ticket.client.phone}`} className="text-blue-600 hover:underline">
                        {ticket.client.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Prioridade</p>
                  <Badge className={cn("mt-1", priorityConfig[ticket.priority as keyof typeof priorityConfig]?.color || "text-gray-600 bg-gray-50")}>
                    {priorityConfig[ticket.priority as keyof typeof priorityConfig]?.label || ticket.priority}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-medium">{ticket.category || "Sem categoria"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Origem</p>
                  <p className="font-medium capitalize">{ticket.source}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Responsável</p>
                  <p className="font-medium">
                    {ticket.assignee ? ticket.assignee.name || ticket.assignee.email : "Não atribuído"}
                  </p>
                </div>

                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Resolvido em</p>
                    <p className="font-medium">
                      {format(new Date(ticket.resolvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
