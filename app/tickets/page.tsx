"use client"

import { useState } from "react"
import { Search, Filter, X, Star, RefreshCw, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketList } from "@/components/ticket-list"
import { AppLayout } from "@/components/app-layout"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useGetTickets } from "@/hooks/useQueries/useGetTickets"
import { useUpdateTicket } from "@/hooks/useMutations/useTicketMutations"
import type { Ticket, TicketStatus } from "@/types/crm"
import { TicketStatus as TicketStatusEnum } from "@/types/crm"

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [filters, setFilters] = useState({
    dateRange: "today",
    priority: {
      LOW: false,
      MEDIUM: false,
      HIGH: false,
      URGENT: false,
    },
    category: "",
    assignee: "",
    favorites: false,
  })
  const router = useRouter()

  // Buscar tickets da API
  const { 
    data: tickets = [], 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useGetTickets({
    ...(activeTab !== "todos" && { status: [activeTab as TicketStatus] }),
    ...(searchTerm && { search: searchTerm }),
    limit: 100
  })

  // Hook para atualizar tickets
  const updateTicketMutation = useUpdateTicket()

  const getTicketsByStatus = (status: string) => {
    let ticketList = tickets

    // Aplicar filtros
    if (filters.favorites) {
      ticketList = ticketList.filter((ticket: any) => ticket.isFavorite)
    }

    if (status === "todos") return ticketList
    return ticketList.filter((ticket: any) => ticket.status === status)
  }

  const getTabCount = (status: string) => {
    return getTicketsByStatus(status).length
  }

  const handleSelectTicket = (ticket: Ticket) => {
    console.log("Selecionando ticket:", ticket.id)
    router.push(`/tickets/${ticket.id}`)
  }

  const handleFavorite = (ticketId: string) => {
    const ticket = tickets.find((t: any) => t.id === ticketId)
    if (!ticket) return

    updateTicketMutation.mutate({
      id: ticketId,
      data: { /* isFavorite: !ticket.isFavorite */ }
    }, {
      onSuccess: () => {
        toast({
          title: "Ticket atualizado",
          description: "O ticket foi atualizado com sucesso.",
        })
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o ticket.",
          variant: "destructive",
        })
      }
    })
  }

  const handleReply = (ticketId: string) => {
    console.log("Respondendo ticket:", ticketId)
    try {
      router.push(`/tickets/${ticketId}?reply=true`)
    } catch (error) {
      console.error("Erro ao redirecionar:", error)
      toast({
        title: "Erro ao responder",
        description: "Não foi possível abrir o formulário de resposta.",
        variant: "destructive",
      })
    }
  }

  const handleArchive = (ticketId: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      data: { status: TicketStatusEnum.CLOSED }
    }, {
      onSuccess: () => {
        toast({
          title: "Ticket fechado",
          description: "O ticket foi fechado com sucesso.",
        })
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível fechar o ticket.",
          variant: "destructive",
        })
      }
    })
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: "today",
      priority: {
        LOW: false,
        MEDIUM: false,
        HIGH: false,
        URGENT: false,
      },
      category: "",
      assignee: "",
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
      title: "Tickets atualizados",
      description: "A lista de tickets foi atualizada com sucesso.",
    })
  }

  return (
    <AppLayout>
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Sistema CRM</h1>
        <p className="text-sm text-gray-500">Gerencie tickets de suporte e relacionamento com clientes</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tickets..."
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Categoria</Label>
                  <Input
                    placeholder="Filtrar por categoria"
                    className="h-7 text-xs"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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

        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-[#0088FF] hover:bg-blue-600 text-white" onClick={handleRefresh}>
            Atualizar
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Novo Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger
                value="todos"
                className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
              >
                Todos ({getTabCount("todos")})
              </TabsTrigger>
              <TabsTrigger
                value="OPEN"
                className="text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
              >
                Abertos ({getTabCount("OPEN")})
              </TabsTrigger>
              <TabsTrigger
                value="IN_PROGRESS"
                className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
              >
                Em Andamento ({getTabCount("IN_PROGRESS")})
              </TabsTrigger>
              <TabsTrigger
                value="WAITING_CLIENT"
                className="text-xs data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800"
              >
                Aguardando ({getTabCount("WAITING_CLIENT")})
              </TabsTrigger>
              <TabsTrigger
                value="RESOLVED"
                className="text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
              >
                Resolvidos ({getTabCount("RESOLVED")})
              </TabsTrigger>
              <TabsTrigger
                value="CLOSED"
                className="text-xs data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800"
              >
                Fechados ({getTabCount("CLOSED")})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("todos")}
                onSelectTicket={handleSelectTicket}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="OPEN" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("OPEN")}
                onSelectTicket={handleSelectTicket}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="IN_PROGRESS" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("IN_PROGRESS")}
                onSelectTicket={handleSelectTicket}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="WAITING_CLIENT" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("WAITING_CLIENT")}
                onSelectTicket={handleSelectTicket}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="RESOLVED" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("RESOLVED")}
                onSelectTicket={handleSelectTicket}
                onFavorite={handleFavorite}
                onReply={handleReply}
                onArchive={handleArchive}
              />
            </TabsContent>
            <TabsContent value="CLOSED" className="animate-in fade-in-50 duration-300">
              <TicketList
                tickets={getTicketsByStatus("CLOSED")}
                onSelectTicket={handleSelectTicket}
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
