import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("🔴 Credenciais ausentes")
          return null
        }

        try {
          console.log("🔍 Tentando autenticar:", credentials.email)
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
          }) as any

          console.log("👤 Usuário encontrado:", user ? "Sim" : "Não")

          if (!user) {
            console.log("❌ Usuário não encontrado para:", email)
            return null
          }

          // Verificar senha hasheada
          const isPasswordValid = user.password ? await compare(password, user.password) : false
          console.log("🔐 Senha válida:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("❌ Senha incorreta para:", email)
            return null
          }

          console.log("✅ Login bem-sucedido para:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("🔴 Erro na autenticação:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Se a URL começar com /, adicionar o baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Se a URL já for do mesmo domínio, usar ela
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Caso contrário, redirecionar para o dashboard
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
