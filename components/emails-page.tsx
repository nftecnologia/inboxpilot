"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, Star, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailList } from "@/components/email-list"
import { AppLayout } from "@/components/app-layout"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useGetEmails } from "@/hooks/useQueries/useGetEmails"
import { useUpdateEmail } from "@/hooks/useMutations/useUpdateEmail"
import type { Email } from "@/types/email"

// Simulação da base de conhecimento
const knowledgeBase = [
  {
    id: "1",
    title: "Como resetar senha",
    category: "Cadastro e Conta",
    content:
      "Para resetar a senha: 1) Acesse a página de login 2) Clique em 'Esqueci minha senha' 3) Digite seu e-mail 4) Verifique sua caixa de entrada 5) Clique no link recebido 6) Defina uma nova senha",
    keywords: ["senha", "login", "resetar", "esqueci", "acesso"],
  },
  {
    id: "2",
    title: "Política de reembolso",
    category: "Checkout e Conversão",
    content:
      "Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação.",
    keywords: ["reembolso", "devolução", "compra", "defeito", "produto"],
  },
  {
    id: "3",
    title: "Funcionalidades do plano premium",
    category: "Produtos",
    content:
      "O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta.",
    keywords: ["premium", "plano", "funcionalidades", "recursos", "upgrade"],
  },
  {
    id: "4",
    title: "Problemas de conectividade",
    category: "Integrações",
    content:
      "Para resolver problemas de conectividade: 1) Verifique sua conexão com a internet 2) Limpe o cache do navegador 3) Desative extensões 4) Tente usar outro navegador 5) Entre em contato se o problema persistir",
    keywords: ["conectividade", "conexão", "internet", "lentidão", "erro"],
  },
  {
    id: "5",
    title: "Horário de atendimento",
    category: "Geral",
    content:
      "Nosso atendimento funciona de segunda a sexta-feira, das 8h às 18h. Aos sábados das 9h às 14h. Domingos e feriados não há atendimento. Para urgências, use o chat online.",
    keywords: ["atendimento", "horário", "suporte", "contato", "urgência"],
  },
]

// Função para analisar e-mail e determinar categoria baseada na base de conhecimento
const analyzeEmailContent = (emailBody: string, emailSubject: string): string => {
  const content = (emailBody + " " + emailSubject).toLowerCase()

  for (const knowledge of knowledgeBase) {
    const matchCount = knowledge.keywords.filter((keyword) => content.includes(keyword.toLowerCase())).length

    if (matchCount > 0) {
      return knowledge.category
    }
  }

  return "Geral" // Categoria padrão se não encontrar correspondência
}

// Função para gerar resposta baseada na base de conhecimento
const generateAIResponse = (emailBody: string, emailSubject: string, senderName: string): string => {
  const content = (emailBody + " " + emailSubject).toLowerCase()

  for (const knowledge of knowledgeBase) {
    const matchCount = knowledge.keywords.filter((keyword) => content.includes(keyword.toLowerCase())).length

    if (matchCount > 0) {
      return `Olá ${senderName},\n\n${knowledge.content}\n\nSe precisar de mais informações, não hesite em entrar em contato.\n\nAtenciosamente,\nEquipe de Suporte`
    }
  }

  return `Olá ${senderName},\n\nAgradecemos seu contato. Recebemos sua mensagem e estamos analisando o caso. Em breve retornaremos com mais informações.\n\nAtenciosamente,\nEquipe de Suporte`
}

// Mock data para demonstração - com categorias da base de conhecimento
const mockEmails: Email[] = [
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
    // Sem knowledgeCategory pois está em "recebidos"
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
      "Olá Maria, lamentamos o inconveniente. Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação. Por favor, nos envie uma foto do produto com defeito para agilizar o processo.",
    actions: [
      { type: "received", timestamp: new Date("2024-01-15T09:15:00"), description: "E-mail recebido" },
      { type: "ai_suggested", timestamp: new Date("2024-01-15T09:16:00"), description: "IA sugeriu resposta" },
    ],
    isFavorite: false,
    knowledgeCategory: "Checkout e Conversão",
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
      "Olá Pedro! O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta. Gostaria de agendar uma demonstração?",
    actions: [
      { type: "received", timestamp: new Date("2024-01-15T08:45:00"), description: "E-mail recebido" },
      { type: "ai_responded", timestamp: new Date("2024-01-15T08:46:00"), description: "IA respondeu automaticamente" },
    ],
    isFavorite: true,
    knowledgeCategory: "Produtos",
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
    knowledgeCategory: "Geral",
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
    knowledgeCategory: "Integrações",
  },
]

// E-mails arquivados
const archivedEmails: Email[] = [
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
    knowledgeCategory: "Checkout e Conversão",
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
    knowledgeCategory: "Geral",
  },
]

// Função para inicializar o localStorage com os dados mock
const initializeLocalStorage = () => {
  try {
    // Verificar se já existe dados no localStorage
    const storedEmails = localStorage.getItem("inboxpilot_emails")
    const storedArchived = localStorage.getItem("inboxpilot_archived")

    if (!storedEmails) {
      // Se não existir, inicializar com os dados mock
      localStorage.setItem("inboxpilot_emails", JSON.stringify(mockEmails))
    }

    if (!storedArchived) {
      localStorage.setItem("inboxpilot_archived", JSON.stringify(archivedEmails))
    }
  } catch (error) {
    console.error("Erro ao inicializar localStorage:", error)
  }
}

// Função para obter e-mails do localStorage
const getEmailsFromStorage = () => {
  try {
    const storedEmails = localStorage.getItem("inboxpilot_emails")
    return storedEmails ? JSON.parse(storedEmails) : mockEmails
  } catch (error) {
    console.error("Erro ao obter e-mails do localStorage:", error)
    return mockEmails
  }
}

// Função para obter e-mails arquivados do localStorage
const getArchivedFromStorage = () => {
  try {
    const storedArchived = localStorage.getItem("inboxpilot_archived")
    return storedArchived ? JSON.parse(storedArchived) : archivedEmails
  } catch (error) {
    console.error("Erro ao obter e-mails arquivados do localStorage:", error)
    return archivedEmails
  }
}

export function EmailsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [filters, setFilters] = useState({
    dateRange: "today",
    status: {
      recebidos: false,
      pendentes: false,
      respondidos: false,
      resolvidos: false,
    },
    sender: "",
    favorites: false,
  })
  const router = useRouter()

  // Buscar emails da API
  const { 
    data: emails = [], 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useGetEmails({
    ...(activeTab !== "todos" && activeTab !== "arquivados" && { status: activeTab }),
    limit: 100
  })

  // Hook para atualizar emails
  const updateEmailMutation = useUpdateEmail()

  const getEmailsByStatus = (status: string) => {
    let emailList = emails

    // Aplicar filtros
    if (filters.favorites) {
      emailList = emailList.filter((email: any) => email.isFavorite)
    }

    if (status === "todos") return emailList
    return emailList.filter((email: any) => email.status === status)
  }

  const getTabCount = (status: string) => {
    return getEmailsByStatus(status).length
  }

  const handleSelectEmail = (email: Email) => {
    console.log("Selecionando e-mail:", email.id)
    // Redirecionar para a página de visualização detalhada do e-mail
    router.push(`/emails/${email.id}`)
  }

  const handleFavorite = (emailId: string) => {
    const email = emails.find((e: any) => e.id === emailId)
    if (!email) return

    updateEmailMutation.mutate({
      id: emailId,
      data: { isStarred: !email.isStarred }
    }, {
      onSuccess: () => {
        toast({
          title: !email.isStarred ? "E-mail favoritado" : "E-mail desfavoritado",
          description: !email.isStarred
            ? "O e-mail foi adicionado aos favoritos."
            : "O e-mail foi removido dos favoritos.",
        })
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o e-mail.",
          variant: "destructive",
        })
      }
    })
  }

  const handleReply = (emailId: string) => {
    console.log("Respondendo e-mail:", emailId)
    try {
      // Redirecionar para a página do e-mail com parâmetro de resposta
      router.push(`/emails/${emailId}?reply=true`)
    } catch (error) {
      console.error("Erro ao redirecionar:", error)
      toast({
        title: "Erro ao responder",
        description: "Não foi possível abrir o formulário de resposta.",
        variant: "destructive",
      })
    }
  }

  const handleArchive = (emailId: string) => {
    updateEmailMutation.mutate({
      id: emailId,
      data: { status: "arquivados" }
    }, {
      onSuccess: () => {
        toast({
          title: "E-mail arquivado",
          description: "O e-mail foi movido para a pasta de arquivados.",
        })
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível arquivar o e-mail.",
          variant: "destructive",
        })
      }
    })
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: "today",
      status: {
        recebidos: false,
        pendentes: false,
        respondidos: false,
        resolvidos: false,
      },
      sender: "",
      favorites: false,
    })
  }

  const handleApplyFilters = () => {
    toast({
      title: "Filtros aplicados",
      description: "Os filtros foram aplicados com sucesso.",
      duration: 3000,
    })
  }

  const handleRefresh = () => {
    refetch()
    toast({
      title: "Caixa de entrada atualizada",
      description: "Os e-mails foram atualizados com sucesso.",
    })
  }

  return (
    <AppLayout>
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Caixa de Entrada</h1>
        <p className="text-sm text-gray-500">Gerencie e responda seus e-mails de suporte</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar e-mails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto" align="start" side="bottom">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-xs">Filtros</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    const closeEvent = new Event("keydown")
                    ;(closeEvent as any).key = "Escape"
                    document.dispatchEvent(closeEvent)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="date-range" className="text-xs">
                    Período
                  </Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => {
                      setFilters({ ...filters, dateRange: value })
                    }}
                  >
                    <SelectTrigger id="date-range" className="h-7 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today" className="text-xs">
                        Hoje
                      </SelectItem>
                      <SelectItem value="yesterday" className="text-xs">
                        Ontem
                      </SelectItem>
                      <SelectItem value="week" className="text-xs">
                        Últimos 7 dias
                      </SelectItem>
                      <SelectItem value="month" className="text-xs">
                        Último mês
                      </SelectItem>
                      <SelectItem value="custom" className="text-xs">
                        Personalizado
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {filters.dateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div>
                        <Label htmlFor="date-from" className="text-[10px]">
                          De
                        </Label>
                        <Input id="date-from" type="date" className="h-6 text-xs" />
                      </div>
                      <div>
                        <Label htmlFor="date-to" className="text-[10px]">
                          Até
                        </Label>
                        <Input id="date-to" type="date" className="h-6 text-xs" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Remetente</Label>
                  <Input
                    placeholder="Nome ou e-mail"
                    className="h-7 text-xs"
                    value={filters.sender}
                    onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites"
                      className="h-3.5 w-3.5"
                      checked={filters.favorites}
                      onCheckedChange={(checked) => setFilters({ ...filters, favorites: !!checked })}
                    />
                    <Label htmlFor="favorites" className="text-xs flex items-center">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      Apenas favoritos
                    </Label>
                  </div>
                </div>

                <div className="pt-1 flex justify-end space-x-1">
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={handleClearFilters}>
                    Limpar
                  </Button>
                  <Button size="sm" className="h-6 text-xs px-2" onClick={handleApplyFilters}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button size="sm" className="bg-[#0088FF] hover:bg-blue-600 text-white" onClick={handleRefresh}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              <TabsTrigger
                value="todos"
                className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
              >
                Todos ({getTabCount("todos")})
              </TabsTrigger>
              <TabsTrigger
                value="recebidos"
                className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
              >
                Recebidos ({getTabCount("recebidos")})
              </TabsTrigger>
              <TabsTrigger
                value="respondidos"
                className="text-xs data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800"
              >
                Respondidos ({getTabCount("respondidos")})
              </TabsTrigger>
              <TabsTrigger
                value="aguardando"
                className="text-xs data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
              >
                Aguardando ({getTabCount("aguardando")})
              </TabsTrigger>
              <TabsTrigger
                value="resolvidos"
                className="text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
              >
                Resolvidos ({getTabCount("resolvidos")})
              </TabsTrigger>
              <TabsTrigger
                value="pendentes"
                className="text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
              >
                Pendentes ({getTabCount("pendentes")})
              </TabsTrigger>
              <TabsTrigger
                value="arquivados"
                className="text-xs data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800"
              >
                Arquivados ({getTabCount("arquivados")})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("todos")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="recebidos" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("recebidos")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="respondidos" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("respondidos")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="aguardando" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("aguardando")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="resolvidos" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("resolvidos")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="pendentes" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("pendentes")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="arquivados" className="animate-in fade-in-50 duration-300">
              <EmailList
                emails={getEmailsByStatus("arquivados")}
                onSelectEmail={handleSelectEmail}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
