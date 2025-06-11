"use client"

import type React from "react"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Eye, Reply, Archive, Star, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import type { Email } from "@/types/email"

interface EmailListProps {
  emails: Email[]
  onSelectEmail: (email: Email) => void
  onFavorite: (emailId: string) => void
  onReply: (emailId: string) => void
  onArchive: (emailId: string) => void
}

// Função para obter cor da categoria da base de conhecimento
const getKnowledgeCategoryColor = (category: string) => {
  switch (category) {
    case "Cadastro e Conta":
      return "bg-purple-600 text-white"
    case "Produtos":
      return "bg-pink-600 text-white"
    case "Marketplace":
      return "bg-violet-600 text-white"
    case "Área de Membros":
      return "bg-fuchsia-600 text-white"
    case "Checkout e Conversão":
      return "bg-emerald-600 text-white"
    case "Integrações":
      return "bg-teal-600 text-white"
    case "Afiliados":
      return "bg-rose-600 text-white"
    case "Geral":
      return "bg-stone-600 text-white"
    case "Consumidor":
      return "bg-sky-600 text-white"
    case "Plágio":
      return "bg-indigo-600 text-white"
    case "Upsell One Click":
      return "bg-lime-600 text-white"
    case "Biometria":
      return "bg-cyan-600 text-white"
    default:
      return "bg-neutral-600 text-white"
  }
}

export function EmailList({ emails, onSelectEmail, onFavorite, onReply, onArchive }: EmailListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const router = useRouter()

  // Update the handleReplyClick function to fix the error when clicking reply
  const handleReplyClick = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation()
    try {
      // Redirecionar para a página do e-mail e abrir o formulário de resposta
      router.push(`/emails/${emailId}?reply=true`)
    } catch (error) {
      console.error("Erro ao redirecionar:", error)
      // Você pode adicionar uma notificação de erro aqui se desejar
    }
  }

  return (
    <div className="space-y-2">
      {emails.map((email, index) => (
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Card
            className={`p-3 transition-all duration-200 cursor-pointer border border-[#E0E0E0] ${
              hoveredId === email.id
                ? "shadow-md border-blue-100 bg-blue-50/30"
                : "hover:shadow-sm hover:border-blue-50"
            }`}
            onMouseEnter={() => setHoveredId(email.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectEmail(email)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center">
                    {email.status === "pendentes" && (
                      <span className="mr-1.5">
                        <Clock className="h-3 w-3 text-amber-500" />
                      </span>
                    )}
                    <h3 className="text-sm font-medium text-[#2E2E2E] truncate">{email.subject}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Mostrar tag da base de conhecimento apenas se não for "recebidos" */}
                    {email.knowledgeCategory && email.status !== "recebidos" && (
                      <Badge
                        className={`${getKnowledgeCategoryColor(email.knowledgeCategory)} text-[10px] px-1.5 py-0`}
                      >
                        <Tag className="h-2 w-2 mr-0.5" />
                        {email.knowledgeCategory}
                      </Badge>
                    )}
                    <StatusBadge status={email.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[180px]">
                    {email.senderName} ({email.sender})
                  </span>
                  <span className="text-xs font-light">
                    {email.date && 
                      formatDistanceToNow(new Date(email.date), { addSuffix: true, locale: ptBR })
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectEmail(email)
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 hover:bg-amber-50 ${
                    email.isFavorite ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onFavorite(email.id)
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-green-500 hover:bg-green-50"
                  onClick={(e) => handleReplyClick(e, email.id)}
                >
                  <Reply className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(email.id)
                  }}
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      {emails.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200"
        >
          Nenhum e-mail encontrado nesta categoria
        </motion.div>
      )}
    </div>
  )
}
