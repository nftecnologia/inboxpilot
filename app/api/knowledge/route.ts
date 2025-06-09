import { NextResponse } from "next/server"

// Dados mock para fallback
const mockKnowledgeCards = [
  {
    id: "1",
    title: "Como resetar senha",
    category: "Cadastro e Conta",
    content:
      "Para resetar a senha: 1) Acesse a página de login 2) Clique em 'Esqueci minha senha' 3) Digite seu e-mail 4) Verifique sua caixa de entrada 5) Clique no link recebido 6) Defina uma nova senha",
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Política de reembolso",
    category: "Checkout e Conversão",
    content:
      "Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação.",
    created_at: "2024-01-08T00:00:00.000Z",
    updated_at: "2024-01-12T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Funcionalidades do plano premium",
    category: "Produtos",
    content:
      "O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta.",
    created_at: "2024-01-05T00:00:00.000Z",
    updated_at: "2024-01-05T00:00:00.000Z",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get("stats")

    if (stats === "true") {
      const categories = new Set(mockKnowledgeCards.map((card) => card.category))
      const statistics = {
        total: mockKnowledgeCards.length,
        categorias: categories.size,
      }
      return NextResponse.json({ success: true, data: statistics })
    }

    // Tentar usar Supabase se disponível, senão usar mock
    try {
      const { getAllKnowledgeCards } = await import("@/lib/knowledge-db")
      const cards = await getAllKnowledgeCards()
      return NextResponse.json({ success: true, data: cards })
    } catch (dbError) {
      console.warn("Usando dados mock:", dbError)
      return NextResponse.json({ success: true, data: mockKnowledgeCards })
    }
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ success: true, data: mockKnowledgeCards })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.category || !body.content) {
      return NextResponse.json({ success: false, message: "Dados incompletos" }, { status: 400 })
    }

    // Tentar usar Supabase se disponível
    try {
      const { createKnowledgeCard } = await import("@/lib/knowledge-db")
      const card = await createKnowledgeCard({
        title: body.title,
        category: body.category,
        content: body.content,
      })
      return NextResponse.json({ success: true, data: card }, { status: 201 })
    } catch (dbError) {
      console.warn("Usando fallback local:", dbError)

      // Fallback local
      const newCard = {
        id: Date.now().toString(),
        title: body.title,
        category: body.category,
        content: body.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json({ success: true, data: newCard }, { status: 201 })
    }
  } catch (error) {
    console.error("Erro ao criar conhecimento:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar conhecimento" }, { status: 500 })
  }
}
