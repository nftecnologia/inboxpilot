import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateText } from "ai"
import { analisarEmail, gerarRespostaEmail, extrairPalavrasChave, avaliarComplexidade } from "@/lib/openai"

// Mock do AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
}))

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mocked-model"),
}))

const mockGenerateText = vi.mocked(generateText)

describe("OpenAI Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("analisarEmail", () => {
    it("deve categorizar um e-mail corretamente", async () => {
      mockGenerateText.mockResolvedValue({ text: "Cadastro e Conta" })

      const resultado = await analisarEmail("Problema com login", "Não consigo acessar minha conta")

      expect(resultado).toBe("Cadastro e Conta")
      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "mocked-model",
        prompt: expect.stringContaining("Analise o seguinte e-mail"),
        maxTokens: 50,
      })
    })

    it("deve retornar categoria padrão em caso de erro", async () => {
      mockGenerateText.mockRejectedValue(new Error("API Error"))

      const resultado = await analisarEmail("Teste", "Teste")

      expect(resultado).toBe("Geral")
    })

    it("deve remover espaços em branco da resposta", async () => {
      mockGenerateText.mockResolvedValue({ text: "  Produtos  " })

      const resultado = await analisarEmail("Dúvida sobre produto", "Como usar?")

      expect(resultado).toBe("Produtos")
    })
  })

  describe("gerarRespostaEmail", () => {
    it("deve gerar uma resposta personalizada", async () => {
      const respostaEsperada = "Olá João,\n\nObrigado pelo contato...\n\nAtenciosamente,\nEquipe de Suporte"
      mockGenerateText.mockResolvedValue({ text: respostaEsperada })

      const resultado = await gerarRespostaEmail(
        "Dúvida sobre produto",
        "Como funciona o produto X?",
        "João",
        "Produtos",
      )

      expect(resultado).toBe(respostaEsperada)
      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "mocked-model",
        prompt: expect.stringContaining("Você é um assistente de suporte"),
        temperature: 0.7,
        maxTokens: 500,
      })
    })

    it("deve retornar resposta padrão em caso de erro", async () => {
      mockGenerateText.mockRejectedValue(new Error("API Error"))

      const resultado = await gerarRespostaEmail("Teste", "Teste", "João", "Geral")

      expect(resultado).toContain("Olá João")
      expect(resultado).toContain("Atenciosamente")
    })

    it("deve incluir o nome do remetente na resposta padrão", async () => {
      mockGenerateText.mockRejectedValue(new Error("API Error"))

      const resultado = await gerarRespostaEmail("Teste", "Teste", "Maria", "Geral")

      expect(resultado).toContain("Olá Maria")
    })
  })

  describe("extrairPalavrasChave", () => {
    it("deve extrair palavras-chave corretamente", async () => {
      mockGenerateText.mockResolvedValue({ text: "login, conta, acesso, problema, senha" })

      const resultado = await extrairPalavrasChave("Problema com login", "Não consigo acessar minha conta")

      expect(resultado).toEqual(["login", "conta", "acesso", "problema", "senha"])
    })

    it("deve retornar array vazio em caso de erro", async () => {
      mockGenerateText.mockRejectedValue(new Error("API Error"))

      const resultado = await extrairPalavrasChave("Teste", "Teste")

      expect(resultado).toEqual([])
    })

    it("deve remover espaços em branco das palavras-chave", async () => {
      mockGenerateText.mockResolvedValue({ text: " login , conta , acesso " })

      const resultado = await extrairPalavrasChave("Teste", "Teste")

      expect(resultado).toEqual(["login", "conta", "acesso"])
    })
  })

  describe("avaliarComplexidade", () => {
    it("deve retornar um número entre 1 e 5", async () => {
      mockGenerateText.mockResolvedValue({ text: "3" })

      const resultado = await avaliarComplexidade("Dúvida simples", "Como faço para...")

      expect(resultado).toBe(3)
      expect(resultado).toBeGreaterThanOrEqual(1)
      expect(resultado).toBeLessThanOrEqual(5)
    })

    it("deve retornar 3 para resposta inválida", async () => {
      mockGenerateText.mockResolvedValue({ text: "resposta inválida" })

      const resultado = await avaliarComplexidade("Teste", "Teste")

      expect(resultado).toBe(3)
    })

    it("deve retornar 3 em caso de erro", async () => {
      mockGenerateText.mockRejectedValue(new Error("API Error"))

      const resultado = await avaliarComplexidade("Teste", "Teste")

      expect(resultado).toBe(3)
    })
  })
})
