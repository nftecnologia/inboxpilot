"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { AddKnowledgeModal } from "@/components/add-knowledge-modal"
import { EditKnowledgeModal } from "@/components/edit-knowledge-modal"
import { useGetKnowledge } from "@/hooks/useQueries/useGetKnowledge"
import { useCreateKnowledge, useUpdateKnowledge, useDeleteKnowledge } from "@/hooks/useMutations/useKnowledgeMutations"
import { toast } from "@/components/ui/use-toast"
import type { KnowledgeCard } from "@/types/knowledge"

const categories = [
  "Todas",
  "Cadastro e Conta",
  "Produtos",
  "Marketplace",
  "Área de Membros",
  "Checkout e Conversão",
  "Integrações",
  "Afiliados",
  "Geral",
  "Consumidor",
  "Plágio",
  "Upsell One Click",
  "Biometria",
  "Finanças", // Adicionada categoria Finanças
]

// Mock data para fallback
const mockKnowledgeCards: KnowledgeCard[] = [
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
  {
    id: "4",
    title: "Política de cobrança e pagamentos",
    category: "Finanças",
    content:
      "Nossa política de cobrança: Pagamentos são processados automaticamente. Aceitamos cartão de crédito, débito e PIX. Faturas são enviadas por email. Em caso de atraso, enviamos lembretes automáticos. Para parcelamentos ou renegociações, entre em contato com nosso financeiro.",
    createdAt: new Date("2024-06-02"),
    updatedAt: new Date("2024-06-02"),
  },
]

export default function BaseConhecimentoPage() {
  const [deletedCards, setDeletedCards] = useState<KnowledgeCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [showTrash, setShowTrash] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<KnowledgeCard | null>(null)

  // Hooks React Query
  const { 
    data: knowledgeCards = [], 
    isLoading, 
    isError, 
    refetch 
  } = useGetKnowledge({
    search: searchTerm || undefined,
    category: selectedCategory !== "Todas" ? selectedCategory : undefined
  })

  const createKnowledgeMutation = useCreateKnowledge()
  const updateKnowledgeMutation = useUpdateKnowledge()  
  const deleteKnowledgeMutation = useDeleteKnowledge()

  const filteredCards = (showTrash ? deletedCards : knowledgeCards).filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || card.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddCard = (newCard: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">) => {
    createKnowledgeMutation.mutate(newCard, {
      onSuccess: () => {
        setIsAddModalOpen(false)
        toast({
          title: "Conhecimento criado",
          description: "O conhecimento foi adicionado com sucesso.",
        })
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível criar o conhecimento.",
          variant: "destructive",
        })
      }
    })
  }

  const handleEditCard = (updatedCard: KnowledgeCard) => {
    if (showTrash) {
      setDeletedCards(
        deletedCards.map((card) => (card.id === updatedCard.id ? { ...updatedCard, updatedAt: new Date() } : card)),
      )
      setEditingCard(null)
    } else {
      updateKnowledgeMutation.mutate({
        id: updatedCard.id,
        data: {
          title: updatedCard.title,
          category: updatedCard.category,
          content: updatedCard.content,
        }
      }, {
        onSuccess: () => {
          setEditingCard(null)
          toast({
            title: "Conhecimento atualizado",
            description: "O conhecimento foi atualizado com sucesso.",
          })
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o conhecimento.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const handleDeleteCard = (id: string) => {
    const cardToDelete = knowledgeCards.find((card) => card.id === id)
    if (cardToDelete) {
      deleteKnowledgeMutation.mutate({ id }, {
        onSuccess: () => {
          setDeletedCards([cardToDelete, ...deletedCards])
          toast({
            title: "Conhecimento movido para lixeira",
            description: "O conhecimento foi movido para a lixeira.",
          })
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Não foi possível excluir o conhecimento.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const handleRestoreCard = (id: string) => {
    const cardToRestore = deletedCards.find((card) => card.id === id)
    if (cardToRestore) {
      setDeletedCards(deletedCards.filter((card) => card.id !== id))
      // Aqui seria ideal ter uma API para restaurar, mas por agora só remove da lixeira local
      toast({
        title: "Conhecimento restaurado",
        description: "O conhecimento foi restaurado da lixeira.",
      })
    }
  }

  const handlePermanentDelete = (id: string) => {
    setDeletedCards(deletedCards.filter((card) => card.id !== id))
  }

  const getCategoryColor = (category: string) => {
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
        return "bg-amber-600 text-white" // Cor específica para Finanças
      default:
        return "bg-neutral-600 text-white"
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Base de Conhecimento</h1>
          <p className="text-sm text-gray-500">Gerencie suas respostas modelo</p>
          {isError && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              ⚠️ Erro ao carregar dados. Verifique sua conexão.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={showTrash ? "default" : "outline"}
            onClick={() => setShowTrash(!showTrash)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {showTrash ? "Ver Ativos" : "Lixeira"} ({showTrash ? knowledgeCards.length : deletedCards.length})
          </Button>
          {!showTrash && (
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#2A65F9] hover:bg-[#1E50D2]">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conhecimento
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500">Carregando base de conhecimento...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-[#2E2E2E] mb-2 line-clamp-2">
                      {card.title}
                    </CardTitle>
                    <Badge className={`${getCategoryColor(card.category)} text-xs`}>{card.category}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    {showTrash ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRestoreCard(card.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#E74C3C] hover:text-[#E74C3C]"
                          onClick={() => handlePermanentDelete(card.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCard(card)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#E74C3C] hover:text-[#E74C3C]"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{card.content}</p>
                <div className="text-xs text-gray-400">
                  Atualizado em {new Date(card.updatedAt).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredCards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            {showTrash ? "Nenhum item na lixeira" : "Nenhum conhecimento encontrado"}
          </div>
          {!showTrash && (
            <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar primeiro conhecimento
            </Button>
          )}
        </div>
      )}

      <AddKnowledgeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCard}
        categories={categories.filter((cat) => cat !== "Todas")}
      />

      {editingCard && (
        <EditKnowledgeModal
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleEditCard}
          card={editingCard}
          categories={categories.filter((cat) => cat !== "Todas")}
        />
      )}
    </AppLayout>
  )
}
