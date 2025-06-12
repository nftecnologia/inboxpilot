"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    try {
      // Validar dados no front-end
      const validation = registerSchema.safeParse({
        name: fullName,
        email,
        password,
      })

      if (!validation.success) {
        setError(validation.error.errors[0].message)
        return
      }

      setIsLoading(true)

      // Chamar API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro no cadastro')
        return
      }

      // Sucesso
      toast({
        title: "Cadastro realizado",
        description: "Conta criada com sucesso! Faça login para continuar.",
      })

      // Redirecionar para login
      router.push("/login")

    } catch (error) {
      console.error('Erro no cadastro:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-sm mx-auto relative z-10">
        {/* Logo em destaque */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-lg scale-110"></div>
            <h1 className="text-4xl font-bold text-blue-600 relative z-10 tracking-tight">KIRVANO</h1>
            <p className="text-sm text-gray-600 mt-1 relative z-10">Suporte Inteligente</p>
          </div>
        </div>

        {/* Card de cadastro */}
        <Card className="shadow-2xl border-0 relative overflow-hidden backdrop-blur-sm bg-white/80">
          {/* Borda superior decorativa animada */}
          <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Criar conta</h2>
              <p className="text-sm text-gray-500 mt-1">Junte-se ao Kirvano Suporte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input_full_name" className="text-sm text-gray-700 font-medium">
                  Nome completo
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                  <Input
                    id="input_full_name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input_email" className="text-sm text-gray-700 font-medium">
                  E-mail
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                  <Input
                    id="input_email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="input_password" className="text-sm text-gray-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <Input
                      id="input_password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input_confirm_password" className="text-sm text-gray-700 font-medium">
                    Confirmar
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <Input
                      id="input_confirm_password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                id="btn_register_submit"
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-sm transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Cadastrando...
                  </div>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">Já tem conta? </span>
                <Link
                  href="/"
                  id="btn_back_to_login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                >
                  Faça login
                </Link>
              </div>
            </form>

            {/* Indicador de segurança */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-400 group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1 transition-colors group-hover:text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="transition-colors group-hover:text-gray-600">Conexão segura</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
