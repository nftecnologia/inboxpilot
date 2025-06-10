"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Star, 
  Archive, 
  MessageCircle, 
  Clock,
  User,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Ticket } from "@/types/crm"
import { 
  TICKET_STATUS_COLORS, 
  PRIORITY_COLORS, 
  TICKET_STATUS_LABELS, 
  PRIORITY_LABELS 
} from "@/types/crm"

interface TicketListProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  onFavorite: (ticketId: string) => void
  onReply: (ticketId: string) => void
  onArchive: (ticketId: string) => void
}

export function TicketList({ 
  tickets, 
  onSelectTicket, 
  onFavorite, 
  onReply, 
  onArchive 
}: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
        <p className="text-gray-500">Não há tickets para exibir no momento.</p>
      </Card>
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-3 w-3" />
      case 'HIGH':
        return <AlertCircle className="h-3 w-3" />
      case 'MEDIUM':
        return <Clock className="h-3 w-3" />
      case 'LOW':
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
          style={{ borderLeftColor: TICKET_STATUS_COLORS[ticket.status] }}
          onClick={() => onSelectTicket(ticket)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header com número do ticket e assunto */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  #{ticket.number}
                </Badge>
                <h3 className="font-medium text-gray-900 truncate">
                  {ticket.subject}
                </h3>
              </div>

              {/* Informações do cliente */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{ticket.client?.name || ticket.client?.email}</span>
                </div>
                {ticket.client?.company && (
                  <span className="text-gray-300">•</span>
                )}
                {ticket.client?.company && (
                  <span>{ticket.client.company}</span>
                )}
              </div>

              {/* Descrição do ticket */}
              {ticket.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {ticket.description}
                </p>
              )}

              {/* Status e prioridade */}
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${TICKET_STATUS_COLORS[ticket.status]}20`,
                    color: TICKET_STATUS_COLORS[ticket.status]
                  }}
                >
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center gap-1"
                  style={{ color: PRIORITY_COLORS[ticket.priority] }}
                >
                  {getPriorityIcon(ticket.priority)}
                  {PRIORITY_LABELS[ticket.priority]}
                </Badge>

                {ticket.category && (
                  <Badge variant="outline" className="text-xs">
                    {ticket.category}
                  </Badge>
                )}
              </div>

              {/* Footer com agente e data */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  {ticket.assignee ? (
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={ticket.assignee.image || ""} />
                        <AvatarFallback className="text-[8px]">
                          {ticket.assignee.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{ticket.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-orange-500">Não atribuído</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {ticket.slaDeadline && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        SLA: {formatDistanceToNow(new Date(ticket.slaDeadline), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  )}
                  
                  <span>
                    {formatDistanceToNow(new Date(ticket.createdAt), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 ml-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onFavorite(ticket.id)
                }}
              >
                <Star className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onReply(ticket.id)
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Responder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive(ticket.id)
                    }}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Indicador de interações recentes */}
          {ticket.interactions && ticket.interactions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MessageCircle className="h-3 w-3" />
                <span>
                  {ticket.interactions.length} interaç{ticket.interactions.length === 1 ? 'ão' : 'ões'}
                </span>
                {ticket.interactions[0] && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>
                      Última: {formatDistanceToNow(new Date(ticket.interactions[0].createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
