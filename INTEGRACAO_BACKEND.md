# 🔌 InboxPilot - Integração Backend

## 📧 APIs para Recepção de Emails e Tickets

### 🌐 Base URL
```
Desenvolvimento: http://localhost:3003
Produção: https://seu-dominio.com
```

---

## 📧 1. API de Emails

### ✉️ **Criar Email (Receber de Sistema Externo)**
```bash
POST /api/emails
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Body:**
```json
{
  "from": "cliente@exemplo.com",
  "to": "suporte@empresa.com",
  "subject": "Preciso de ajuda com meu pedido",
  "content": "Texto do email em plain text",
  "htmlContent": "<p>HTML do email (opcional)</p>",
  "category": "suporte",
  "priority": "high"
}
```

**Resposta Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123...",
    "from": "cliente@exemplo.com",
    "to": "suporte@empresa.com",
    "subject": "Preciso de ajuda com meu pedido",
    "status": "pending",
    "priority": "high",
    "category": "suporte",
    "createdAt": "2025-01-10T18:30:00Z"
  }
}
```

### 🤖 **Processar Email com IA**
```bash
POST /api/emails/process
```

**Body:**
```json
{
  "emailId": "clxyz123..."
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sentiment": "neutral",
    "category": "suporte",
    "urgency": "medium",
    "suggestedResponse": "Olá! Vi que você precisa de ajuda...",
    "keywords": ["pedido", "ajuda", "suporte"]
  }
}
```

---

## 🎫 2. API de Tickets

### 📝 **Criar Ticket**
```bash
POST /api/tickets
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Body:**
```json
{
  "subject": "Problema com login no sistema",
  "description": "Cliente não consegue fazer login",
  "clientEmail": "cliente@exemplo.com",
  "clientName": "João Silva",
  "clientPhone": "(11) 98765-4321",
  "clientCompany": "Empresa XYZ",
  "priority": "HIGH",
  "category": "technical",
  "assigneeId": "user123",
  "slaHours": 4
}
```

**Resposta Sucesso (201):**
```json
{
  "id": "ticket123",
  "number": 1234,
  "subject": "Problema com login no sistema",
  "status": "OPEN",
  "priority": "HIGH",
  "client": {
    "id": "client123",
    "email": "cliente@exemplo.com",
    "name": "João Silva"
  },
  "slaDeadline": "2025-01-10T22:30:00Z",
  "createdAt": "2025-01-10T18:30:00Z"
}
```

---

## 🔄 3. Integração via Webhook

### 📨 **Receber Emails via Webhook**

Para sistemas externos enviarem emails automaticamente:

```javascript
// Exemplo de webhook para receber emails
// Você precisa criar este endpoint
POST /api/webhooks/email

// Headers
{
  "X-Webhook-Secret": "seu-secret-aqui",
  "Content-Type": "application/json"
}

// Body
{
  "event": "email.received",
  "data": {
    "messageId": "msg123@mail.com",
    "from": "cliente@gmail.com",
    "to": "suporte@empresa.com",
    "subject": "Assunto do email",
    "text": "Conteúdo em texto",
    "html": "<p>Conteúdo HTML</p>",
    "attachments": [],
    "headers": {
      "Reply-To": "cliente@gmail.com"
    }
  }
}
```

### 🎟️ **Criar Ticket via Webhook**

```javascript
POST /api/webhooks/ticket

// Headers
{
  "X-Webhook-Secret": "seu-secret-aqui",
  "Content-Type": "application/json"
}

// Body
{
  "event": "ticket.create",
  "source": "website_form",
  "data": {
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "subject": "Dúvida sobre produto",
    "message": "Gostaria de saber mais sobre...",
    "priority": "MEDIUM",
    "category": "sales"
  }
}
```

---

## 🔌 4. Integrações Recomendadas

### 📧 **Integração com Provedores de Email**

#### Gmail API
```javascript
// Exemplo de integração com Gmail
const { google } = require('googleapis');

async function watchGmailInbox() {
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Configurar watch para novos emails
  const res = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName: 'projects/seu-projeto/topics/gmail-push',
      labelIds: ['INBOX']
    }
  });
  
  // Quando receber notificação, buscar email e enviar para InboxPilot
}
```

#### SendGrid Inbound Parse
```javascript
// Configurar SendGrid para enviar emails para seu webhook
// No SendGrid Dashboard:
// 1. Settings > Inbound Parse
// 2. Add Host & URL: parse.seudominio.com -> /api/webhooks/sendgrid

// Webhook handler
app.post('/api/webhooks/sendgrid', async (req, res) => {
  const { from, to, subject, text, html } = req.body;
  
  // Enviar para InboxPilot
  await fetch('http://localhost:3003/api/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_TOKEN
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      content: text,
      htmlContent: html
    })
  });
  
  res.status(200).send('OK');
});
```

### 🎫 **Integração com Sistemas de Tickets**

#### Zendesk
```javascript
// Sincronizar tickets do Zendesk
async function syncZendeskTickets() {
  const tickets = await zendesk.tickets.list();
  
  for (const ticket of tickets) {
    await fetch('http://localhost:3003/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_TOKEN
      },
      body: JSON.stringify({
        subject: ticket.subject,
        description: ticket.description,
        clientEmail: ticket.requester.email,
        clientName: ticket.requester.name,
        priority: mapZendeskPriority(ticket.priority),
        category: ticket.type
      })
    });
  }
}
```

---

## 🔒 5. Autenticação e Segurança

### 🔑 **Autenticação via API Key**

Para sistemas externos, recomenda-se criar API Keys específicas:

```javascript
// Criar middleware de autenticação para API Keys
export async function validateApiKey(req: Request) {
  const apiKey = req.headers.get('X-API-Key');
  
  if (!apiKey) {
    return { error: 'API Key necessária' };
  }
  
  // Validar API Key no banco
  const validKey = await prisma.apiKey.findUnique({
    where: { key: apiKey, active: true }
  });
  
  if (!validKey) {
    return { error: 'API Key inválida' };
  }
  
  return { userId: validKey.userId };
}
```

### 🛡️ **Rate Limiting**

Implementar rate limiting para proteger as APIs:

```javascript
// Exemplo com express-rate-limit
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests
  message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/emails', emailLimiter);
```

---

## 🚀 6. Filas e Processamento Assíncrono

### 📬 **Implementação de Filas (Recomendado)**

Para processar grandes volumes de emails/tickets:

#### Bull Queue (Redis)
```javascript
// queue/emailQueue.js
const Queue = require('bull');
const emailQueue = new Queue('email processing', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

// Adicionar email à fila
emailQueue.add('process-email', {
  emailId: 'clxyz123...',
  userId: 'user123'
});

// Processar emails
emailQueue.process('process-email', async (job) => {
  const { emailId, userId } = job.data;
  
  // Processar com IA
  await processEmailWithAI(emailId);
  
  // Notificar via WebSocket
  io.to(userId).emit('email:processed', { emailId });
});
```

#### BullMQ (Alternativa moderna)
```javascript
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('emails', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Worker para processar
new Worker('emails', async (job) => {
  console.log(`Processando email ${job.data.emailId}`);
  await processEmail(job.data);
}, {
  connection: {
    host: 'localhost',
    port: 6379
  }
});
```

---

## 📡 7. WebSocket para Real-time

O sistema já possui Socket.io configurado:

```javascript
// Cliente se conectando
const socket = io('http://localhost:3003');

// Escutar novos emails
socket.on('email:new', (email) => {
  console.log('Novo email recebido:', email);
});

// Escutar atualizações de tickets
socket.on('ticket:updated', (ticket) => {
  console.log('Ticket atualizado:', ticket);
});
```

---

## 🔧 8. Configuração de Ambiente

### Variáveis necessárias no `.env`:

```bash
# API Keys
API_SECRET_KEY=sua-chave-secreta
WEBHOOK_SECRET=webhook-secret-key

# Email Providers
GMAIL_CLIENT_ID=seu-client-id
GMAIL_CLIENT_SECRET=seu-client-secret
SENDGRID_API_KEY=sua-sendgrid-key

# Queue/Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📋 Exemplos de Uso

### 1. **Script Python para enviar emails**
```python
import requests
import json

def send_email_to_inboxpilot(email_data):
    url = "http://localhost:3003/api/emails"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_TOKEN"
    }
    
    response = requests.post(url, 
                           headers=headers, 
                           data=json.dumps(email_data))
    
    if response.status_code == 201:
        print("Email enviado com sucesso!")
        return response.json()
    else:
        print(f"Erro: {response.text}")
        return None

# Exemplo de uso
email = {
    "from": "cliente@exemplo.com",
    "to": "suporte@empresa.com",
    "subject": "Ajuda com pedido #12345",
    "content": "Olá, preciso de ajuda...",
    "priority": "high"
}

send_email_to_inboxpilot(email)
```

### 2. **Webhook em Node.js**
```javascript
const express = require('express');
const app = express();

app.post('/webhook/email', async (req, res) => {
  const { from, to, subject, body } = req.body;
  
  try {
    // Enviar para InboxPilot
    const response = await fetch('http://localhost:3003/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.API_TOKEN
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        content: body,
        category: 'webhook'
      })
    });
    
    const result = await response.json();
    res.json({ success: true, emailId: result.data.id });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Falha ao processar email' });
  }
});
```

---

## 🚨 Monitoramento e Logs

### Implementar logs estruturados:

```javascript
// lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usar nos endpoints
logger.info('Email recebido', { 
  emailId: email.id, 
  from: email.from,
  timestamp: new Date()
});
```

---

## 📈 Próximos Passos para Melhorar

1. **Implementar Queue System** (Bull/BullMQ)
2. **Adicionar Webhooks** para integração externa
3. **Criar API Keys** para autenticação de sistemas
4. **Implementar Rate Limiting**
5. **Adicionar métricas** (Prometheus/Grafana)
6. **Documentação Swagger/OpenAPI**
7. **Testes de carga** para APIs

---

**🚀 O InboxPilot está pronto para receber emails e tickets de qualquer sistema!**
