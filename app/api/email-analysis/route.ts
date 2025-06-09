import { NextResponse } from "next/server"
import { analisarEmail, gerarRespostaEmail, extrairPalavrasChave, avaliarComplexidade } from "@/lib/openai"

export async function POST(req: Request) {
  try {
    console.log("🚀 API /email-analysis chamada")

    const body = await req.json()
    console.log("📥 Dados recebidos:", body)

    const { assunto, corpo, nomeRemetente } = body

    if (!assunto || !corpo || !nomeRemetente) {
      console.log("❌ Dados obrigatórios faltando")
      return NextResponse.json({ error: "Assunto, corpo e nome do remetente são obrigatórios" }, { status: 400 })
    }

    console.log("🔍 Iniciando análise de categoria...")
    // Analisar categoria
    const categoria = await analisarEmail(assunto, corpo)
    console.log("✅ Categoria identificada:", categoria)

    console.log("🔍 Extraindo palavras-chave...")
    // Extrair palavras-chave
    const palavrasChave = await extrairPalavrasChave(assunto, corpo)
    console.log("✅ Palavras-chave:", palavrasChave)

    console.log("🔍 Avaliando complexidade...")
    // Avaliar complexidade
    const complexidade = await avaliarComplexidade(assunto, corpo)
    console.log("✅ Complexidade:", complexidade)

    console.log("🔍 Gerando resposta...")
    // Gerar resposta automática
    const resposta = await gerarRespostaEmail(assunto, corpo, nomeRemetente, categoria, palavrasChave)
    console.log("✅ Resposta gerada:", resposta ? "Sim" : "Não")

    // Determinar se precisa intervenção humana
    const precisaIntervencaoHumana = complexidade >= 4

    const resultado = {
      categoria,
      complexidade,
      palavrasChave,
      resposta,
      precisaIntervencaoHumana,
    }

    console.log("✅ Análise concluída:", resultado)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error("💥 Erro detalhado na API:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "Sem stack trace")

    // Retornar erro mais detalhado
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
