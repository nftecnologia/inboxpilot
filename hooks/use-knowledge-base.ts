"use client"

import { useState, useEffect } from "react"
import type { KnowledgeCard } from "@/types/knowledge"

// Dados mock para fallback
const mockData: KnowledgeCard[] = [
  {
    id: "1",
    title: "Como resetar senha",
    category: "Cadastro e Conta",
    content:
      "Para resetar a senha: 1) Acesse a página de login 2) Clique em 'Esqueci minha senha' 3) Digite seu e-mail 4) Verifique sua caixa de entrada 5) Clique no link recebido 6) Defina uma nova senha",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    title: "Política de reembolso",
    category: "Checkout e Conversão",
    content:
      "Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação.",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    title: "Funcionalidades do plano premium",
    category: "Produtos",
    content:
      "O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta.",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
]

export function useKnowledgeBase() {
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estatisticas, setEstatisticas] = useState({ total: 0, categorias: 0 })

  useEffect(() => {
    loadKnowledgeCards()
  }, [])

  const loadKnowledgeCards = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Tentar carregar da API
      const response = await fetch("/api/knowledge", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          const cards = data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            content: item.content,
            createdAt: new Date(item.created_at || item.createdAt),
            updatedAt: new Date(item.updated_at || item.updatedAt),
          }))
          setKnowledgeCards(cards)

          // Calcular estatísticas
          const categorias = new Set(cards.map((card: KnowledgeCard) => card.category))
          setEstatisticas({
            total: cards.length,
            categorias: categorias.size,
          })
        } else {
          throw new Error("Dados inválidos da API")
        }
      } else {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
    } catch (err) {
      console.warn("Usando dados mock:", err)
      setError("Usando dados de exemplo. Conecte ao banco para dados reais.")

      // Usar dados mock
      setKnowledgeCards(mockData)
      const categorias = new Set(mockData.map((card) => card.category))
      setEstatisticas({
        total: mockData.length,
        categorias: categorias.size,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createKnowledgeCard = async (card: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(card),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const newCard = {
            id: data.data.id,
            title: data.data.title,
            category: data.data.category,
            content: data.data.content,
            createdAt: new Date(data.data.created_at || data.data.createdAt),
            updatedAt: new Date(data.data.updated_at || data.data.updatedAt),
          }
          setKnowledgeCards((prev) => [newCard, ...prev])
          return newCard
        }
      }
      throw new Error("Erro na API")
    } catch (err) {
      // Fallback local
      const newCard: KnowledgeCard = {
        ...card,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setKnowledgeCards((prev) => [newCard, ...prev])
      return newCard
    }
  }

  const updateKnowledgeCard = async (
    id: string,
    updates: Partial<Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">>,
  ) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const updatedCard = {
            id: data.data.id,
            title: data.data.title,
            category: data.data.category,
            content: data.data.content,
            createdAt: new Date(data.data.created_at || data.data.createdAt),
            updatedAt: new Date(data.data.updated_at || data.data.updatedAt),
          }
          setKnowledgeCards((prev) => prev.map((card) => (card.id === id ? updatedCard : card)))
          return updatedCard
        }
      }
      throw new Error("Erro na API")
    } catch (err) {
      // Fallback local
      setKnowledgeCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...updates, updatedAt: new Date() } : card)),
      )
      return knowledgeCards.find((card) => card.id === id)!
    }
  }

  const deleteKnowledgeCard = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setKnowledgeCards((prev) => prev.filter((card) => card.id !== id))
      } else {
        throw new Error("Erro na API")
      }
    } catch (err) {
      // Fallback local
      setKnowledgeCards((prev) => prev.filter((card) => card.id !== id))
    }
  }

  const refreshData = () => {
    loadKnowledgeCards()
  }

  return {
    knowledgeCards,
    isLoading,
    error,
    estatisticas,
    createKnowledgeCard,
    updateKnowledgeCard,
    deleteKnowledgeCard,
    refreshData,
  }
}
