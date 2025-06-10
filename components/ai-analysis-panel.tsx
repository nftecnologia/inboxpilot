"use client"

import { useState } from "react"
import { Brain, Sparkles, Target, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useProcessEmail } from "@/hooks/useMutations/useProcessEmail"
import { toast } from "@/components/ui/use-toast"
import type { Email } from "@/types/email"

interface AIAnalysisPanelProps {
  email: Email
  onAnalysisComplete?: (result: any) => void
}

export function AIAnalysisPanel({ email, onAnalysisComplete }: AIAnalysisPanelProps) {
  const [showAIResponse, setShowAIResponse] = useState(false)
  const processEmailMutation = useProcessEmail()

  const handleProcessWithAI = () => {
    processEmailMutation.mutate(
      { emailId: email.id },
      {
        onSuccess: (result) => {
          toast({
            title: "Análise concluída",
            description: `Email processado com IA. Status: ${result.analysis.newStatus}`,
          })
          onAnalysisComplete?.(result)
        },
        onError: (error) => {
          toast({
            title: "Erro na análise",
            description: error.message,
            variant: "destructive",
          })
        },
      }
    )
  }

  const getComplexityInfo = (complexity?: number) => {
    if (!complexity) return { label: "Não analisado", color: "bg-gray-500", icon: AlertCircle }
    
    switch (complexity) {
      case 1:
      case 2:
        return { label: "Simples", color: "bg-green-500", icon: CheckCircle }
      case 3:
        return { label: "Moderado", color: "bg-yellow-500", icon: Clock }
      case 4:
      case 5:
        return { label: "Complexo", color: "bg-red-500", icon: AlertCircle }
      default:
        return { label: "Indefinido", color: "bg-gray-500", icon: AlertCircle }
    }
  }

  const complexityInfo = getComplexityInfo(email.aiComplexity)
  const ComplexityIcon = complexityInfo.icon

  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-600" />
          Análise de IA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!email.aiAnalyzed ? (
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Este email ainda não foi analisado pela IA
            </p>
            <Button
              onClick={handleProcessWithAI}
              disabled={processEmailMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {processEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Processar com IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Categoria */}
            {email.category && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Categoria
                </span>
                <Badge variant="outline" className="text-xs">
                  {email.category}
                </Badge>
              </div>
            )}

            {/* Complexidade */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Complexidade
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${complexityInfo.color}`} />
                <span className="text-xs font-medium">{complexityInfo.label}</span>
                <ComplexityIcon className="h-3 w-3 text-gray-500" />
              </div>
            </div>

            {/* Palavras-chave */}
            {email.aiKeywords && email.aiKeywords.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-600 mb-2 block">
                  Palavras-chave identificadas
                </span>
                <div className="flex flex-wrap gap-1">
                  {email.aiKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Resposta Automática */}
            {email.aiResponse && (
              <div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Resposta Sugerida
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAIResponse(!showAIResponse)}
                      className="text-xs h-6 px-2"
                    >
                      {showAIResponse ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                  
                  {showAIResponse && (
                    <div className="bg-white rounded-md border p-3 text-xs text-gray-700 leading-relaxed">
                      <div className="whitespace-pre-wrap">{email.aiResponse}</div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="h-6 text-xs px-3">
                          Usar Resposta
                        </Button>
                        <Button variant="outline" size="sm" className="h-6 text-xs px-3">
                          Editar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Indicador de Automação */}
            {email.status === "respondidos" && email.aiResponse && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">Respondido automaticamente</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
