import { supabase } from "./supabase"
import type { KnowledgeCard } from "@/types/knowledge"

export interface DatabaseKnowledgeCard {
  id: string
  title: string
  category: string
  content: string
  created_at: string
  updated_at: string
}

// Converter do formato do banco para o formato da aplicação
function convertFromDatabase(dbCard: DatabaseKnowledgeCard): KnowledgeCard {
  return {
    id: dbCard.id,
    title: dbCard.title,
    category: dbCard.category,
    content: dbCard.content,
    createdAt: new Date(dbCard.created_at),
    updatedAt: new Date(dbCard.updated_at),
  }
}

// Converter do formato da aplicação para o formato do banco
function convertToDatabase(
  card: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">,
): Omit<DatabaseKnowledgeCard, "id" | "created_at" | "updated_at"> {
  return {
    title: card.title,
    category: card.category,
    content: card.content,
  }
}

export async function getAllKnowledgeCards(): Promise<KnowledgeCard[]> {
  const { data, error } = await supabase.from("knowledge_cards").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar conhecimentos:", error)
    throw new Error("Erro ao carregar base de conhecimento")
  }

  return data.map(convertFromDatabase)
}

export async function createKnowledgeCard(
  card: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">,
): Promise<KnowledgeCard> {
  const dbCard = convertToDatabase(card)

  const { data, error } = await supabase.from("knowledge_cards").insert(dbCard).select().single()

  if (error) {
    console.error("Erro ao criar conhecimento:", error)
    throw new Error("Erro ao salvar conhecimento")
  }

  return convertFromDatabase(data)
}

export async function updateKnowledgeCard(
  id: string,
  updates: Partial<Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">>,
): Promise<KnowledgeCard> {
  const { data, error } = await supabase.from("knowledge_cards").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar conhecimento:", error)
    throw new Error("Erro ao atualizar conhecimento")
  }

  return convertFromDatabase(data)
}

export async function deleteKnowledgeCard(id: string): Promise<void> {
  const { error } = await supabase.from("knowledge_cards").delete().eq("id", id)

  if (error) {
    console.error("Erro ao deletar conhecimento:", error)
    throw new Error("Erro ao deletar conhecimento")
  }
}

export async function getKnowledgeCardsByCategory(category: string): Promise<KnowledgeCard[]> {
  const { data, error } = await supabase
    .from("knowledge_cards")
    .select("*")
    .eq("category", category)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar conhecimentos por categoria:", error)
    throw new Error("Erro ao buscar conhecimentos")
  }

  return data.map(convertFromDatabase)
}

export async function searchKnowledgeCards(searchTerm: string): Promise<KnowledgeCard[]> {
  const { data, error } = await supabase
    .from("knowledge_cards")
    .select("*")
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar conhecimentos:", error)
    throw new Error("Erro ao buscar conhecimentos")
  }

  return data.map(convertFromDatabase)
}

export async function getKnowledgeStats() {
  const { data, error } = await supabase.from("knowledge_cards").select("category")

  if (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return { total: 0, categorias: 0 }
  }

  const categories = new Set(data.map((item) => item.category))

  return {
    total: data.length,
    categorias: categories.size,
  }
}
