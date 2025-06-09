# InboxPilot - Centralização e Automação de E-mails

Sistema de automação inteligente para gerenciamento de e-mails corporativos utilizando IA para classificação e resposta automática.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Banco de Dados**: Neon Postgres com Prisma ORM
- **Autenticação**: Next Auth v5
- **Estado**: React Query (TanStack Query)
- **Validação**: Zod + React Hook Form
- **Server Actions**: next-safe-action
- **IA**: Vercel AI SDK com OpenAI

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado)
- Conta no Neon (PostgreSQL)
- Chave da API OpenAI

## ⚙️ Setup do Projeto

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd inboxpilot
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure as seguintes variáveis:

```env
# Neon Postgres Database
DATABASE_URL="postgresql://username:password@your-neon-host/your-database?sslmode=require"
DIRECT_URL="postgresql://username:password@your-neon-host/your-database?sslmode=require"

# Next Auth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
pnpm db:generate

# Executar migrations
pnpm db:migrate

# Visualizar banco (opcional)
pnpm db:studio
```

### 4. Executar em desenvolvimento

```bash
pnpm dev
```

## 🗃️ Estrutura do Banco de Dados

### Principais Modelos

- **User**: Usuários do sistema
- **Account/Session**: Gerenciamento de autenticação (Next Auth)
- **Email**: E-mails processados pelo sistema
- **KnowledgeBase**: Base de conhecimento para IA
- **EmailTemplate**: Templates de resposta
- **EmailMetrics**: Métricas e analytics

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build
pnpm start

# Banco de dados
pnpm db:generate    # Gerar cliente Prisma
pnpm db:push        # Push schema sem migration
pnpm db:migrate     # Executar migrations
pnpm db:studio      # Interface visual do banco

# Qualidade de código
pnpm lint
```

## 🏗️ Arquitetura

### Autenticação
- Next Auth v5 com adaptador Prisma
- Suporte a credenciais e OAuth (Google)
- Sessões JWT

### Estado Global
- React Query para cache e sincronização
- Server Actions com next-safe-action
- Optimistic updates

### Validação
- Schemas Zod para validação
- React Hook Form para formulários
- Validação client + server side

### Banco de Dados
- Neon Postgres (serverless)
- Prisma ORM
- Migrations versionadas

## 📱 Funcionalidades

- ✅ Autenticação completa (login/cadastro)
- ✅ Dashboard com métricas
- ✅ Gerenciamento de e-mails
- ✅ Base de conhecimento
- ✅ Análise de IA
- ✅ Relatórios e analytics
- ✅ Interface responsiva

## 🔒 Segurança

- Prepared statements (Prisma)
- Validação de inputs (Zod)
- Sanitização de dados
- Variáveis de ambiente seguras
- HTTPS obrigatório em produção

## 📊 Monitoramento

- React Query Devtools
- Prisma Studio
- Logs estruturados
- Métricas de performance

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas

Certifique-se de:
- Node.js 18+
- Variáveis de ambiente configuradas
- Executar `pnpm build`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Feat(component): add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrão de Commits

Use o formato: `Tipo(escopo): descrição`

Exemplos:
- `Feat(auth): add Google OAuth`
- `Fix(db): fix migration error`
- `Docs(readme): update setup instructions`

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através de:
- Issues do GitHub
- E-mail: suporte@inboxpilot.com

---

Desenvolvido com ❤️ pela equipe InboxPilot
