import type { ChatSession, ChatMessage, ChatStatus, MessageRole } from "@prisma/client"

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[]
}

export interface ChatMessageWithSession extends ChatMessage {
  session: ChatSession
}

export interface CreateChatSessionInput {
  userEmail?: string
  userName?: string
  source?: string
  metadata?: Record<string, any>
}

export interface SendMessageInput {
  sessionId: string
  content: string
}

export interface ChatResponse {
  message: ChatMessage
  suggestedQuestions?: string[]
  shouldEscalate?: boolean
}

export interface ChatAnalyticsData {
  totalSessions: number
  totalMessages: number
  avgConfidence: number
  avgSessionDuration: number
  resolvedByAI: number
  escalatedToHuman: number
  topQuestions: Array<{
    question: string
    count: number
  }>
  lowConfidenceTopics: Array<{
    topic: string
    avgConfidence: number
  }>
}

export interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left"
  primaryColor?: string
  title?: string
  subtitle?: string
  placeholder?: string
  welcomeMessage?: string
}

export const CONFIDENCE_THRESHOLD = 0.8 // 80% de confiança para resposta automática
export const MAX_CONTEXT_MESSAGES = 5 // Número de mensagens anteriores para contexto
