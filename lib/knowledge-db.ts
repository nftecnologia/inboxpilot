import { prisma } from "./prisma"
import type { KnowledgeCard } from "@/types/knowledge"

// Converter do formato do Prisma para o formato da aplicação
function convertFromDatabase(dbCard: any): KnowledgeCard {
  return {
    id: dbCard.id,
    title: dbCard.title,
    category: dbCard.category,
    content: dbCard.content,
    createdAt: dbCard.createdAt,
    updatedAt: dbCard.updatedAt,
  }
}

export async function getAllKnowledgeCards(): Promise<KnowledgeCard[]> {
  try {
    const data = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    })

    return data.map(convertFromDatabase)
  } catch (error) {
    console.error("Erro ao buscar conhecimentos:", error)
    throw new Error("Erro ao carregar base de conhecimento")
  }
}

export async function createKnowledgeCard(
  card: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt"> & { userId: string },
): Promise<KnowledgeCard> {
  try {
    const data = await prisma.knowledgeBase.create({
      data: {
        title: card.title,
        category: card.category,
        content: card.content,
        userId: card.userId,
        keywords: [], // Array vazio inicialmente
        tags: [], // Array vazio inicialmente
      },
    })

    return convertFromDatabase(data)
  } catch (error) {
    console.error("Erro ao criar conhecimento:", error)
    throw new Error("Erro ao salvar conhecimento")
  }
}

export async function updateKnowledgeCard(
  id: string,
  updates: Partial<Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">>,
): Promise<KnowledgeCard> {
  try {
    const data = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    return convertFromDatabase(data)
  } catch (error) {
    console.error("Erro ao atualizar conhecimento:", error)
    throw new Error("Erro ao atualizar conhecimento")
  }
}

export async function deleteKnowledgeCard(id: string): Promise<void> {
  try {
    await prisma.knowledgeBase.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (error) {
    console.error("Erro ao deletar conhecimento:", error)
    throw new Error("Erro ao deletar conhecimento")
  }
}

export async function getKnowledgeCardsByCategory(category: string): Promise<KnowledgeCard[]> {
  try {
    const data = await prisma.knowledgeBase.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return data.map(convertFromDatabase)
  } catch (error) {
    console.error("Erro ao buscar conhecimentos por categoria:", error)
    throw new Error("Erro ao buscar conhecimentos")
  }
}

export async function searchKnowledgeCards(searchTerm: string): Promise<KnowledgeCard[]> {
  try {
    const data = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    })

    return data.map(convertFromDatabase)
  } catch (error) {
    console.error("Erro ao buscar conhecimentos:", error)
    throw new Error("Erro ao buscar conhecimentos")
  }
}

export async function getKnowledgeStats() {
  try {
    const data = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      select: { category: true },
    })

    const categories = new Set(data.map((item: { category: string }) => item.category))

    return {
      total: data.length,
      categorias: categories.size,
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return { total: 0, categorias: 0 }
  }
}
