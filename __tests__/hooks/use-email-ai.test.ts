import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useEmailAI } from "@/hooks/use-email-ai"
import { toast } from "@/components/ui/use-toast"

// Mock do toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}))

// Mock do fetch
global.fetch = vi.fn()

const mockFetch = vi.mocked(fetch)
const mockToast = vi.mocked(toast)

describe("useEmailAI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve analisar e-mail com sucesso", async () => {
    const mockResponse = {
      categoria: "Produtos",
      complexidade: 2,
      palavrasChave: ["produto", "dúvida"],
      resposta: "Resposta gerada",
      precisaIntervencaoHumana: false,
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const { result } = renderHook(() => useEmailAI())

    expect(result.current.isAnalyzing).toBe(false)
    expect(result.current.result).toBeNull()

    let analysisResult: any
    await act(async () => {
      analysisResult = await result.current.analyzeEmail("Dúvida sobre produto", "Como funciona?", "João")
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/email-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assunto: "Dúvida sobre produto",
        corpo: "Como funciona?",
        nomeRemetente: "João",
      }),
    })

    expect(analysisResult).toEqual(mockResponse)
    expect(result.current.result).toEqual(mockResponse)
    expect(result.current.isAnalyzing).toBe(false)
  })

  it("deve tratar erros de API graciosamente", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useEmailAI())

    let analysisResult: any
    await act(async () => {
      analysisResult = await result.current.analyzeEmail("Teste", "Teste", "Teste")
    })

    expect(analysisResult).toBeNull()
    expect(mockToast).toHaveBeenCalledWith({
      title: "Erro na análise",
      description: "Não foi possível analisar o e-mail. Usando configurações padrão.",
      variant: "destructive",
    })
  })

  it("deve tratar erros de rede graciosamente", async () => {
    mockFetch.mockRejectedValue(new Error("Network Error"))

    const { result } = renderHook(() => useEmailAI())

    let analysisResult: any
    await act(async () => {
      analysisResult = await result.current.analyzeEmail("Teste", "Teste", "Teste")
    })

    expect(analysisResult).toBeNull()
    expect(mockToast).toHaveBeenCalled()
  })

  it("deve gerenciar estado de carregamento corretamente", async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockReturnValue(promise as any)

    const { result } = renderHook(() => useEmailAI())

    expect(result.current.isAnalyzing).toBe(false)

    act(() => {
      result.current.analyzeEmail("Teste", "Teste", "Teste")
    })

    expect(result.current.isAnalyzing).toBe(true)

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    expect(result.current.isAnalyzing).toBe(false)
  })
})
