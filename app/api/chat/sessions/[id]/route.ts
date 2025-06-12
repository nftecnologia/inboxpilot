import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(chatSession)
  } catch (error) {
    console.error("❌ Erro ao buscar sessão:", error)
    return NextResponse.json(
      { error: "Erro ao buscar sessão" },
      { status: 500 }
    )
  }
}
