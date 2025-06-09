import { vi } from "vitest"

// Mock do console para evitar logs desnecessários nos testes
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}

// Mock das variáveis de ambiente
process.env.OPENAI_API_KEY = "test-api-key"

// Mock do fetch global se não estiver disponível
if (!global.fetch) {
  global.fetch = vi.fn()
}
