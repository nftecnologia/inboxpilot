"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import type { ActionResponse } from "@/types/actions"
import { appErrors } from "@/types/actions"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }): Promise<ActionResponse<{ success: boolean }>> => {
    try {
      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return {
          success: false,
          error: appErrors.USER_NOT_FOUND,
        }
      }

      // Para demo, aceitar qualquer senha
      // Em produção, usar bcrypt para verificar senha
      return {
        success: true,
        data: { success: true },
      }
    } catch (error) {
      console.error("Erro no login:", error)
      return {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      }
    }
  })

export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, password } }): Promise<ActionResponse<{ userId: string }>> => {
    try {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "Usuário já existe com este e-mail",
          },
        }
      }

      // Criar novo usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          // Em produção, usar bcrypt para hash da senha
          // password: await hash(password, 12),
        },
      })

      return {
        success: true,
        data: { userId: user.id },
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      }
    }
  })
