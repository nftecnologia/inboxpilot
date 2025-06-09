import { describe, it, expect } from "vitest"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

describe("OpenAI Integration Tests", () => {
  // Só executa se não estiver em ambiente de CI ou se tiver a chave da API
  const shouldRunIntegrationTests = !process.env.CI || process.env.OPENAI_API_KEY

  it.skipIf(!shouldRunIntegrationTests)(
    "deve conectar com a API da OpenAI",
    async () => {
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: "Responda apenas com 'OK' se você conseguir me ouvir.",
        maxTokens: 10,
      })

      expect(text.toLowerCase()).toContain("ok")
    },
    30000,
  ) // 30 segundos de timeout

  it.skipIf(!shouldRunIntegrationTests)(
    "deve categorizar e-mail corretamente",
    async () => {
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: `
        Categorize este e-mail em uma das seguintes opções: Produtos, Cadastro, Geral
        
        Assunto: Dúvida sobre funcionalidade do produto
        Corpo: Como posso usar a funcionalidade X do produto Y?
        
        Responda apenas com o nome da categoria.
      `,
        maxTokens: 20,
      })

      expect(["Produtos", "Produto", "produtos", "produto"]).toContain(text.trim())
    },
    30000,
  )

  it.skipIf(!shouldRunIntegrationTests)(
    "deve gerar resposta em português",
    async () => {
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: `
        Gere uma resposta de suporte em português para:
        "Olá, não consigo fazer login na minha conta"
        
        Limite: 50 palavras
      `,
        maxTokens: 150,
      })

      // Verifica se contém palavras em português
      const palavrasPortugues = ["olá", "obrigado", "agradecemos", "conta", "login", "acesso"]
      const contemPortugues = palavrasPortugues.some((palavra) => text.toLowerCase().includes(palavra))

      expect(contemPortugues).toBe(true)
    },
    30000,
  )
})
