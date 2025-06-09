"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Reply, Send, Clock, AlertCircle, CheckCircle2, ThumbsUp, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { useEmailAI } from "@/hooks/use-email-ai"
import { useRouter } from "next/navigation"
import type { Email, ActionType } from "@/types/email"

interface EmailViewProps {
  email: Email
  isReplying: boolean
  setIsReplying: (value: boolean) => void
  replyText: string
  setReplyText: (value: string) => void
  isSending: boolean
  setIsSending: (value: boolean) => void
  onReply: () => void
  onUpdateEmail?: (email: Email) => void
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
    case "Finanças":
      return "bg-amber-600 text-white"
    default:
      return "bg-neutral-600 text-white"
  }
}

export function EmailView({
  email,
  isReplying,
  setIsReplying,
  replyText,
  setReplyText,
  isSending,
  setIsSending,
  onReply,
  onUpdateEmail,
}: EmailViewProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { analyzeEmail, isAnalyzing, result } = useEmailAI()
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [updatedEmail, setUpdatedEmail] = useState<Email>(email)
  const router = useRouter()

  // Usar a resposta da IA ou a resposta sugerida existente
  const generatedSuggestion = email.suggestedResponse || result?.resposta || ""

  // Analisar o e-mail quando o componente for montado ou quando o e-mail mudar
  useEffect(() => {
    console.log("🔍 EmailView useEffect executado")
    console.log("📧 Email:", email.id, email.subject)
    console.log("📊 Status:", email.status)
    console.log("🏷️ Categoria existente:", email.knowledgeCategory)

    if (email && email.status === "recebidos" && !email.knowledgeCategory) {
      console.log("✅ Condições atendidas - iniciando análise automática")
      handleAnalyzeEmail()
    } else {
      console.log("❌ Condições não atendidas para análise automática")
      console.log("- É recebido?", email.status === "recebidos")
      console.log("- Não tem categoria?", !email.knowledgeCategory)
    }

    // Atualizar o estado local quando o email mudar
    setUpdatedEmail(email)
  }, [email])

  const handleAnalyzeEmail = async () => {
    if (isAnalyzing) {
      console.log("⏳ Análise já em andamento, ignorando")
      return
    }

    console.log("🚀 Iniciando análise do e-mail")
    setIsGeneratingResponse(true)

    try {
      console.log("📤 Enviando para API:", {
        assunto: email.subject,
        corpo: email.body,
        nomeRemetente: email.senderName,
      })

      const analysisResult = await analyzeEmail(email.subject, email.body, email.senderName)

      console.log("📥 Resultado da análise:", analysisResult)

      if (analysisResult) {
        console.log("✅ Análise concluída com sucesso")

        // Atualizar o email local com a categoria e resposta sugerida
        setUpdatedEmail((prev) => ({
          ...prev,
          knowledgeCategory: analysisResult.categoria,
          suggestedResponse: analysisResult.resposta,
        }))

        toast({
          title: "E-mail analisado",
          description: `Categoria: ${analysisResult.categoria}, Complexidade: ${analysisResult.complexidade}/5`,
        })
      } else {
        console.log("❌ Análise retornou resultado vazio")
      }
    } catch (error) {
      console.error("💥 Erro ao analisar e-mail:", error)
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o e-mail. Verifique o console para mais detalhes.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return

    setIsSending(true)

    try {
      // Simulando envio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Determinar o tipo de ação
      let actionType: ActionType = "responded"
      let actionDescription = "Resposta enviada manualmente"

      // Se a resposta for da IA
      if (replyText === result?.resposta || replyText === email.suggestedResponse) {
        actionType = "ai_responded"
        actionDescription = "IA respondeu automaticamente"
      }

      // Criar nova ação com o texto da resposta
      const newAction = {
        type: actionType,
        timestamp: new Date(),
        description: actionDescription,
        responseText: replyText, // Armazenar o texto da resposta
      }

      // Atualizar o email com o novo status e ação
      const updatedEmailData = {
        ...updatedEmail,
        status: "respondidos" as const,
        actions: [...updatedEmail.actions, newAction],
        aiResponse: actionType === "ai_responded" ? replyText : undefined,
        responseText: replyText, // Armazenar a última resposta enviada
      }

      // Salvar diretamente no localStorage para garantir persistência
      try {
        const currentEmails = JSON.parse(localStorage.getItem("inboxpilot_emails") || "[]")
        const updatedEmails = currentEmails.map((email: any) =>
          email.id === updatedEmail.id
            ? {
                ...updatedEmailData,
                actions: updatedEmailData.actions.map((action: any) => ({
                  ...action,
                  timestamp: action.timestamp instanceof Date ? action.timestamp.toISOString() : action.timestamp,
                })),
              }
            : email,
        )
        localStorage.setItem("inboxpilot_emails", JSON.stringify(updatedEmails))
        console.log("💾 Histórico salvo no localStorage:", updatedEmailData.actions)
      } catch (error) {
        console.error("Erro ao salvar histórico:", error)
      }

      // Atualizar o estado local
      setUpdatedEmail(updatedEmailData)

      // Atualizar o estado global através do callback
      if (onUpdateEmail) {
        onUpdateEmail(updatedEmailData)
      }

      console.log("✅ E-mail atualizado:", updatedEmailData)

      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true)

      toast({
        title: "Resposta enviada",
        description: "O e-mail foi respondido com sucesso e movido para 'Respondidos'.",
        duration: 3000,
      })

      // Redirecionar após um tempo
      setTimeout(() => {
        router.push("/emails")
      }, 2000)
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a resposta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      setIsReplying(false)
      setReplyText("")
    }
  }

  const handleApproveResponse = () => {
    // Usar a sugestão gerada pela IA
    const suggestionToUse = result?.resposta || email.suggestedResponse || ""

    if (suggestionToUse) {
      setReplyText(suggestionToUse)

      toast({
        title: "Resposta aprovada",
        description: "A resposta sugerida foi aplicada e está pronta para envio.",
        duration: 3000,
      })
    }
  }

  const getStatusIcon = () => {
    switch (updatedEmail.status) {
      case "recebidos":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "aguardando":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "respondidos":
        return <Reply className="h-4 w-4 text-green-500" />
      case "resolvidos":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "pendentes":
        return <Clock className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Determinar a categoria a ser exibida (da análise da IA ou do e-mail)
  const displayCategory = result?.categoria || updatedEmail.knowledgeCategory

  // TODOS os e-mails devem ter histórico, exceto "recebidos" que só mostram após serem respondidos
  const shouldShowHistory =
    updatedEmail.status !== "recebidos" || // Todos exceto recebidos
    updatedEmail.actions.some((action) => action.type === "responded" || action.type === "ai_responded") // Recebidos só se foram respondidos

  // Função para obter resposta padrão baseada no status
  const getDefaultResponseByStatus = () => {
    switch (updatedEmail.status) {
      case "aguardando":
        return "Olá! Recebemos sua mensagem e nossa equipe está analisando sua solicitação. Retornaremos em breve com uma resposta detalhada."
      case "respondidos":
        if (displayCategory === "Produtos") {
          return "Olá! O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta. Gostaria de agendar uma demonstração?"
        } else if (displayCategory === "Checkout e Conversão") {
          return "Olá! Lamentamos o inconveniente. Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação."
        } else if (displayCategory === "Finanças") {
          return "Olá! Sobre sua solicitação de saque, verificamos que está tudo em ordem. O valor será processado em até 2 dias úteis e creditado na sua conta cadastrada. Qualquer dúvida, estamos à disposição."
        } else {
          return "Olá! Agradecemos seu contato. Sua solicitação foi analisada e respondida com sucesso. Se precisar de mais informações, não hesite em entrar em contato conosco."
        }
      case "resolvidos":
        return "Olá! Sua solicitação foi analisada e resolvida com sucesso. Caso tenha alguma dúvida adicional, não hesite em nos contatar."
      case "pendentes":
        return "Olá! Sua solicitação requer análise adicional de nossa equipe especializada. Estamos trabalhando para resolver e retornaremos em breve."
      case "arquivados":
        return "Esta conversa foi finalizada e arquivada. Obrigado pelo contato!"
      default:
        return "Resposta padrão do sistema."
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 border border-[#E0E0E0]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-[#2E2E2E] mb-1">{updatedEmail.subject}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium">{updatedEmail.senderName}</span>
              <span className="mx-1">•</span>
              <span className="text-gray-400">{updatedEmail.sender}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <span>{format(updatedEmail.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(updatedEmail.date, { addSuffix: true, locale: ptBR })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <StatusBadge status={updatedEmail.status} />
            {/* Mostrar tag da base de conhecimento ou da análise da IA */}
            {displayCategory && (
              <Badge className={`${getKnowledgeCategoryColor(displayCategory)} text-xs`}>{displayCategory}</Badge>
            )}
            {/* Mostrar indicador de complexidade se disponível */}
            {result?.complexidade && (
              <Badge className={`bg-blue-600 text-white text-xs`}>Complexidade: {result.complexidade}/5</Badge>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="prose prose-sm max-w-none text-gray-700">
            {updatedEmail.body.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Histórico de Conversas - Mostrar para TODOS exceto recebidos não respondidos */}
        {shouldShowHistory && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <h3 className="text-sm font-medium text-[#2E2E2E] mb-3">Histórico da Conversa</h3>
            <div className="space-y-4">
              {/* Verificar se há respostas reais nas ações */}
              {updatedEmail.actions.some((action) => action.type === "responded" || action.type === "ai_responded") ? (
                // Mostrar respostas das ações
                updatedEmail.actions
                  .filter((action) => action.type === "responded" || action.type === "ai_responded")
                  .map((action, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          {action.type === "ai_responded" ? "Resposta Automática (IA)" : "Resposta Enviada"}
                        </span>
                        <span className="text-xs text-blue-600">
                          {format(new Date(action.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {action.responseText ||
                          (action.type === "ai_responded" ? updatedEmail.aiResponse : "") ||
                          getDefaultResponseByStatus()}
                      </div>
                    </div>
                  ))
              ) : (
                // Mostrar resposta padrão baseada no status
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      {updatedEmail.status === "aguardando" ? "Status Atual" : "Resposta Automática (IA)"}
                    </span>
                    <span className="text-xs text-blue-600">
                      {format(updatedEmail.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{getDefaultResponseByStatus()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={onReply}>
                <Reply className="h-3.5 w-3.5 mr-1" />
                Responder
              </Button>

              {/* Botão para analisar e-mail com IA */}
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={handleAnalyzeEmail}
                disabled={isAnalyzing || isGeneratingResponse}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-500" />
                {isAnalyzing || isGeneratingResponse ? "Analisando..." : "Analisar com IA"}
              </Button>
            </div>

            <div className="text-xs text-gray-400">ID: {updatedEmail.id}</div>
          </div>
        </div>
      </Card>

      {isReplying && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 border border-[#E0E0E0]">
            <h3 className="text-sm font-medium text-[#2E2E2E] mb-3">Responder para {updatedEmail.senderName}</h3>

            {/* Mostrar sugestão da IA */}
            {(generatedSuggestion || isGeneratingResponse) && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-blue-700">Sugestão da IA</span>
                  {displayCategory && (
                    <Badge className={`${getKnowledgeCategoryColor(displayCategory)} text-xs ml-2`}>
                      {displayCategory}
                    </Badge>
                  )}
                </div>
                {isGeneratingResponse ? (
                  <div className="flex items-center text-sm text-blue-800">
                    <span className="animate-pulse mr-2">Gerando resposta...</span>
                    <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm text-blue-800 whitespace-pre-line">{generatedSuggestion}</p>
                )}
              </div>
            )}

            <Textarea
              placeholder="Digite sua resposta aqui..."
              className="min-h-[120px] mb-3"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex justify-between items-center">
              {/* Botão Aprovar Sugestão do lado esquerdo */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={handleApproveResponse}
                  disabled={!generatedSuggestion || isGeneratingResponse}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  Aprovar Sugestão
                </Button>
              </div>

              {/* Botões de ação do lado direito */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)} disabled={isSending}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0088FF] hover:bg-blue-600"
                  onClick={handleSendReply}
                  disabled={isSending || !replyText.trim()}
                >
                  {isSending ? (
                    <>
                      <span className="mr-1">Enviando</span>
                      <span className="animate-spin">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Resposta enviada com sucesso! Redirecionando...
        </motion.div>
      )}

      <Card className="p-5 border border-[#E0E0E0]">
        <h3 className="text-sm font-medium text-[#2E2E2E] mb-3">Histórico de Ações</h3>
        <div className="space-y-3">
          {updatedEmail.actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-start"
            >
              <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-700">{action.description}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(action.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Mostrar ações de análise da IA se disponíveis */}
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-start"
            >
              <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  E-mail analisado pela IA: {result.categoria}, Complexidade {result.complexidade}/5
                </p>
                <p className="text-xs text-gray-400">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
