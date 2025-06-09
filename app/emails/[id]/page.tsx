"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { EmailView } from "@/components/email-view"
import { ClientInfo } from "@/components/client-info"
import { EmailHistory } from "@/components/email-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Star, Archive } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import type { Email } from "@/types/email"

// Mock data para demonstração - incluindo e-mails arquivados
const allMockEmails: Email[] = [
  // === E-MAILS DE TESTE TEMPORÁRIOS (REMOVER DEPOIS) ===
  {
    id: "teste-cupom-001",
    subject: "Cupom de Desconto",
    sender: "cliente1@teste.com",
    senderName: "Maria Santos",
    date: new Date("2024-01-15T11:45:00"),
    status: "recebidos",
    body: "Não estou conseguindo criar um cupom de desconto. Como faço?",
    actions: [{ type: "received", timestamp: new Date("2024-01-15T11:45:00"), description: "E-mail recebido" }],
    isFavorite: false,
  },
  {
    id: "teste-saque-002",
    subject: "Saque",
    sender: "cliente2@teste.com",
    senderName: "João Silva",
    date: new Date("2024-01-15T11:30:00"),
    status: "recebidos",
    body: "Está dando erro para solicitar o saque. Como tenho que fazer? Preciso de ajuda.",
    actions: [{ type: "received", timestamp: new Date("2024-01-15T11:30:00"), description: "E-mail recebido" }],
    isFavorite: false,
  },
  {
    id: "teste-biometria-003",
    subject: "Biometria Recusada",
    sender: "cliente3@teste.com",
    senderName: "Ana Costa",
    date: new Date("2024-01-15T11:15:00"),
    status: "recebidos",
    body: "Fiz tudo correto no processo mas minha biometria não foi aceita, e por isso não consigo realizar saque. Preciso de ajuda para resolver isso",
    actions: [{ type: "received", timestamp: new Date("2024-01-15T11:15:00"), description: "E-mail recebido" }],
    isFavorite: false,
  },
  // === FIM DOS E-MAILS DE TESTE ===
  {
    id: "1",
    subject: "Problema com login na plataforma",
    sender: "cliente@empresa.com",
    senderName: "João Silva",
    date: new Date("2024-01-15T10:30:00"),
    status: "recebidos",
    body: "Olá, estou tendo dificuldades para fazer login na plataforma. Sempre que tento entrar, aparece uma mensagem de erro. Podem me ajudar?",
    actions: [{ type: "received", timestamp: new Date("2024-01-15T10:30:00"), description: "E-mail recebido" }],
    isFavorite: false,
  },
  {
    id: "2",
    subject: "Solicitação de reembolso",
    sender: "maria@cliente.com",
    senderName: "Maria Santos",
    date: new Date("2024-01-15T09:15:00"),
    status: "aguardando",
    body: "Gostaria de solicitar o reembolso da compra realizada no dia 10/01. O produto chegou com defeito.",
    suggestedResponse:
      "Olá Maria, lamentamos o inconveniente. Vamos processar seu reembolso em até 5 dias úteis. Por favor, nos envie uma foto do produto com defeito para agilizar o processo.",
    actions: [
      { type: "received", timestamp: new Date("2024-01-15T09:15:00"), description: "E-mail recebido" },
      { type: "ai_suggested", timestamp: new Date("2024-01-15T09:16:00"), description: "IA sugeriu resposta" },
    ],
    isFavorite: false,
  },
  {
    id: "3",
    subject: "Dúvida sobre funcionalidades",
    sender: "pedro@startup.com",
    senderName: "Pedro Costa",
    date: new Date("2024-01-15T08:45:00"),
    status: "respondidos",
    body: "Quais são as principais funcionalidades disponíveis no plano premium?",
    aiResponse:
      "Olá Pedro! O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas e armazenamento ilimitado. Gostaria de agendar uma demonstração?",
    actions: [
      { type: "received", timestamp: new Date("2024-01-15T08:45:00"), description: "E-mail recebido" },
      { type: "ai_responded", timestamp: new Date("2024-01-15T08:46:00"), description: "IA respondeu automaticamente" },
    ],
    isFavorite: true,
  },
  {
    id: "4",
    subject: "Parabéns pelo excelente atendimento",
    sender: "ana@cliente.com",
    senderName: "Ana Oliveira",
    date: new Date("2024-01-14T16:20:00"),
    status: "resolvidos",
    body: "Quero parabenizar a equipe pelo excelente atendimento. Meu problema foi resolvido rapidamente!",
    actions: [
      { type: "received", timestamp: new Date("2024-01-14T16:20:00"), description: "E-mail recebido" },
      { type: "resolved", timestamp: new Date("2024-01-14T16:25:00"), description: "Marcado como resolvido" },
    ],
    isFavorite: false,
  },
  {
    id: "5",
    subject: "Problema técnico complexo",
    sender: "suporte@empresa.com",
    senderName: "Carlos Mendes",
    date: new Date("2024-01-14T14:10:00"),
    status: "pendentes",
    body: "Estamos enfrentando um problema técnico muito específico que requer análise detalhada da nossa infraestrutura. O sistema está apresentando lentidão em horários de pico.",
    actions: [
      { type: "received", timestamp: new Date("2024-01-14T14:10:00"), description: "E-mail recebido" },
      {
        type: "escalated",
        timestamp: new Date("2024-01-14T14:15:00"),
        description: "Encaminhado para especialista humano",
      },
    ],
    isFavorite: false,
  },
  {
    id: "6",
    subject: "Confirmação de pagamento",
    sender: "financeiro@empresa.com",
    senderName: "Financeiro",
    date: new Date("2024-01-10T09:30:00"),
    status: "arquivados",
    body: "Confirmamos o recebimento do pagamento referente à fatura #12345. Obrigado!",
    actions: [
      { type: "received", timestamp: new Date("2024-01-10T09:30:00"), description: "E-mail recebido" },
      { type: "archived", timestamp: new Date("2024-01-10T10:15:00"), description: "E-mail arquivado" },
    ],
    isFavorite: false,
  },
  {
    id: "7",
    subject: "Atualização de sistema",
    sender: "sistema@empresa.com",
    senderName: "Sistema",
    date: new Date("2024-01-08T14:20:00"),
    status: "arquivados",
    body: "Informamos que realizaremos uma atualização de sistema no dia 15/01 às 22h. O sistema ficará indisponível por aproximadamente 2 horas.",
    actions: [
      { type: "received", timestamp: new Date("2024-01-08T14:20:00"), description: "E-mail recebido" },
      { type: "archived", timestamp: new Date("2024-01-08T14:25:00"), description: "E-mail arquivado" },
    ],
    isFavorite: true,
  },
]

// Mock data para histórico de e-mails anteriores do mesmo cliente
const mockPreviousEmails: Email[] = [
  {
    id: "101",
    subject: "Dúvida sobre planos",
    sender: "cliente@empresa.com",
    senderName: "João Silva",
    date: new Date("2024-01-10T14:25:00"),
    status: "resolvidos",
    body: "Olá, gostaria de saber mais detalhes sobre os planos disponíveis.",
    actions: [
      { type: "received", timestamp: new Date("2024-01-10T14:25:00"), description: "E-mail recebido" },
      { type: "responded", timestamp: new Date("2024-01-10T15:30:00"), description: "Respondido por Ana" },
      { type: "resolved", timestamp: new Date("2024-01-11T09:15:00"), description: "Marcado como resolvido" },
    ],
    isFavorite: false,
  },
  {
    id: "102",
    subject: "Problema com pagamento",
    sender: "cliente@empresa.com",
    senderName: "João Silva",
    date: new Date("2023-12-05T10:15:00"),
    status: "resolvidos",
    body: "Estou tentando fazer o pagamento da assinatura, mas está dando erro no cartão.",
    actions: [
      { type: "received", timestamp: new Date("2023-12-05T10:15:00"), description: "E-mail recebido" },
      { type: "responded", timestamp: new Date("2023-12-05T11:20:00"), description: "Respondido por Carlos" },
      { type: "resolved", timestamp: new Date("2023-12-06T14:30:00"), description: "Marcado como resolvido" },
    ],
    isFavorite: false,
  },
]

// Função para inicializar o localStorage com os dados mock
const initializeLocalStorage = () => {
  try {
    // Verificar se já existe dados no localStorage
    const storedEmails = localStorage.getItem("inboxpilot_emails")
    if (!storedEmails) {
      // Se não existir, inicializar com os dados mock
      localStorage.setItem("inboxpilot_emails", JSON.stringify(allMockEmails))
      localStorage.setItem("inboxpilot_archived", JSON.stringify([]))
    }
  } catch (error) {
    console.error("Erro ao inicializar localStorage:", error)
  }
}

// Função para obter e-mails do localStorage
const getEmailsFromStorage = () => {
  try {
    const storedEmails = localStorage.getItem("inboxpilot_emails")
    return storedEmails ? JSON.parse(storedEmails) : allMockEmails
  } catch (error) {
    console.error("Erro ao obter e-mails do localStorage:", error)
    return allMockEmails
  }
}

// Função para atualizar um e-mail no localStorage
const updateEmailInStorage = (updatedEmail: Email) => {
  try {
    // Obter e-mails atuais
    const currentEmails = getEmailsFromStorage()

    // Encontrar e atualizar o e-mail
    const updatedEmails = currentEmails.map((email: Email) =>
      email.id === updatedEmail.id
        ? {
            ...updatedEmail,
            actions: updatedEmail.actions.map((action) => ({
              ...action,
              timestamp: action.timestamp instanceof Date ? action.timestamp.toISOString() : action.timestamp,
            })),
          }
        : email,
    )

    // Salvar de volta no localStorage
    localStorage.setItem("inboxpilot_emails", JSON.stringify(updatedEmails))

    console.log("💾 E-mail atualizado no localStorage:", updatedEmail)
    return true
  } catch (error) {
    console.error("Erro ao atualizar e-mail no localStorage:", error)
    return false
  }
}

export default function EmailDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [previousEmails, setPreviousEmails] = useState<Email[]>([])
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isClientInfoOpen, setIsClientInfoOpen] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Usar um ID estável para o useEffect
  const emailId = params?.id as string

  // Inicializar localStorage quando o componente montar
  useEffect(() => {
    initializeLocalStorage()
  }, [])

  useEffect(() => {
    // Evitar múltiplas execuções
    if (dataLoaded) return

    const loadData = () => {
      if (!emailId) {
        setLoading(false)
        return
      }

      // Buscar o e-mail no localStorage
      const storedEmails = getEmailsFromStorage()
      const foundEmail = storedEmails.find((e: Email) => e.id === emailId)

      if (foundEmail) {
        // Converter datas de string para Date
        const emailWithDates = {
          ...foundEmail,
          date: new Date(foundEmail.date),
          actions: foundEmail.actions.map((action: any) => ({
            ...action,
            timestamp: new Date(action.timestamp),
          })),
        }

        setEmail(emailWithDates)

        // Buscar histórico do mesmo remetente
        const senderPreviousEmails = mockPreviousEmails.filter((e) => e.sender === foundEmail.sender)
        setPreviousEmails(senderPreviousEmails)

        // Verificar se deve abrir o formulário de resposta
        const shouldReply = searchParams?.get("reply") === "true"
        if (shouldReply) {
          setIsReplying(true)
          // Se houver resposta sugerida, usá-la como base
          if (foundEmail.suggestedResponse) {
            setReplyText(foundEmail.suggestedResponse)
          }
        }
      }

      setLoading(false)
      setDataLoaded(true)
    }

    loadData()
  }, [emailId, searchParams, dataLoaded])

  const handleBack = () => {
    router.push("/emails")
  }

  const handleFavorite = () => {
    if (email) {
      const newFavoriteState = !email.isFavorite
      const updatedEmailData = { ...email, isFavorite: newFavoriteState }

      // Atualizar estado local
      setEmail(updatedEmailData)

      // Atualizar no localStorage
      updateEmailInStorage(updatedEmailData)

      toast({
        title: newFavoriteState ? "E-mail favoritado" : "E-mail desfavoritado",
        description: newFavoriteState
          ? "O e-mail foi adicionado aos favoritos."
          : "O e-mail foi removido dos favoritos.",
        duration: 3000,
      })
    }
  }

  const handleArchive = () => {
    if (email) {
      // Adicionar ação de arquivamento
      const now = new Date()
      const updatedEmailData = {
        ...email,
        status: "arquivados" as const,
        actions: [...email.actions, { type: "archived" as const, timestamp: now, description: "E-mail arquivado" }],
      }

      // Atualizar no localStorage
      updateEmailInStorage(updatedEmailData)

      toast({
        title: "E-mail arquivado",
        description: "O e-mail foi movido para a pasta de arquivados.",
        duration: 3000,
      })

      // Redirecionar para a lista de e-mails após arquivar
      setTimeout(() => {
        router.push("/emails")
      }, 1000)
    }
  }

  const handleReply = () => {
    setIsReplying(true)
  }

  const handleUpdateEmail = (updatedEmailData: Email) => {
    // Atualizar o estado local
    setEmail(updatedEmailData)

    // Atualizar no localStorage
    const success = updateEmailInStorage(updatedEmailData)

    if (success) {
      // Forçar re-render para mostrar o histórico atualizado
      setEmail({ ...updatedEmailData })
    }

    console.log("📧 E-mail atualizado globalmente:", updatedEmailData)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-[#0088FF] animate-spin mb-4" />
            <p className="text-sm text-gray-500">Carregando e-mail...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!email) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-xl font-medium text-gray-700 mb-2">E-mail não encontrado</h2>
          <p className="text-gray-500 mb-6">O e-mail que você está procurando não existe ou foi removido.</p>
          <Button onClick={handleBack}>Voltar para Caixa de Entrada</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-semibold text-[#0088FF]">{email.subject}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={email.isFavorite ? "text-amber-500" : "text-gray-400"}
                  onClick={handleFavorite}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{email.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400" onClick={handleArchive}>
                  <Archive className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Arquivar e-mail</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" className="ml-2" onClick={() => setIsClientInfoOpen(!isClientInfoOpen)}>
            {isClientInfoOpen ? "Ocultar Detalhes" : "Mostrar Detalhes"}
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className={`transition-all duration-300 ${isClientInfoOpen ? "w-3/4 pr-6" : "w-full"}`}>
          <EmailView
            email={email}
            isReplying={isReplying}
            setIsReplying={setIsReplying}
            replyText={replyText}
            setReplyText={setReplyText}
            isSending={isSending}
            setIsSending={setIsSending}
            onReply={handleReply}
            onUpdateEmail={handleUpdateEmail}
          />
        </div>

        {isClientInfoOpen && (
          <div className="w-1/4 space-y-4 animate-in slide-in-from-right duration-300">
            <ClientInfo email={email} />
            <EmailHistory emails={previousEmails} />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
