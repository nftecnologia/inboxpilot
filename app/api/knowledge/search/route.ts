import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchSimilarDocuments } from "@/lib/pinecone"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { query, category, limit = 5 } = body

    if (!query) {
      return NextResponse.json({ 
        success: false, 
        message: "Query é obrigatória" 
      }, { status: 400 })
    }

    console.log("🔍 Buscando documentos similares para:", query)

    // Buscar no Pinecone
    const similarDocuments = await searchSimilarDocuments(
      query,
      limit,
      category,
      session.user.id
    )

    // Enriquecer com dados completos do Postgres
    const enrichedDocuments = await Promise.all(
      similarDocuments.map(async (doc) => {
        const fullDoc = await prisma.knowledgeBase.findUnique({
          where: { id: doc.id },
          select: {
            id: true,
            title: true,
            category: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          }
        })
        
        return {
          ...fullDoc,
          score: doc.score,
        }
      })
    )

    // Filtrar documentos não encontrados
    const validDocuments = enrichedDocuments.filter(doc => doc !== null)

    console.log(`✅ Encontrados ${validDocuments.length} documentos relevantes`)

    return NextResponse.json({ 
      success: true, 
      data: validDocuments 
    })

  } catch (error) {
    console.error("Erro na busca semântica:", error)
    
    // Fallback para busca tradicional se Pinecone falhar
    try {
      const { query, category } = await request.json()
      
      const where: any = {}
      if (category) {
        where.category = category
      }
      
      const fallbackResults = await prisma.knowledgeBase.findMany({
        where: {
          ...where,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit || 5,
        orderBy: { updatedAt: 'desc' },
      })
      
      console.log("⚠️ Usando busca tradicional (fallback)")
      
      return NextResponse.json({ 
        success: true, 
        data: fallbackResults,
        fallback: true
      })
    } catch (fallbackError) {
      console.error("Erro no fallback:", fallbackError)
      return NextResponse.json({ 
        success: false, 
        message: "Erro na busca" 
      }, { status: 500 })
    }
  }
}
