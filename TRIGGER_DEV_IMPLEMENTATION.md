# 🚀 Trigger.dev - Sistema de Filas para InboxPilot

## 🎯 Por que Trigger.dev?

### ✅ **Vantagens sobre Bull+Redis:**
- **Serverless-first:** Perfeito para Next.js/Vercel
- **Zero infraestrutura:** Não precisa gerenciar Redis
- **Interface visual:** Dashboard para monitorar jobs
- **TypeScript nativo:** Type-safety completo
- **Integração fácil:** Funciona direto com Next.js
- **Escalabilidade automática:** Sem preocupações
- **Logs e debugging:** Interface completa
- **Retries automáticos:** Com backoff exponencial

---

## 📦 1. Instalação

```bash
# Instalar Trigger.dev
pnpm add @trigger.dev/sdk @trigger.dev/nextjs

# CLI para desenvolvimento
pnpm add -D @trigger.dev/cli
```

---

## 🔧 2. Configuração Inicial

### **Passo 1: Criar conta e projeto**
```bash
# Criar conta em https://trigger.dev
# Obter API Key do dashboard
```

### **Passo 2: Configurar variáveis**
```bash
# .env.local
TRIGGER_API_KEY=tr_dev_xxxxxxxxxxxxx
TRIGGER_API_URL=https://api.trigger.dev
```

### **Passo 3: Criar cliente Trigger**
```typescript
// lib/trigger.ts
import { TriggerClient } from "@trigger.dev/sdk"

export const client = new TriggerClient({
  id: "inboxpilot",
  apiKey: process.env.TRIGGER_API_KEY!,
  apiUrl: process.env.TRIGGER_API_URL!,
})
```

---

## 📧 3. Jobs para Processar Emails

### **Job de Processamento de Email**
```typescript
// app/jobs/processEmail.ts
import { eventTrigger } from "@trigger.dev/sdk"
import { z } from "zod"
import { client } from "@/lib/trigger"
import { prisma } from "@/lib/prisma"
import { analyzeEmailWithAI } from "@/lib/openai"

export const processEmailJob = client.defineJob({
  id: "process-email",
  name: "Process Email with AI",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "email.process",
    schema: z.object({
      emailId: z.string(),
      userId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    // 1. Buscar email
    const email = await io.runTask("fetch-email", async () => {
      return await prisma.email.findUnique({
        where: { id: payload.emailId }
      })
    })

    if (!email) {
      throw new Error("Email não encontrado")
    }

    // 2. Analisar com IA
    const analysis = await io.runTask("analyze-with-ai", async () => {
      return await analyzeEmailWithAI({
        subject: email.subject,
        content: email.content,
        from: email.from
      })
    })

    // 3. Atualizar email com análise
    const updatedEmail = await io.runTask("update-email", async () => {
      return await prisma.email.update({
        where: { id: email.id },
        data: {
          sentiment: analysis.sentiment,
          category: analysis.category,
          aiKeywords: analysis.keywords,
          aiComplexity: analysis.complexity,
          aiResponse: analysis.suggestedResponse,
          aiAnalyzed: true,
          processedAt: new Date()
        }
      })
    })

    // 4. Notificar via WebSocket
    await io.runTask("notify-user", async () => {
      // Emitir evento Socket.io
      io.emit("email:processed", {
        emailId: email.id,
        userId: payload.userId,
        analysis
      })
    })

    // 5. Criar ticket se necessário
    if (analysis.urgency === "high" || analysis.sentiment === "negative") {
      await io.runTask("create-ticket", async () => {
        return await prisma.ticket.create({
          data: {
            subject: `[Auto] ${email.subject}`,
            description: email.content,
            priority: analysis.urgency === "high" ? "HIGH" : "MEDIUM",
            category: analysis.category,
            clientId: email.from,
            source: "email",
            emailId: email.id
          }
        })
      })
    }

    return {
      emailId: email.id,
      processed: true,
      analysis
    }
  },
})
```

### **Job de Envio de Email**
```typescript
// app/jobs/sendEmail.ts
import { eventTrigger } from "@trigger.dev/sdk"
import { z } from "zod"
import { client } from "@/lib/trigger"
import { sendEmail } from "@/lib/email"

export const sendEmailJob = client.defineJob({
  id: "send-email",
  name: "Send Email Response",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "email.send",
    schema: z.object({
      to: z.string().email(),
      subject: z.string(),
      content: z.string(),
      replyToId: z.string().optional(),
    }),
  }),
  integrations: {
    // Integração com SendGrid/Resend
  },
  run: async (payload, io, ctx) => {
    // Enviar email
    const result = await io.runTask("send-email", async () => {
      return await sendEmail({
        to: payload.to,
        subject: payload.subject,
        content: payload.content,
      })
    })

    // Registrar no banco
    await io.runTask("log-email", async () => {
      return await prisma.email.create({
        data: {
          from: "suporte@empresa.com",
          to: payload.to,
          subject: payload.subject,
          content: payload.content,
          status: "sent",
          respondedAt: new Date()
        }
      })
    })

    return { success: true, messageId: result.id }
  },
})
```

---

## 🎫 4. Jobs para Tickets

### **Job de Processamento de Ticket**
```typescript
// app/jobs/processTicket.ts
import { eventTrigger, cronTrigger } from "@trigger.dev/sdk"
import { z } from "zod"
import { client } from "@/lib/trigger"
import { prisma } from "@/lib/prisma"

export const processTicketJob = client.defineJob({
  id: "process-ticket",
  name: "Process New Ticket",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "ticket.created",
    schema: z.object({
      ticketId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    const ticket = await io.runTask("fetch-ticket", async () => {
      return await prisma.ticket.findUnique({
        where: { id: payload.ticketId },
        include: { client: true }
      })
    })

    // Analisar urgência
    const analysis = await io.runTask("analyze-urgency", async () => {
      // Lógica de análise de urgência
      return {
        urgency: "medium",
        suggestedAgent: null,
        estimatedTime: 2 // horas
      }
    })

    // Atribuir automaticamente se configurado
    if (analysis.suggestedAgent) {
      await io.runTask("assign-ticket", async () => {
        return await prisma.ticket.update({
          where: { id: ticket!.id },
          data: { assigneeId: analysis.suggestedAgent }
        })
      })
    }

    // Enviar notificação
    await io.runTask("notify-team", async () => {
      // Notificar equipe via Slack/Email
    })

    return { processed: true }
  },
})

// Job de verificação de SLA
export const checkSLAJob = client.defineJob({
  id: "check-sla",
  name: "Check Ticket SLA",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "*/15 * * * *" // A cada 15 minutos
  }),
  run: async (payload, io, ctx) => {
    const overdueTickets = await io.runTask("find-overdue", async () => {
      return await prisma.ticket.findMany({
        where: {
          status: { in: ["OPEN", "IN_PROGRESS"] },
          slaDeadline: { lt: new Date() }
        }
      })
    })

    for (const ticket of overdueTickets) {
      await io.runTask(`alert-sla-${ticket.id}`, async () => {
        // Enviar alerta
        console.log(`⚠️ Ticket #${ticket.number} está atrasado!`)
      })
    }

    return { checked: overdueTickets.length }
  },
})
```

---

## 🔌 5. Integração com Next.js

### **API Route Handler**
```typescript
// app/api/trigger/route.ts
import { createTriggerRoute } from "@trigger.dev/nextjs"
import * as processEmail from "@/app/jobs/processEmail"
import * as sendEmail from "@/app/jobs/sendEmail"
import * as processTicket from "@/app/jobs/processTicket"

export const { POST } = createTriggerRoute({
  path: "/api/trigger",
  jobs: [
    processEmail.processEmailJob,
    sendEmail.sendEmailJob,
    processTicket.processTicketJob,
    processTicket.checkSLAJob,
  ],
})
```

### **Disparar Jobs**
```typescript
// app/api/emails/route.ts
import { processEmailJob } from "@/app/jobs/processEmail"

export async function POST(request: Request) {
  // ... criar email ...

  // Disparar job de processamento
  await processEmailJob.trigger({
    emailId: email.id,
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: email })
}
```

---

## 🎯 6. Casos de Uso no InboxPilot

### **1. Fluxo de Email Completo**
```typescript
// Quando email chega
await processEmailJob.trigger({ emailId, userId })
  ↓
// Análise com IA
  ↓
// Se urgente, cria ticket
await processTicketJob.trigger({ ticketId })
  ↓
// Notifica equipe
```

### **2. Resposta Automática**
```typescript
// Se confiança > 90%
await sendEmailJob.trigger({
  to: email.from,
  subject: `Re: ${email.subject}`,
  content: aiResponse
})
```

### **3. Jobs Agendados**
```typescript
// Relatórios diários
export const dailyReportJob = client.defineJob({
  id: "daily-report",
  trigger: cronTrigger({ cron: "0 9 * * *" }), // 9AM
  run: async (payload, io) => {
    // Gerar e enviar relatório
  }
})
```

---

## 📊 7. Monitoramento

### **Dashboard Trigger.dev**
```
https://app.trigger.dev/[seu-projeto]/jobs
```

**Funcionalidades:**
- ✅ Ver todos os jobs em execução
- ✅ Logs detalhados de cada execução
- ✅ Reprocessar jobs com falha
- ✅ Métricas de performance
- ✅ Alertas automáticos

### **Integração com Logs**
```typescript
run: async (payload, io, ctx) => {
  await io.logger.info("Processando email", { emailId: payload.emailId })
  
  try {
    // processo...
  } catch (error) {
    await io.logger.error("Erro no processamento", { error })
    throw error
  }
}
```

---

## 🚀 8. Deploy

### **Desenvolvimento**
```bash
# Terminal 1 - Next.js
pnpm dev

# Terminal 2 - Trigger.dev
pnpm dlx @trigger.dev/cli@latest dev
```

### **Produção (Vercel)**
```bash
# Variáveis de ambiente no Vercel
TRIGGER_API_KEY=tr_prod_xxxxx
TRIGGER_API_URL=https://api.trigger.dev

# Deploy automático
git push
```

---

## 💡 9. Vantagens sobre Bull+Redis

| Feature | Trigger.dev | Bull+Redis |
|---------|-------------|------------|
| **Setup** | 5 minutos | 30+ minutos |
| **Infraestrutura** | Zero | Redis necessário |
| **Monitoramento** | Dashboard incluído | Precisa Bull Board |
| **Escalabilidade** | Automática | Manual |
| **Custo inicial** | Grátis (3k jobs/mês) | Redis hosting |
| **TypeScript** | Nativo | Tipos manuais |
| **Serverless** | ✅ Perfeito | ❌ Complexo |
| **Debugging** | Interface visual | Logs apenas |

---

## 📈 10. Plano de Implementação

### **Fase 1: Setup Básico (1 hora)**
1. Criar conta Trigger.dev
2. Instalar dependências
3. Configurar API route

### **Fase 2: Jobs Essenciais (2 horas)**
1. Job de processamento de email
2. Job de criação de ticket
3. Job de verificação SLA

### **Fase 3: Integrações (2 horas)**
1. WebSocket notifications
2. Email sending
3. Alertas

### **Fase 4: Monitoramento (1 hora)**
1. Dashboard setup
2. Alertas configurados
3. Logs estruturados

---

**🎉 Com Trigger.dev, o InboxPilot terá um sistema de filas moderno, escalável e fácil de manter!**
