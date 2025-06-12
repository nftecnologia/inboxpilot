import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""

    // Construir filtros
    const where: any = {}
    
    if (status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { userEmail: { contains: search, mode: "insensitive" } },
      ]
    }

    // Buscar sessões com mensagens
    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, // Pegar apenas a primeira mensagem para preview
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("❌ Erro ao buscar sessões:", error)
    return NextResponse.json(
      { error: "Erro ao buscar sessões" },
      { status: 500 }
    )
  }
}
