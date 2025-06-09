import { type NextRequest, NextResponse } from "next/server"

// API TEMPORÁRIA APENAS PARA TESTES - NÃO ALTERA NADA DO CÓDIGO EXISTENTE
export async function POST(request: NextRequest) {
  try {
    // E-mails de teste conforme solicitado (sem categoria para a IA identificar)
    const testEmails = [
      {
        id: `test-cupom-${Date.now()}`,
        subject: "Cupom de Desconto",
        sender: "cliente1@teste.com",
        senderName: "Maria Santos",
        date: new Date().toISOString(),
        status: "recebidos",
        body: "Não estou conseguindo criar um cupom de desconto. Como faço?",
        actions: [
          {
            type: "received",
            timestamp: new Date().toISOString(),
            description: "E-mail recebido",
          },
        ],
        isFavorite: false,
      },
      {
        id: `test-saque-${Date.now() + 1}`,
        subject: "Saque",
        sender: "cliente2@teste.com",
        senderName: "João Silva",
        date: new Date().toISOString(),
        status: "recebidos",
        body: "Está dando erro para solicitar o saque. Como tenho que fazer? Preciso de ajuda.",
        actions: [
          {
            type: "received",
            timestamp: new Date().toISOString(),
            description: "E-mail recebido",
          },
        ],
        isFavorite: false,
      },
      {
        id: `test-biometria-${Date.now() + 2}`,
        subject: "Biometria Recusada",
        sender: "cliente3@teste.com",
        senderName: "Ana Costa",
        date: new Date().toISOString(),
        status: "recebidos",
        body: "Fiz tudo correto no processo mas minha biometria não foi aceita, e por isso não consigo realizar saque. Preciso de ajuda para resolver isso",
        actions: [
          {
            type: "received",
            timestamp: new Date().toISOString(),
            description: "E-mail recebido",
          },
        ],
        isFavorite: false,
      },
    ]

    // Retorna os e-mails criados para você poder copiá-los manualmente
    return NextResponse.json({
      success: true,
      message: "E-mails de teste criados com sucesso!",
      emails: testEmails,
      instructions: {
        step1: "Copie os e-mails do campo 'emails' desta resposta",
        step2: "Vá para a página /emails do seu app",
        step3: "Abra o console do navegador (F12)",
        step4: "Cole os dados dos e-mails no localStorage ou use para adicionar manualmente",
        note: "Esta API é apenas para gerar os dados de teste. Não modifica nada no app.",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao criar e-mails de teste",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Método GET para visualizar os e-mails de teste
export async function GET() {
  return NextResponse.json({
    message: "API de teste ativa. Use POST para gerar e-mails de teste.",
    endpoint: "/api/add-test-emails",
    method: "POST",
  })
}
