export type EmailStatus = "recebidos" | "aguardando" | "respondidos" | "resolvidos" | "pendentes" | "arquivados"

export type ActionType =
  | "received"
  | "ai_suggested"
  | "ai_responded"
  | "responded"
  | "resolved"
  | "escalated"
  | "archived"

export interface EmailAction {
  type: ActionType
  timestamp: Date
  description: string
  responseText?: string // Adicionar campo para armazenar o texto da resposta
}

export interface Email {
  id: string
  subject: string
  sender: string
  senderName: string
  date: Date
  status: EmailStatus
  body: string
  content?: string // Alias para body para compatibilidade com Prisma
  suggestedResponse?: string
  aiResponse?: string
  responseText?: string // Adicionar campo para a última resposta
  actions: EmailAction[]
  isFavorite: boolean
  knowledgeCategory?: string
  category?: string // Alias para knowledgeCategory para compatibilidade
  // Campos de IA
  aiAnalyzed?: boolean
  aiKeywords?: string[]
  aiComplexity?: number
}
