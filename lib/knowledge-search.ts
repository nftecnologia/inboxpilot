import type { KnowledgeCard } from "@/types/knowledge"
import { getAllKnowledgeCards } from "./knowledge-db"

// Função para buscar conhecimentos por categoria
export function buscarConhecimentoPorCategoria(categoria: string, knowledgeCards: KnowledgeCard[]): KnowledgeCard[] {
  return knowledgeCards.filter((card) => card.category === categoria)
}

// Função para buscar conhecimentos por palavras-chave
export function buscarConhecimentoPorPalavrasChave(
  palavrasChave: string[],
  knowledgeCards: KnowledgeCard[],
): KnowledgeCard[] {
  if (!palavrasChave || palavrasChave.length === 0) return []

  return knowledgeCards.filter((card) => {
    const texto = `${card.title} ${card.content}`.toLowerCase()
    return palavrasChave.some((palavra) => texto.includes(palavra.toLowerCase()))
  })
}

// Função para buscar conhecimentos relevantes
export async function buscarConhecimentoRelevante(
  categoria: string,
  palavrasChave: string[],
  assunto: string,
  corpo: string,
): Promise<KnowledgeCard[]> {
  try {
    console.log("🔍 Buscando conhecimento relevante para:", { categoria, palavrasChave, assunto })

    // Buscar todos os conhecimentos da base de dados
    const knowledgeCards = await getAllKnowledgeCards()
    console.log("📚 Total de conhecimentos na base:", knowledgeCards.length)

    // Primeiro, filtra por categoria
    let resultados = knowledgeCards.filter((card) => card.category === categoria)
    console.log(`🏷️ Conhecimentos na categoria "${categoria}":`, resultados.length)

    // Se não encontrou nada na categoria, busca em todas
    if (resultados.length === 0) {
      console.log("🔄 Nenhum conhecimento na categoria específica, buscando em todas...")
      resultados = knowledgeCards
    }

    // Aplica busca por palavras-chave
    const textoCompleto = `${assunto} ${corpo}`.toLowerCase()
    console.log("🔤 Texto completo para busca:", textoCompleto)

    resultados = resultados.filter((card) => {
      const textoCard = `${card.title} ${card.content}`.toLowerCase()

      // Verifica se alguma palavra-chave está presente
      const temPalavraChave = palavrasChave.some(
        (palavra) => textoCard.includes(palavra.toLowerCase()) || textoCompleto.includes(palavra.toLowerCase()),
      )

      // Verifica se há correspondência no assunto ou corpo
      const temCorrespondencia = textoCard.includes(assunto.toLowerCase()) || textoCard.includes(corpo.toLowerCase())

      const relevante = temPalavraChave || temCorrespondencia

      if (relevante) {
        console.log("✅ Conhecimento relevante encontrado:", card.title)
      }

      return relevante
    })

    console.log("🎯 Total de conhecimentos relevantes encontrados:", resultados.length)

    // Ordena por relevância (mais recentes primeiro)
    const resultadosOrdenados = resultados.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5)

    console.log(
      "📋 Conhecimentos selecionados:",
      resultadosOrdenados.map((k) => k.title),
    )

    return resultadosOrdenados
  } catch (error) {
    console.error("💥 Erro ao buscar conhecimento relevante:", error)
    return []
  }
}

// Função para formatar conhecimentos para IA
export function formatarConhecimentoParaIA(conhecimentos: KnowledgeCard[]): string {
  console.log("📝 Formatando conhecimentos para IA:", conhecimentos.length, "itens")

  if (conhecimentos.length === 0) {
    console.log("❌ Nenhum conhecimento relevante encontrado na base de dados.")
    return "Nenhum conhecimento relevante encontrado na base de dados."
  }

  let contexto = "Base de Conhecimento Relevante:\n\n"

  conhecimentos.forEach((conhecimento, index) => {
    contexto += `${index + 1}. CATEGORIA: ${conhecimento.category}\n`
    contexto += `   TÍTULO: ${conhecimento.title}\n`
    contexto += `   CONTEÚDO: ${conhecimento.content}\n\n`
  })

  contexto += "\nUse essas informações para gerar uma resposta personalizada e precisa."

  console.log("✅ Contexto formatado:", contexto.substring(0, 200) + "...")
  return contexto
}

// Função para obter estatísticas da base de conhecimento
export function obterEstatisticasBaseConhecimento(knowledgeCards: KnowledgeCard[]): {
  total: number
  categorias: number
} {
  const categorias = new Set(knowledgeCards.map((card) => card.category))

  return {
    total: knowledgeCards.length,
    categorias: categorias.size,
  }
}
