"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface EmailAIResponse {
  categoria: string
  complexidade: number
  palavrasChave: string[]
  resposta: string | null
  precisaIntervencaoHumana: boolean
}

export function useEmailAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<EmailAIResponse | null>(null)

  const analyzeEmail = async (assunto: string, corpo: string, nomeRemetente: string) => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/email-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assunto, corpo, nomeRemetente }),
      })

      if (!response.ok) {
        throw new Error("Falha na análise do e-mail")
      }

      const data = await response.json()
      setResult(data)

      // Retorna os dados para uso imediato
      return {
        categoria: data.categoria,
        complexidade: data.complexidade,
        palavrasChave: data.palavrasChave,
        resposta: data.resposta,
        precisaIntervencaoHumana: data.precisaIntervencaoHumana,
      }
    } catch (error) {
      console.error("Erro ao analisar e-mail:", error)
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o e-mail. Usando configurações padrão.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    analyzeEmail,
    isAnalyzing,
    result,
  }
}
