"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronUp, Mail } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StatusBadge } from "@/components/status-badge"
import type { Email } from "@/types/email"

interface EmailHistoryProps {
  emails: Email[]
}

export function EmailHistory({ emails }: EmailHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (emails.length === 0) {
    return (
      <Card className="p-4 border border-[#E0E0E0]/60 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
        <h3 className="text-sm font-medium text-[#2E2E2E] mb-3 flex items-center">
          <span className="inline-block w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
          Histórico de Comunicações
        </h3>
        <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-md border border-gray-100">
          <div className="p-3 rounded-full bg-gray-100 mb-2">
            <Mail className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-xs font-medium text-gray-600 mb-1">Sem histórico anterior</h4>
          <p className="text-xs text-gray-500">Este é o primeiro contato deste cliente.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 border border-[#E0E0E0]/60 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
      <h3 className="text-sm font-medium text-[#2E2E2E] mb-3 flex items-center">
        <span className="inline-block w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
        Histórico de Comunicações ({emails.length})
      </h3>

      <div className="space-y-2">
        {emails.map((email, index) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div
              className="flex items-center justify-between p-2.5 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
              onClick={() => toggleExpand(email.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <h4 className="text-xs font-medium text-[#2E2E2E] truncate mr-2">{email.subject}</h4>
                  <StatusBadge status={email.status} />
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{format(email.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDistanceToNow(email.date, { addSuffix: true, locale: ptBR })}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-gray-100">
                {expandedId === email.id ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            <AnimatePresence>
              {expandedId === email.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border-t border-gray-100 bg-white">
                    <div className="prose prose-sm max-w-none text-gray-700 text-xs mb-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                      {email.body.split("\n").map((paragraph, i) => (
                        <p key={i} className="mb-1.5">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="text-xs text-gray-600 bg-purple-50/50 p-2.5 rounded-md border border-purple-100/50">
                      <h5 className="font-medium mb-1.5 text-purple-700">Ações:</h5>
                      <ul className="space-y-1.5">
                        {email.actions.map((action, i) => (
                          <li key={i} className="flex items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2"></div>
                            <span>
                              {action.description} - {format(action.timestamp, "dd/MM HH:mm", { locale: ptBR })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
