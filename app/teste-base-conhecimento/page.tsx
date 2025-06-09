"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { Search, Database, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import type { KnowledgeCard } from "@/types/knowledge"

export default function TesteBaseConhecimentoPage() {
  const [categoria, setCategoria] = useState("Cadastro e Conta")
  const [palavrasChave, setPalavrasChave] = useState("senha, resetar, login")
  const [assunto, setAssunto] = useState("Não consigo fazer login na minha conta")
  const [corpo, setCorpo] = useState(
    "Olá, estou tentando fazer login na minha conta mas esqueci minha senha. Como posso resetar?",
  )
  const [resultados, setResultados] = useState<KnowledgeCard[]>([])
  const [contextoIA, setContextoIA] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>([])
  const [estatisticas, setEstatisticas] = useState({ total: 0, categorias: 0 })

  const categorias = [
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
  ]

  // Carregar dados da base de conhecimento
  useEffect(() => {
    loadKnowledgeCards()
  }, [])

  const loadKnowledgeCards = async () => {
    try {
      const response = await fetch("/api/knowledge")
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          const cards = data.data.map((item: any) => ({
            ...item,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          }))
          setKnowledgeCards(cards)

          // Calcular estatísticas
          const categorias = new Set(cards.map((card: KnowledgeCard) => card.category))
          setEstatisticas({
            total: cards.length,
            categorias: categorias.size,
          })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar conhecimentos:", error)
    }
  }

  const buscarPorCategoria = () => {
    setIsLoading(true)
    setTimeout(() => {
      const resultados = knowledgeCards.filter((card) => card.category === categoria)
      setResultados(resultados)
      setContextoIA(formatarParaIA(resultados))
      setIsLoading(false)
    }, 500)
  }

  const buscarPorPalavrasChave = () => {
    setIsLoading(true)
    setTimeout(() => {
      const palavras = palavrasChave.split(",").map((p) => p.trim().toLowerCase())
      const resultados = knowledgeCards.filter((card) => {
        const texto = `${card.title} ${card.content}`.toLowerCase()
        return palavras.some((palavra) => texto.includes(palavra))
      })
      setResultados(resultados)
      setContextoIA(formatarParaIA(resultados))
      setIsLoading(false)
    }, 500)
  }

  const buscarRelevante = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Busca inteligente combinando categoria e palavras-chave
      let resultados = knowledgeCards.filter((card) => card.category === categoria)

      if (resultados.length === 0) {
        const palavras = palavrasChave.split(",").map((p) => p.trim().toLowerCase())
        resultados = knowledgeCards.filter((card) => {
          const texto = `${card.title} ${card.content}`.toLowerCase()
          return palavras.some((palavra) => texto.includes(palavra))
        })
      }

      // Ordenar por relevância (mais recentes primeiro)
      resultados.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      setResultados(resultados.slice(0, 5))
      setContextoIA(formatarParaIA(resultados.slice(0, 5)))
      setIsLoading(false)
    }, 500)
  }

  const formatarParaIA = (conhecimentos: KnowledgeCard[]): string => {
    if (conhecimentos.length === 0) {
      return "Nenhum conhecimento relevante encontrado na base de dados."
    }

    let contexto = "Base de Conhecimento Relevante:\n\n"
    conhecimentos.forEach((conhecimento, index) => {
      contexto += `${index + 1}. CATEGORIA: ${conhecimento.category}\n`
      contexto += `   TÍTULO: ${conhecimento.title}\n`
      contexto += `   CONTEÚDO: ${conhecimento.content}\n\n`
    })
    contexto += "\nUse essas informações para gerar uma resposta personalizada e precisa."

    return contexto
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
      default:
        return "bg-neutral-600 text-white"
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Teste da Base de Conhecimento</h1>
          <p className="text-sm text-gray-500">Teste as funcionalidades de busca e integração com IA</p>
        </div>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Estatísticas da Base de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
                <div className="text-sm text-gray-500">Total de Conhecimentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{estatisticas.categorias}</div>
                <div className="text-sm text-gray-500">Categorias Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {estatisticas.categorias > 0 ? Math.round(estatisticas.total / estatisticas.categorias) : 0}
                </div>
                <div className="text-sm text-gray-500">Média por Categoria</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Teste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Search className="h-5 w-5 mr-2 text-blue-500" />
                Parâmetros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Palavras-chave (separadas por vírgula)
                </label>
                <Input
                  value={palavrasChave}
                  onChange={(e) => setPalavrasChave(e.target.value)}
                  placeholder="senha, login, resetar"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assunto do E-mail</label>
                <Input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Assunto do e-mail para teste"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Corpo do E-mail</label>
                <Textarea
                  value={corpo}
                  onChange={(e) => setCorpo(e.target.value)}
                  placeholder="Conteúdo do e-mail para teste"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={buscarPorCategoria} className="w-full" variant="outline" disabled={isLoading}>
                  {isLoading ? "Buscando..." : "Buscar por Categoria"}
                </Button>
                <Button onClick={buscarPorPalavrasChave} className="w-full" variant="outline" disabled={isLoading}>
                  {isLoading ? "Buscando..." : "Buscar por Palavras-chave"}
                </Button>
                <Button onClick={buscarRelevante} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isLoading ? "Buscando..." : "Busca Inteligente (IA)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Resultados da Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : resultados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum resultado encontrado</p>
                  <p className="text-sm">Execute uma busca para ver os resultados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resultados.map((conhecimento) => (
                    <div key={conhecimento.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{conhecimento.title}</h4>
                        <Badge className={`${getCategoryColor(conhecimento.category)} text-xs`}>
                          {conhecimento.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{conhecimento.content}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        Atualizado em {conhecimento.updatedAt.toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contexto para IA */}
        {contextoIA && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                Contexto Formatado para IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{contextoIA}</pre>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                ✅ Este é o contexto que será enviado para a IA gerar respostas personalizadas
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
