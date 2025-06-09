import { describe, it, expect } from "vitest"
import { analisarEmail, gerarRespostaEmail, extrairPalavrasChave, avaliarComplexidade } from "@/lib/openai"

describe("OpenAI API Response Validation", () => {
  const shouldRunValidation = !process.env.CI || process.env.OPENAI_API_KEY

  it.skipIf(!shouldRunValidation)(
    "deve retornar categoria válida",
    async () => {
      const categoria = await analisarEmail("Problema com checkout", "Não consigo finalizar minha compra")

      const categoriasValidas = [
        "Cadastro e Conta",
        "Checkout e Conversão",
        "Produtos",
        "Marketplace",
        "Área de Membros",
        "Integrações",
        "Afiliados",
        "Geral",
        "Consumidor",
        "Plágio",
        "Upsell One Click",
        "Biometria",
      ]

      expect(categoriasValidas).toContain(categoria)
    },
    30000,
  )

  it.skipIf(!shouldRunValidation)(
    "deve retornar complexidade entre 1 e 5",
    async () => {
      const complexidade = await avaliarComplexidade("Dúvida simples", "Como faço para alterar minha senha?")

      expect(complexidade).toBeGreaterThanOrEqual(1)
      expect(complexidade).toBeLessThanOrEqual(5)
      expect(Number.isInteger(complexidade)).toBe(true)
    },
    30000,
  )

  it.skipIf(!shouldRunValidation)(
    "deve extrair palavras-chave relevantes",
    async () => {
      const palavrasChave = await extrairPalavrasChave(
        "Problema com pagamento",
        "Meu cartão foi recusado durante o checkout",
      )

      expect(Array.isArray(palavrasChave)).toBe(true)
      expect(palavrasChave.length).toBeGreaterThan(0)
      expect(palavrasChave.length).toBeLessThanOrEqual(5)

      // Verifica se contém palavras relevantes
      const palavrasRelevantes = ["pagamento", "cartão", "checkout", "recusado"]
      const temPalavraRelevante = palavrasChave.some((palavra) =>
        palavrasRelevantes.some((relevante) => palavra.toLowerCase().includes(relevante)),
      )
      expect(temPalavraRelevante).toBe(true)
    },
    30000,
  )

  it.skipIf(!shouldRunValidation)(
    "deve gerar resposta estruturada",
    async () => {
      const resposta = await gerarRespostaEmail(
        "Dúvida sobre produto",
        "Como funciona o produto X?",
        "João Silva",
        "Produtos",
      )

      expect(resposta).toContain("João")
      expect(resposta).toContain("Olá")
      expect(resposta.toLowerCase()).toContain("atenciosamente")
      expect(resposta.length).toBeGreaterThan(50)
      expect(resposta.length).toBeLessThan(2000)
    },
    30000,
  )
})
