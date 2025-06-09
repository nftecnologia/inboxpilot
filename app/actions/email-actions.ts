"use server"

import { z } from "zod"
import { authenticatedActionClient } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import type { ActionResponse } from "@/types/actions"
import { appErrors } from "@/types/actions"

const createEmailSchema = z.object({
  from: z.string().email("E-mail do remetente inválido"),
  to: z.string().email("E-mail do destinatário inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  htmlContent: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
})

const updateEmailSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  category: z.string().optional(),
  aiResponse: z.string().optional(),
})

export const createEmailAction = authenticatedActionClient
  .schema(createEmailSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ id: string }>> => {
    try {
      const email = await prisma.email.create({
        data: {
          ...parsedInput,
          userId: ctx.userId,
        },
      })

      return {
        success: true,
        data: { id: email.id },
      }
    } catch (error) {
      console.error("Erro ao criar email:", error)
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      }
    }
  })

export const updateEmailAction = authenticatedActionClient
  .schema(updateEmailSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ success: boolean }>> => {
    try {
      const { id, ...updates } = parsedInput

      // Verificar se o email pertence ao usuário
      const email = await prisma.email.findFirst({
        where: {
          id,
          userId: ctx.userId,
        },
      })

      if (!email) {
        return {
          success: false,
          error: appErrors.EMAIL_NOT_FOUND,
        }
      }

      await prisma.email.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
          ...(updates.status === "responded" && { respondedAt: new Date() }),
          ...(updates.status === "processed" && { processedAt: new Date() }),
        },
      })

      return {
        success: true,
        data: { success: true },
      }
    } catch (error) {
      console.error("Erro ao atualizar email:", error)
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      }
    }
  })

const deleteEmailSchema = z.object({
  id: z.string(),
})

export const deleteEmailAction = authenticatedActionClient
  .schema(deleteEmailSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ success: boolean }>> => {
    try {
      const { id } = parsedInput

      // Verificar se o email pertence ao usuário
      const email = await prisma.email.findFirst({
        where: {
          id,
          userId: ctx.userId,
        },
      })

      if (!email) {
        return {
          success: false,
          error: appErrors.EMAIL_NOT_FOUND,
        }
      }

      await prisma.email.delete({
        where: { id },
      })

      return {
        success: true,
        data: { success: true },
      }
    } catch (error) {
      console.error("Erro ao deletar email:", error)
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      }
    }
  })

const markAsReadSchema = z.object({
  id: z.string(),
  isRead: z.boolean(),
})

export const markEmailAsReadAction = authenticatedActionClient
  .schema(markAsReadSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ success: boolean }>> => {
    try {
      const { id, isRead } = parsedInput

      await prisma.email.updateMany({
        where: {
          id,
          userId: ctx.userId,
        },
        data: {
          isRead,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        data: { success: true },
      }
    } catch (error) {
      console.error("Erro ao marcar email:", error)
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      }
    }
  })
