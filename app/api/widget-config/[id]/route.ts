import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH - Atualizar configuração
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se a configuração pertence ao usuário
    const existingConfig = await prisma.widgetConfig.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuração não encontrada" },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Atualizar configuração
    const updatedConfig = await prisma.widgetConfig.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("Erro ao atualizar configuração:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar configuração" },
      { status: 500 }
    )
  }
}

// DELETE - Remover configuração
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se a configuração pertence ao usuário
    const existingConfig = await prisma.widgetConfig.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuração não encontrada" },
        { status: 404 }
      )
    }

    // Deletar configuração
    await prisma.widgetConfig.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar configuração:", error)
    return NextResponse.json(
      { error: "Erro ao deletar configuração" },
      { status: 500 }
    )
  }
}
