export interface Client {
  id: string
  email: string
  name?: string | null
  company?: string | null
  phone?: string | null
  location?: string | null
  avatar?: string | null
  notes?: string | null
  satisfaction?: number | null
  totalTickets: number
  createdAt: Date
  updatedAt: Date
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  number: number
  subject: string
  description?: string | null
  status: TicketStatus
  priority: Priority
  category?: string | null
  source: string
  clientId: string
  assigneeId?: string | null
  createdBy?: string | null
  slaDeadline?: Date | null
  resolvedAt?: Date | null
  closedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  client?: Client
  assignee?: User | null
  creator?: User | null
  emails?: Email[]
  interactions?: Interaction[]
  tags?: TicketTag[]
}

export interface Interaction {
  id: string
  ticketId: string
  userId?: string | null
  type: InteractionType
  content: string
  isPublic: boolean
  isInternal: boolean
  duration?: number | null
  createdAt: Date
  updatedAt: Date
  ticket?: Ticket
  user?: User | null
}

export interface TicketTag {
  id: string
  ticketId: string
  name: string
  color: string
  ticket?: Ticket
}

export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: string
  department?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Email {
  id: string
  from: string
  to: string
  subject: string
  content: string
  status: string
  priority: string
  category?: string | null
  ticketId?: string | null
  createdAt: Date
  updatedAt: Date
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CLIENT = 'WAITING_CLIENT',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum InteractionType {
  EMAIL = 'EMAIL',
  NOTE = 'NOTE',
  CALL = 'CALL',
  MEETING = 'MEETING',
  SMS = 'SMS',
  CHAT = 'CHAT'
}

// Utility types for forms and API
export interface CreateTicketData {
  subject: string
  description?: string
  priority: Priority
  category?: string
  clientEmail: string
  clientName?: string
  clientPhone?: string
  clientCompany?: string
  assigneeId?: string
  slaHours?: number
}

export interface UpdateTicketData {
  subject?: string
  description?: string
  status?: TicketStatus
  priority?: Priority
  category?: string
  assigneeId?: string | null
  slaDeadline?: Date | null
}

export interface CreateInteractionData {
  ticketId: string
  type: InteractionType
  content: string
  isPublic?: boolean
  isInternal?: boolean
  duration?: number
}

export interface CreateClientData {
  email: string
  name?: string
  company?: string
  phone?: string
  location?: string
  notes?: string
}

export interface TicketFilters {
  status?: TicketStatus[]
  priority?: Priority[]
  assigneeId?: string
  category?: string
  clientId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface CRMStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  averageResponseTime: number
  customerSatisfaction: number
  ticketsByPriority: Record<Priority, number>
  ticketsByStatus: Record<TicketStatus, number>
  topCategories: Array<{ category: string; count: number }>
  agentPerformance: Array<{
    agentId: string
    agentName: string
    assignedTickets: number
    resolvedTickets: number
    averageResponseTime: number
  }>
}

// Constants
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: '#EF4444',
  [TicketStatus.IN_PROGRESS]: '#F59E0B',
  [TicketStatus.WAITING_CLIENT]: '#8B5CF6',
  [TicketStatus.RESOLVED]: '#10B981',
  [TicketStatus.CLOSED]: '#6B7280',
  [TicketStatus.CANCELLED]: '#9CA3AF'
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: '#10B981',
  [Priority.MEDIUM]: '#F59E0B',
  [Priority.HIGH]: '#EF4444',
  [Priority.URGENT]: '#DC2626'
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Aberto',
  [TicketStatus.IN_PROGRESS]: 'Em Andamento',
  [TicketStatus.WAITING_CLIENT]: 'Aguardando Cliente',
  [TicketStatus.RESOLVED]: 'Resolvido',
  [TicketStatus.CLOSED]: 'Fechado',
  [TicketStatus.CANCELLED]: 'Cancelado'
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Baixa',
  [Priority.MEDIUM]: 'Média',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente'
}

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  [InteractionType.EMAIL]: 'E-mail',
  [InteractionType.NOTE]: 'Nota',
  [InteractionType.CALL]: 'Ligação',
  [InteractionType.MEETING]: 'Reunião',
  [InteractionType.SMS]: 'SMS',
  [InteractionType.CHAT]: 'Chat'
}
