import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { processEmailJob } from "@/src/trigger/processEmail"

// Ativar Trigger.dev
const USE_TRIGGER = true

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")

    const emails = await prisma.email.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
        ...(category && { category }),
      },
      orderBy: {
        receivedAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json({ success: true, data: emails })
  } catch (error) {
    console.error("Erro ao buscar emails:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao buscar emails" 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Temporariamente desabilitado para teste
    // if (!session?.user?.id) {
    //   return NextResponse.json({ 
    //     success: false, 
    //     message: "Não autorizado" 
    //   }, { status: 401 })
    // }
    
    // ID temporário para teste
    const userId = session?.user?.id || "cmbqu0a000000mcl9ae9fsxb9"

    const body = await request.json()
    const { from, to, subject, content, htmlContent, category, priority, autoProcess = true } = body

    if (!from || !to || !subject || !content) {
      return NextResponse.json({ 
        success: false, 
        message: "Dados obrigatórios faltando" 
      }, { status: 400 })
    }

    // Criar email
    const email = await prisma.email.create({
      data: {
        from,
        to,
        subject,
        content,
        htmlContent,
        category,
        priority: priority || "normal",
        userId: userId,
      },
    })

    // Processar automaticamente com IA usando Trigger.dev
    if (autoProcess && USE_TRIGGER) {
      try {
        const handle = await processEmailJob.trigger({
          emailId: email.id,
          userId: userId
        })
        
        console.log(`📧 Email ${email.id} enviado para processamento - Job ID: ${handle.id}`)
      } catch (error) {
        console.error("Erro ao disparar job de processamento:", error)
        // Não falhar a criação do email se o job falhar
      }
    }
    
    console.log(`✅ Email criado: ${email.id}`)

    return NextResponse.json({ 
      success: true, 
      data: email,
      processing: autoProcess 
    }, { status: 201 })
    
  } catch (error) {
    console.error("Erro ao criar email:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao criar email" 
    }, { status: 500 })
  }
}
