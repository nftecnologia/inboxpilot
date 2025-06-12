import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Interface para as configurações do chat
interface ChatSettings {
  preAttendance: {
    welcomeMessage: string
    initialQuestions: string[]
    businessHours: {
      start: string
      end: string
    }
  }
  ai: {
    model: string
    confidenceThreshold: number
    temperature: number
  }
  knowledgeBase: {
    enabledCategories: string[]
    maxContexts: number
  }
  advanced: {
    webhookUrl?: string
    inactivityTimeout: number
    saveHistory: boolean
    enableSentimentAnalysis: boolean
    debugMode: boolean
  }
}

// GET - Buscar configurações atuais
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Por enquanto, retornar configurações padrão
    // No futuro, buscar do banco de dados
    const settings: ChatSettings = {
      preAttendance: {
        welcomeMessage: "Olá! Sou o assistente virtual da Kirvano. Como posso ajudá-lo hoje?",
        initialQuestions: [
          "Como criar uma conta?",
          "Como resetar minha senha?",
          "Como funciona a plataforma?",
        ],
        businessHours: {
          start: "08:00",
          end: "18:00",
        },
      },
      ai: {
        model: "gpt-4o",
        confidenceThreshold: 80,
        temperature: 0.3,
      },
      knowledgeBase: {
        enabledCategories: ["Geral", "Produtos", "Checkout e Conversão", "Integrações"],
        maxContexts: 5,
      },
      advanced: {
        inactivityTimeout: 30,
        saveHistory: true,
        enableSentimentAnalysis: true,
        debugMode: false,
      },
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("❌ Erro ao buscar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

// POST - Salvar configurações
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const settings: ChatSettings = await request.json()

    // Validar configurações
    if (!settings.preAttendance || !settings.ai || !settings.knowledgeBase || !settings.advanced) {
      return NextResponse.json(
        { error: "Configurações inválidas" },
        { status: 400 }
      )
    }

    // Por enquanto, apenas simular salvamento
    // No futuro, salvar no banco de dados
    console.log("💾 Salvando configurações do chat:", settings)

    // Simular salvamento bem-sucedido
    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso",
      settings,
    })
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    )
  }
}
