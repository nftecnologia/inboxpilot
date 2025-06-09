import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email não encontrado" 
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: email })
  } catch (error) {
    console.error("Erro ao buscar email:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao buscar email" 
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { status, isRead, isStarred, category, aiResponse } = body

    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email não encontrado" 
      }, { status: 404 })
    }

    const updatedEmail = await prisma.email.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(typeof isRead === "boolean" && { isRead }),
        ...(typeof isStarred === "boolean" && { isStarred }),
        ...(category && { category }),
        ...(aiResponse && { aiResponse }),
        updatedAt: new Date(),
        ...(status === "responded" && { respondedAt: new Date() }),
        ...(status === "processed" && { processedAt: new Date() }),
      },
    })

    return NextResponse.json({ success: true, data: updatedEmail })
  } catch (error) {
    console.error("Erro ao atualizar email:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao atualizar email" 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email não encontrado" 
      }, { status: 404 })
    }

    await prisma.email.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Email deletado com sucesso" 
    })
  } catch (error) {
    console.error("Erro ao deletar email:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao deletar email" 
    }, { status: 500 })
  }
}
