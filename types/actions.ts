export interface AppError {
  code: string
  message: string
  details?: unknown
}

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: AppError }

export const appErrors = {
  VALIDATION_FAIL: {
    code: "VALIDATION_FAIL",
    message: "Dados inválidos fornecidos",
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "Usuário não encontrado",
  },
  EMAIL_NOT_FOUND: {
    code: "EMAIL_NOT_FOUND",
    message: "E-mail não encontrado",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Acesso não autorizado",
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Erro interno do banco de dados",
  },
  UNEXPECTED_ERROR: {
    code: "UNEXPECTED_ERROR",
    message: "Erro inesperado do servidor",
  },
} as const
