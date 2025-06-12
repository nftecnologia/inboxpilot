# 🚨 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE NA VERCEL

## ⚡ VARIÁVEIS OBRIGATÓRIAS

O sistema **NÃO FUNCIONARÁ** sem estas variáveis configuradas na Vercel:

### 1. **Banco de Dados (Neon Postgres)**
```
DATABASE_URL=postgresql://[usuario]:[senha]@[host]/[database]?sslmode=require
```

### 2. **Autenticação (NextAuth)**
```
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=[gerar com: openssl rand -base64 32]
```

### 3. **OpenAI (IA)**
```
OPENAI_API_KEY=sk-...
```

### 4. **Pinecone (Base de Conhecimento Vetorial)**
```
PINECONE_API_KEY=[sua-api-key]
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=knowledge-base
```

## 📋 Como Configurar na Vercel:

1. Acesse: https://vercel.com/[seu-usuario]/[seu-projeto]/settings/environment-variables

2. Adicione CADA variável:
   - Clique em "Add New"
   - Name: [nome da variável]
   - Value: [valor]
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Clique "Save"

3. **IMPORTANTE**: Após adicionar TODAS as variáveis, clique em:
   - "Redeploy" no topo da página
   - Selecione o último commit
   - Confirme o redeploy

## 🔍 Verificar Configuração:

### No Pinecone Dashboard:
1. Acesse: https://app.pinecone.io
2. Verifique se existe o índice "knowledge-base"
3. Se não existir, crie com:
   - Dimension: 1536
   - Metric: cosine
   - Pod Type: starter

### Testar Localmente:
```bash
# Criar arquivo .env.local com as mesmas variáveis
cp .env.example .env.local

# Editar e preencher todas as variáveis
nano .env.local

# Testar
pnpm dev
```

## ❌ Erros Comuns:

### "PineconeConfigurationError: apiKey required"
- **Causa**: PINECONE_API_KEY não configurada
- **Solução**: Adicionar na Vercel Settings

### "Cannot find module '.prisma/client/default'"
- **Causa**: Prisma Client não gerado
- **Solução**: Já corrigido no package.json

### "Invalid DATABASE_URL"
- **Causa**: String de conexão incorreta
- **Solução**: Copiar do Neon Dashboard

## 🚀 Ordem de Deploy:

1. Configure TODAS as variáveis primeiro
2. Faça o redeploy
3. Aguarde o build completar
4. Teste o sistema

## 📞 Suporte:

Se continuar com erro após configurar tudo:
1. Verifique os logs em: Vercel > Functions > Logs
2. Confirme que TODAS as 7 variáveis estão configuradas
3. Tente um "Force Redeploy" com cache limpo

---

**ATENÇÃO**: O sistema foi projetado para funcionar com Pinecone SEMPRE ONLINE. Não há modo offline ou fallback.
