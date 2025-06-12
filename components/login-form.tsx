"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validation = loginSchema.safeParse({ email, password })
      
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error.errors[0].message,
          variant: "destructive",
        })
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha incorretos",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Login realizado",
        description: "Bem-vindo ao Kirvano Suporte!",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Erro no login:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo em destaque com efeito sutil */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-blue-100 rounded-lg blur-md opacity-70"></div>
          <h1 className="text-4xl font-bold text-blue-600 relative z-10 tracking-tight">KIRVANO</h1>
          <p className="text-sm text-gray-600 mt-1 relative z-10">Suporte Inteligente</p>
        </div>
      </div>

      {/* Card de login com design refinado */}
      <Card className="shadow-[0_10px_40px_-15px_rgba(0,118,255,0.2)] border border-blue-50 relative overflow-hidden backdrop-blur-sm bg-white/95">
        {/* Elementos decorativos */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-50 rounded-full opacity-70"></div>
        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-blue-50 rounded-full opacity-70"></div>

        {/* Borda superior decorativa com gradiente animado */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 animate-pulse opacity-70"></div>
        </div>

        <CardContent className="p-6 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="input_email" className="text-sm text-[#2E2E2E] font-medium">
                E-mail
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                <Input
                  id="input_email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 border-[#E5E7EB] focus:border-[#2A65F9] focus:ring-[#2A65F9] transition-all duration-200 rounded-md bg-white/80 hover:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="input_password" className="text-sm text-[#2E2E2E] font-medium">
                  Senha
                </Label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-[#2A65F9] hover:text-[#1E50D2] hover:underline transition-colors duration-200"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                <Input
                  id="input_password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 border-[#E5E7EB] focus:border-[#2A65F9] focus:ring-[#2A65F9] transition-all duration-200 rounded-md bg-white/80 hover:bg-white"
                  required
                />
              </div>
            </div>

            <Button
              id="btn_login"
              type="submit"
              className="w-full h-10 bg-[#2A65F9] hover:bg-[#1E50D2] text-white font-medium transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(42,101,249,0.3)] mt-4 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center pt-1">
              <span className="text-sm text-gray-500">Não tem conta? </span>
              <Link
                href="/cadastro"
                id="btn_register"
                className="text-sm font-medium text-[#2A65F9] hover:text-[#1E50D2] hover:underline transition-colors duration-200"
              >
                Cadastre-se
              </Link>
            </div>
          </form>

          {/* Indicador de segurança refinado */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-400 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1 text-green-500 group-hover:text-green-600 transition-colors duration-200"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="group-hover:text-gray-500 transition-colors duration-200">Conexão segura</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
