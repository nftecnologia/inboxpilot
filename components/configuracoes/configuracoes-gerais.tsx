"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"

export function ConfiguracoesGerais() {
  const [emailReceptor, setEmailReceptor] = useState("suporte@empresa.com")
  const [emailEncaminhamento, setEmailEncaminhamento] = useState("especialista@empresa.com")
  const [assinatura, setAssinatura] = useState("Atenciosamente,\nEquipe de Suporte\nEmpresa XYZ\nTel: (11) 1234-5678")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações salvas",
        description: "Suas configurações gerais foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#0088FF] mb-1">Configurações Gerais</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Configure os e-mails e assinatura padrão do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email-receptor">E-mail Receptor</Label>
            <Input
              id="email-receptor"
              type="email"
              value={emailReceptor}
              onChange={(e) => setEmailReceptor(e.target.value)}
              placeholder="suporte@empresa.com"
              required
            />
            <p className="text-sm text-gray-500">Este é o e-mail que receberá as mensagens dos clientes.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-encaminhamento">E-mail de Encaminhamento Manual</Label>
            <Input
              id="email-encaminhamento"
              type="email"
              value={emailEncaminhamento}
              onChange={(e) => setEmailEncaminhamento(e.target.value)}
              placeholder="especialista@empresa.com"
              required
            />
            <p className="text-sm text-gray-500">
              E-mails que necessitam de intervenção especializada serão encaminhados para este endereço.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assinatura">Assinatura Padrão</Label>
            <Textarea
              id="assinatura"
              value={assinatura}
              onChange={(e) => setAssinatura(e.target.value)}
              placeholder="Digite sua assinatura padrão..."
              className="min-h-[150px]"
            />
            <p className="text-sm text-gray-500">Esta assinatura será adicionada ao final de todas as respostas.</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#2A65F9] hover:bg-[#1E50D2]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
