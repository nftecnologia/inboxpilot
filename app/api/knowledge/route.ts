import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllKnowledgeCards, createKnowledgeCard, getKnowledgeStats } from "@/lib/knowledge-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get("stats")

    if (stats === "true") {
      const statistics = await getKnowledgeStats()
      return NextResponse.json({ success: true, data: statistics })
    }

    const cards = await getAllKnowledgeCards()
    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao buscar conhecimentos" 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title || !body.category || !body.content) {
      return NextResponse.json({ 
        success: false, 
        message: "Dados incompletos" 
      }, { status: 400 })
    }

    const card = await createKnowledgeCard({
      title: body.title,
      category: body.category,
      content: body.content,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true, data: card }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar conhecimento:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao criar conhecimento" 
    }, { status: 500 })
  }
}
