# 🔧 DEBUG: Sincronização Widget x Atendimento

## 🐛 Problema Identificado

**Sintoma**: Quando o agente responde no sistema de atendimento, a mensagem não aparece no widget do cliente.

## 🔍 Análise do Fluxo

### 1. **Quando o Agente Envia Mensagem** (/atendimento)
```javascript
// API: /api/chat/sessions/[id]/messages
io.to(`chat:${id}`).emit("new-message", {
  message,
  from: "agent"
})
```

### 2. **Widget Escutando** (chat-widget.tsx)
```javascript
socket.on("new-message", (data) => {
  if (data.message) {
    setMessages(prev => [...prev, data.message])
  }
})
```

### 3. **Problema: Widget não está na sala correta**
- Widget emite: `socket.emit("join", "chat:${session.id}")`
- API emite para: `io.to("chat:${id}")`

## ✅ Soluções Testadas

### 1. **Tipos corrigidos** no widget
- Removida dependência de `@prisma/client`
- Criadas interfaces locais

### 2. **Eventos de socket ajustados**
- `join-chat` → `join`
- `leave-chat` → `leave`
- Formato da sala: `chat:${sessionId}`

### 3. **Busca de mensagens ao criar sessão**
- Widget agora busca mensagens existentes via API

## 🚨 Possíveis Problemas Restantes

### 1. **CORS/Origem do Socket**
- Widget embed pode estar em domínio diferente
- Socket.io pode estar bloqueando conexões

### 2. **Timing de Conexão**
- Widget pode conectar antes da sessão ser escalada
- Mensagens podem chegar antes do widget estar pronto

### 3. **Formato de Dados**
- API pode estar enviando formato diferente do esperado
- Metadata pode estar faltando

## 🛠️ Como Testar

### 1. **Console do Widget** (F12 no navegador do cliente)
```javascript
// Verificar se socket está conectado
console.log('Socket conectado?', window.socket?.connected)

// Verificar eventos recebidos
window.socket?.on('new-message', console.log)
window.socket?.on('*', console.log) // Todos eventos
```

### 2. **Console do Atendimento** (F12 no navegador do agente)
```javascript
// Verificar se mensagem foi enviada
console.log('Enviando mensagem via socket')
```

### 3. **Logs do Servidor**
Verificar no terminal se:
- WebSocket está conectado
- Salas estão sendo criadas
- Mensagens estão sendo emitidas

## 🔄 Fluxo Esperado

1. Cliente abre widget
2. Cliente preenche dados e inicia chat
3. Widget conecta ao socket: `join chat:SESSION_ID`
4. Cliente solicita atendente humano
5. Agente assume chat no /atendimento
6. Agente envia mensagem
7. API emite: `to('chat:SESSION_ID').emit('new-message', data)`
8. Widget recebe e exibe mensagem

## 💡 Solução Rápida

### 1. **Recarregar ambas as páginas**
- Widget do cliente (F5)
- Sistema de atendimento (F5)

### 2. **Verificar ID da sessão**
- No widget: `console.log(session?.id)`
- No atendimento: verificar ID do chat ativo

### 3. **Testar manualmente**
```javascript
// No console do widget
fetch(`/api/chat/sessions/SESSION_ID/messages`)
  .then(r => r.json())
  .then(console.log)
```

## 🚀 Próximos Passos

1. Adicionar mais logs no widget para debug
2. Verificar configuração de CORS do Socket.io
3. Implementar reconexão automática
4. Adicionar indicador de status de conexão

**STATUS**: Em investigação 🔍
