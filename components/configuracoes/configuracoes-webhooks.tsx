"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Save, Plus, Trash2, ExternalLink } from "lucide-react"

interface Webhook {
  id: string
  nome: string
  url: string
  tipo: string
  ativo: boolean
}

export function ConfiguracoesWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      nome: "Integração CRM",
      url: "https://api.meucrm.com/webhook",
      tipo: "email_recebido",
      ativo: true,
    },
  ])
  const [novoWebhook, setNovoWebhook] = useState({
    nome: "",
    url: "",
    tipo: "email_recebido",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleAddWebhook = () => {
    if (!novoWebhook.nome || !novoWebhook.url) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar um webhook.",
        variant: "destructive",
      })
      return
    }

    const newWebhook: Webhook = {
      id: Date.now().toString(),
      ...novoWebhook,
      ativo: true,
    }

    setWebhooks([...webhooks, newWebhook])
    setNovoWebhook({
      nome: "",
      url: "",
      tipo: "email_recebido",
    })

    toast({
      title: "Webhook adicionado",
      description: "O webhook foi adicionado com sucesso.",
    })
  }

  const handleRemoveWebhook = (id: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id))
    toast({
      title: "Webhook removido",
      description: "O webhook foi removido com sucesso.",
    })
  }

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map((webhook) => (webhook.id === id ? { ...webhook, ativo: !webhook.ativo } : webhook)))
  }

  const handleSaveWebhooks = () => {
    setIsLoading(true)

    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Webhooks salvos",
        description: "Suas configurações de webhooks foram salvas com sucesso.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#0088FF] mb-1">Webhooks</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Configure webhooks para integrar o Kirvano Suporte com outros sistemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Webhooks Configurados</h3>

            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-md">
                Nenhum webhook configurado
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md"
                  >
                    <div className="space-y-1 mb-3 sm:mb-0">
                      <div className="flex items-center">
                        <h4 className="font-medium">{webhook.nome}</h4>
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded-full ${webhook.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {webhook.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">{webhook.url}</span>
                        <a
                          href={webhook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-[#2A65F9] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-xs text-gray-500">
                        Tipo:{" "}
                        {webhook.tipo === "email_recebido"
                          ? "E-mail Recebido"
                          : webhook.tipo === "email_respondido"
                            ? "E-mail Respondido"
                            : "Todos os Eventos"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={webhook.ativo} onCheckedChange={() => handleToggleWebhook(webhook.id)} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWebhook(webhook.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Adicionar Novo Webhook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-nome">Nome</Label>
                <Input
                  id="webhook-nome"
                  value={novoWebhook.nome}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, nome: e.target.value })}
                  placeholder="Ex: Integração CRM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-tipo">Tipo de Evento</Label>
                <Select
                  value={novoWebhook.tipo}
                  onValueChange={(value) => setNovoWebhook({ ...novoWebhook, tipo: value })}
                >
                  <SelectTrigger id="webhook-tipo">
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_recebido">E-mail Recebido</SelectItem>
                    <SelectItem value="email_respondido">E-mail Respondido</SelectItem>
                    <SelectItem value="todos">Todos os Eventos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="webhook-url">URL</Label>
                <Input
                  id="webhook-url"
                  value={novoWebhook.url}
                  onChange={(e) => setNovoWebhook({ ...novoWebhook, url: e.target.value })}
                  placeholder="https://api.seuservico.com/webhook"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleAddWebhook} className="bg-[#2A65F9] hover:bg-[#1E50D2]">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Webhook
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button onClick={handleSaveWebhooks} className="bg-[#2A65F9] hover:bg-[#1E50D2]" disabled={isLoading}>
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
        </CardFooter>
      </Card>
    </div>
  )
}
