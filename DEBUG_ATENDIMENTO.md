# 🔧 DEBUG DO SISTEMA DE ATENDIMENTO

## ✅ Sessão de Teste Criada

**ID da Sessão:** `cmbtf00gh0002mcnmpjpxuwei`
**Cliente:** João da Silva (suporte@empresa.com)
**Status:** ESCALATED (Em espera)

## 🎯 Como Testar o Sistema

### 1. **Acesse o Sistema**
```
http://localhost:3000/atendimento
```

### 2. **Na Aba "Em Espera"**
- Você verá o chat de "João da Silva"
- Clique no botão "Atender"

### 3. **Após Assumir o Chat**
- O chat deve aparecer na aba "Ativos"
- Selecione o chat para abrir a conversa
- Tente enviar uma mensagem

## 🐛 Debugando Problemas de Envio

### 1. **Abra o Console do Navegador** (F12)
Procure por erros como:
- `404 Not Found` - API não encontrada
- `401 Unauthorized` - Problema de autenticação
- `500 Internal Server Error` - Erro no servidor

### 2. **Verifique a Aba Network**
1. Abra as Developer Tools (F12)
2. Vá para a aba "Network" 
3. Tente enviar uma mensagem
4. Procure por uma requisição para `/api/chat/sessions/[id]/messages`
5. Clique nela e veja:
   - Status Code
   - Response
   - Request Payload

### 3. **Possíveis Problemas e Soluções**

#### ❌ **Erro 404 - API não encontrada**
- **Causa**: A rota da API pode estar incorreta
- **Solução**: Verifique se o arquivo `/app/api/chat/sessions/[id]/messages/route.ts` existe

#### ❌ **Erro 401 - Não autorizado**
- **Causa**: Sessão expirada ou usuário não autenticado
- **Solução**: Faça logout e login novamente

#### ❌ **Erro 500 - Erro interno**
- **Causa**: Erro no código da API
- **Solução**: Verifique os logs do servidor no terminal

#### ❌ **Mensagem não aparece após envio**
- **Causa**: WebSocket não está funcionando
- **Solução**: 
  1. Reinicie o servidor (`Ctrl+C` e `pnpm dev`)
  2. Limpe o cache do navegador
  3. Recarregue a página

### 4. **Teste Manual da API**

Execute este comando no console do navegador para testar a API diretamente:

```javascript
// Substitua SESSION_ID pelo ID real da sessão
fetch('/api/chat/sessions/cmbtf00gh0002mcnmpjpxuwei/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Teste de mensagem',
    role: 'ASSISTANT',
    isHuman: true
  })
})
.then(res => res.json())
.then(data => console.log('Resposta:', data))
.catch(err => console.error('Erro:', err));
```

### 5. **Verificar Logs do Servidor**

No terminal onde o servidor está rodando, procure por mensagens de erro quando tentar enviar uma mensagem.

## 📊 Status das APIs

| Endpoint | Método | Status | Descrição |
|----------|---------|--------|-----------|
| `/api/chat/live-sessions` | GET | ✅ | Lista sessões |
| `/api/chat/sessions/[id]/assume` | POST | ✅ | Assumir chat |
| `/api/chat/sessions/[id]/messages` | POST | ✅ | Enviar mensagem |
| `/api/chat/sessions/[id]/finish` | POST | ✅ | Finalizar chat |

## 🔄 Fluxo Esperado

1. **Cliente inicia chat** → Status: `ACTIVE`
2. **IA não consegue resolver** → Status: `ESCALATED`
3. **Atendente assume** → Status: `ACTIVE` + metadata com atendente
4. **Mensagens trocadas** → Salvas no banco + WebSocket
5. **Chat finalizado** → Status: `CLOSED` + Ticket criado

## 💡 Dicas Adicionais

1. **Sempre reinicie o servidor** após mudanças no código
2. **Limpe o cache** se comportamentos estranhos ocorrerem
3. **Verifique se está logado** como admin ou agent
4. **Use o modo incógnito** para testar sem cache

## 🆘 Se Nada Funcionar

1. Pare o servidor (`Ctrl+C`)
2. Execute: `pnpm dev`
3. Faça login novamente
4. Tente o processo do início

**IMPORTANTE**: Copie qualquer erro do console e dos logs do servidor para análise!
