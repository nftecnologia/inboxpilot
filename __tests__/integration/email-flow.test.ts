import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/email-analysis/route"
import { NextRequest } from "next/server"

// Teste de integração completo
describe("Fluxo completo de análise de e-mail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve processar um e-mail de cadastro do início ao fim", async () => {
    const emailData = {
      assunto: "Não consigo criar minha conta",
      corpo:
        "Estou tentando me cadastrar no sistema mas recebo erro quando clico em criar conta. Já tentei várias vezes.",
      nomeRemetente: "Ana Silva",
    }

    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify(emailData),
    })

    const response = await POST(request)
    const data = await response.json()

    // Verificar estrutura da resposta
    expect(response.status).toBe(200)
    expect(data).toHaveProperty("categoria")
    expect(data).toHaveProperty("complexidade")
    expect(data).toHaveProperty("palavrasChave")
    expect(data).toHaveProperty("precisaIntervencaoHumana")

    // Verificar tipos
    expect(typeof data.categoria).toBe("string")
    expect(typeof data.complexidade).toBe("number")
    expect(Array.isArray(data.palavrasChave)).toBe(true)
    expect(typeof data.precisaIntervencaoHumana).toBe("boolean")

    // Verificar valores válidos
    expect(data.complexidade).toBeGreaterThanOrEqual(1)
    expect(data.complexidade).toBeLessThanOrEqual(5)

    // Se não precisa de intervenção humana, deve ter resposta
    if (!data.precisaIntervencaoHumana) {
      expect(data.resposta).toBeTruthy()
      expect(typeof data.resposta).toBe("string")
    }
  })

  it("deve processar um e-mail complexo que requer intervenção humana", async () => {
    const emailData = {
      assunto: "Problema crítico na integração com API externa",
      corpo:
        "Estamos enfrentando falhas intermitentes na integração com a API do nosso parceiro. Os logs mostram timeouts aleatórios e precisamos de uma análise técnica detalhada do problema.",
      nomeRemetente: "João Desenvolvedor",
    }

    const request = new NextRequest("http://localhost:3000/api/email-analysis", {
      method: "POST",
      body: JSON.stringify(emailData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)

    // E-mails técnicos complexos devem ter alta complexidade
    expect(data.complexidade).toBeGreaterThanOrEqual(3)

    // Palavras-chave devem incluir termos técnicos
    const palavrasChaveString = data.palavrasChave.join(" ").toLowerCase()
    expect(palavrasChaveString).toMatch(/api|integração|técnico|problema/i)
  })
})
