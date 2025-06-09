import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/email-analysis/route"
import { NextRequest } from "next/server"
import * as openaiLib from "@/lib/openai"

// Mock das funções da OpenAI
vi.mock("@/lib/openai", () => ({
  analisarEmail: vi.fn(),
  gerarRespostaEmail: vi.fn(),
  extrairPalavrasChave: vi.fn(),
  avaliarComplexidade: vi.fn(),
}))

const mockAnalisarEmail = vi.mocked(openaiLib.analisarEmail)
const mockGerarRespostaEmail = vi.mocked(openaiLib.gerarRespostaEmail)
const mockExtrairPalavrasChave = vi.mocked(openaiLib.extrairPalavrasChave)
const mockAvaliarComplexidade = vi.mocked(openaiLib.avaliarComplexidade)

describe("/api/email-analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve processar análise de e-mail com sucesso", async () => {
    // Configurar mocks
    mockAnalisarEmail.mockResolvedValue("Produtos")
    mockAvaliarComplexidade.mockResolvedValue(2)
    mockExtrairPalavrasChave.mockResolvedValue(["produto", "dúvida", "funcionalidade"])
    mockGerarRespostaEmail.mockResolvedValue("Olá João, obrigado pelo contato...")

    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify({
        assunto: "Dúvida sobre produto",
        corpo: "Como funciona o produto X?",
        nomeRemetente: "João",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      categoria: "Produtos",
      complexidade: 2,
      palavrasChave: ["produto", "dúvida", "funcionalidade"],
      resposta: "Olá João, obrigado pelo contato...",
      precisaIntervencaoHumana: false,
    })
  })

  it("deve não gerar resposta para e-mails complexos", async () => {
    mockAnalisarEmail.mockResolvedValue("Geral")
    mockAvaliarComplexidade.mockResolvedValue(4)
    mockExtrairPalavrasChave.mockResolvedValue(["complexo", "técnico"])

    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify({
        assunto: "Problema técnico complexo",
        corpo: "Tenho um problema muito específico...",
        nomeRemetente: "Maria",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.resposta).toBeNull()
    expect(data.precisaIntervencaoHumana).toBe(true)
    expect(mockGerarRespostaEmail).not.toHaveBeenCalled()
  })

  it("deve retornar erro 400 para dados inválidos", async () => {
    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify({
        assunto: "",
        corpo: "",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Assunto e corpo do e-mail são obrigatórios")
  })

  it("deve tratar erros internos graciosamente", async () => {
    mockAnalisarEmail.mockRejectedValue(new Error("API Error"))

    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify({
        assunto: "Teste",
        corpo: "Teste",
        nomeRemetente: "Teste",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Erro ao processar a análise do e-mail")
  })
})
