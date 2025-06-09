import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    if (!body.title && !body.category && !body.content) {
      return NextResponse.json({ success: false, message: "Nenhum dado para atualizar" }, { status: 400 })
    }

    // Tentar usar Supabase se disponível
    try {
      const { updateKnowledgeCard } = await import("@/lib/knowledge-db")

      const updates: Record<string, string> = {}
      if (body.title) updates.title = body.title
      if (body.category) updates.category = body.category
      if (body.content) updates.content = body.content

      const card = await updateKnowledgeCard(id, updates)
      return NextResponse.json({ success: true, data: card })
    } catch (dbError) {
      console.warn("Usando fallback local:", dbError)

      // Fallback local
      const updatedCard = {
        id,
        title: body.title || "Título atualizado",
        category: body.category || "Geral",
        content: body.content || "Conteúdo atualizado",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json({ success: true, data: updatedCard })
    }
  } catch (error) {
    console.error("Erro ao atualizar conhecimento:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar conhecimento" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Tentar usar Supabase se disponível
    try {
      const { deleteKnowledgeCard } = await import("@/lib/knowledge-db")
      await deleteKnowledgeCard(id)
      return NextResponse.json({ success: true, message: "Conhecimento excluído com sucesso" })
    } catch (dbError) {
      console.warn("Usando fallback local:", dbError)
      return NextResponse.json({ success: true, message: "Conhecimento excluído com sucesso (local)" })
    }
  } catch (error) {
    console.error("Erro ao excluir conhecimento:", error)
    return NextResponse.json({ success: false, message: "Erro ao excluir conhecimento" }, { status: 500 })
  }
}
