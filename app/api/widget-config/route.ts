import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

// Gerar ID e chave únicos
function generateAppId() {
  return `app_${randomBytes(16).toString('hex')}`
}

function generateApiKey() {
  return `sk_${randomBytes(32).toString('hex')}`
}

// GET - Listar configurações de widget
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const widgetConfigs = await prisma.widgetConfig.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(widgetConfigs)
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

// POST - Criar nova configuração
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name = "Novo Widget" } = body

    // Criar nova configuração
    const widgetConfig = await prisma.widgetConfig.create({
      data: {
        appId: generateAppId(),
        apiKey: generateApiKey(),
        name,
        userId: user.id,
        allowedDomains: [],
        primaryColor: "#2A65F9",
        position: "bottom-right",
        title: "Suporte",
        subtitle: "Como podemos ajudar?",
        isActive: true,
        requireAuth: false,
        collectName: true,
        collectEmail: true,
        collectPhone: true,
      }
    })

    return NextResponse.json(widgetConfig)
  } catch (error) {
    console.error("Erro ao criar configuração:", error)
    return NextResponse.json(
      { error: "Erro ao criar configuração" },
      { status: 500 }
    )
  }
}
