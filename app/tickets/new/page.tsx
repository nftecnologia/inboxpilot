"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/app-layout"
import { toast } from "@/components/ui/use-toast"
import { useCreateTicket } from "@/hooks/useMutations/useTicketMutations"

export default function NewTicketPage() {
  const router = useRouter()
  const createTicketMutation = useCreateTicket()
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    category: "",
    clientName: "",
    clientEmail: "",
    clientCompany: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.subject || !formData.description || !formData.clientEmail) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Criar ticket
    createTicketMutation.mutate({
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority,
      category: formData.category || "Geral",
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        company: formData.clientCompany,
      },
    }, {
      onSuccess: (data) => {
        toast({
          title: "Ticket criado",
          description: "O ticket foi criado com sucesso!",
        })
        // Redirecionar para o ticket criado
        router.push(`/tickets/${data.id}`)
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível criar o ticket. Tente novamente.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-2xl font-semibold text-[#0088FF]">Novo Ticket</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie um novo ticket de suporte para acompanhamento
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Cliente</CardTitle>
                <CardDescription>
                  Dados do cliente que está abrindo o ticket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Nome do Cliente</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="João Silva"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail">E-mail do Cliente*</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="cliente@exemplo.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="clientCompany">Empresa</Label>
                  <Input
                    id="clientCompany"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                    placeholder="Nome da Empresa"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Ticket</CardTitle>
                <CardDescription>
                  Informações sobre o problema ou solicitação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Assunto*</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Resumo do problema ou solicitação"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição*</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva detalhadamente o problema ou solicitação..."
                    rows={6}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Dúvidas">Dúvidas</SelectItem>
                        <SelectItem value="Sugestões">Sugestões</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0088FF] hover:bg-blue-600"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? (
                  <>Criando...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Criar Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
