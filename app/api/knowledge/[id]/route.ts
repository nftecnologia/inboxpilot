import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateDocument, deleteDocument } from "@/lib/pinecone"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.title && !body.category && !body.content) {
      return NextResponse.json(
        { success: false, message: "Nenhum dado para atualizar" },
        { status: 400 }
      )
    }

    // Atualizar no banco Neon Postgres usando Prisma
    const updatedCard = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.category && { category: body.category }),
        ...(body.content && { content: body.content }),
      },
    })

    // Atualizar no Pinecone de forma assíncrona
    updateDocument(
      updatedCard.id,
      updatedCard.title,
      updatedCard.content,
      updatedCard.category,
      updatedCard.userId
    ).catch(error => {
      console.error("Erro ao atualizar no Pinecone (não crítico):", error)
    })

    return NextResponse.json({ success: true, data: updatedCard })
  } catch (error) {
    console.error("Erro ao atualizar conhecimento:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar conhecimento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Deletar do banco Neon Postgres usando Prisma
    await prisma.knowledgeBase.delete({
      where: { id },
    })

    // Deletar do Pinecone de forma assíncrona
    deleteDocument(id).catch(error => {
      console.error("Erro ao deletar do Pinecone (não crítico):", error)
    })

    return NextResponse.json({
      success: true,
      message: "Conhecimento excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir conhecimento:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao excluir conhecimento" },
      { status: 500 }
    )
  }
}
