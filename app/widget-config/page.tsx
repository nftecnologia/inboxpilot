"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Palette,
  Globe,
  Code,
  BarChart3,
  Settings,
  Image
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function WidgetConfigPage() {
  const queryClient = useQueryClient()
  const [showApiKey, setShowApiKey] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  
  // Buscar configurações do widget
  const { data: widgetConfigs = [], isLoading } = useQuery({
    queryKey: ["widget-configs"],
    queryFn: async () => {
      const response = await fetch("/api/widget-config")
      if (!response.ok) {
        throw new Error("Erro ao buscar configurações")
      }
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
  })

  // Criar nova configuração
  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/widget-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widget-configs"] })
      toast({
        title: "Widget criado!",
        description: "Sua configuração foi criada com sucesso.",
      })
    },
  })

  // Atualizar configuração
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const response = await fetch(`/api/widget-config/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widget-configs"] })
      toast({
        title: "Configuração atualizada!",
        description: "As alterações foram salvas.",
      })
    },
  })

  // Copiar código
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    })
  }

  // Gerar código de integração
  const generateIntegrationCode = (config: any) => {
    return `<script>
  window.KirvanoChat = {
    appId: '${config.appId}'${config.primaryColor !== '#2A65F9' ? `,
    primaryColor: '${config.primaryColor}'` : ''}${config.position !== 'bottom-right' ? `,
    position: '${config.position}'` : ''}${config.title !== 'Suporte' ? `,
    title: '${config.title}'` : ''}${config.subtitle !== 'Como podemos ajudar?' ? `,
    subtitle: '${config.subtitle}'` : ''}${config.avatarUrl ? `,
    avatarUrl: '${config.avatarUrl}'` : ''}
  };
  (function(){var w=window;var d=document;var s=d.createElement('script');
  s.src='https://seudominio.com/widget.js';s.async=true;
  d.head.appendChild(s);})();
</script>`
  }

  // Adicionar domínio
  const addDomain = (configId: string) => {
    if (!newDomain) return
    
    const config = widgetConfigs?.find((c: any) => c.id === configId)
    if (!config) return
    
    const updatedDomains = [...config.allowedDomains, newDomain]
    updateConfigMutation.mutate({
      id: configId,
      data: { allowedDomains: updatedDomains }
    })
    setNewDomain("")
  }

  // Remover domínio
  const removeDomain = (configId: string, domain: string) => {
    const config = widgetConfigs?.find((c: any) => c.id === configId)
    if (!config) return
    
    const updatedDomains = config.allowedDomains.filter((d: string) => d !== domain)
    updateConfigMutation.mutate({
      id: configId,
      data: { allowedDomains: updatedDomains }
    })
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0088FF]">Configuração do Widget</h1>
            <p className="text-sm text-gray-500">
              Gerencie widgets de chat para integração externa
            </p>
          </div>
          <Button 
            onClick={() => createConfigMutation.mutate({
              name: "Novo Widget"
            })}
            className="bg-[#2A65F9] hover:bg-[#2A65F9]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Widget
          </Button>
        </div>

        {/* Lista de widgets */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#2A65F9] border-t-transparent rounded-full" />
          </div>
        ) : widgetConfigs?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum widget configurado</h3>
              <p className="text-gray-500 mb-4">
                Crie seu primeiro widget para começar a integrar o chat em sites externos.
              </p>
              <Button 
                onClick={() => createConfigMutation.mutate({
                  name: "Meu Primeiro Widget"
                })}
                className="bg-[#2A65F9] hover:bg-[#2A65F9]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Widget
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {widgetConfigs?.map((config: any) => (
              <Card key={config.id} className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={config.isActive ? "default" : "secondary"}>
                        {config.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Criado em {new Date(config.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={config.isActive}
                    onCheckedChange={(checked) => updateConfigMutation.mutate({
                      id: config.id,
                      data: { isActive: checked }
                    })}
                  />
                </div>

                <Tabs defaultValue="integration" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="integration">
                      <Code className="h-4 w-4 mr-2" />
                      Integração
                    </TabsTrigger>
                    <TabsTrigger value="domains">
                      <Globe className="h-4 w-4 mr-2" />
                      Domínios
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                      <Palette className="h-4 w-4 mr-2" />
                      Aparência
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>

                  {/* Aba Integração */}
                  <TabsContent value="integration" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>App ID</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value={config.appId} readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyCode(config.appId)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>API Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input 
                            type={showApiKey ? "text" : "password"}
                            value={config.apiKey} 
                            readOnly 
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyCode(config.apiKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Código de Integração</Label>
                      <div className="mt-2 relative">
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generateIntegrationCode(config)}</code>
                        </pre>
                        <Button
                          className="absolute top-2 right-2"
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(generateIntegrationCode(config))}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Domínios */}
                  <TabsContent value="domains" className="space-y-4">
                    <div>
                      <Label>Domínios Autorizados</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Adicione os domínios onde o widget pode ser usado
                      </p>
                      
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="exemplo.com"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addDomain(config.id)}
                        />
                        <Button onClick={() => addDomain(config.id)}>
                          Adicionar
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {config.allowedDomains?.map((domain: string) => (
                          <div key={domain} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{domain}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDomain(config.id, domain)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {config.allowedDomains?.length === 0 && (
                          <p className="text-sm text-gray-500 py-4 text-center">
                            Nenhum domínio configurado. O widget funcionará em qualquer domínio.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Aparência */}
                  <TabsContent value="appearance" className="space-y-4">
                    {/* Avatar do Assistente */}
                    <div className="mb-6">
                      <Label>Avatar do Assistente</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Imagem que aparecerá nas mensagens do chat
                      </p>
                      
                      <div className="flex items-center gap-4">
                        {/* Preview do Avatar */}
                        <div className="relative">
                          {config.avatarUrl ? (
                            <img
                              src={config.avatarUrl}
                              alt="Avatar"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Input de URL */}
                        <div className="flex-1">
                          <Input
                            type="url"
                            placeholder="https://exemplo.com/avatar.png"
                            value={config.avatarUrl || ""}
                            onChange={(e) => updateConfigMutation.mutate({
                              id: config.id,
                              data: { avatarUrl: e.target.value }
                            })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use uma URL de imagem válida (PNG, JPG, WebP)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Cor Principal</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => updateConfigMutation.mutate({
                              id: config.id,
                              data: { primaryColor: e.target.value }
                            })}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) => updateConfigMutation.mutate({
                              id: config.id,
                              data: { primaryColor: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Posição</Label>
                        <select
                          className="w-full mt-1 p-2 border rounded-md"
                          value={config.position}
                          onChange={(e) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { position: e.target.value }
                          })}
                        >
                          <option value="bottom-right">Inferior Direito</option>
                          <option value="bottom-left">Inferior Esquerdo</option>
                          <option value="top-right">Superior Direito</option>
                          <option value="top-left">Superior Esquerdo</option>
                        </select>
                      </div>

                      <div>
                        <Label>Título</Label>
                        <Input
                          value={config.title}
                          onChange={(e) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { title: e.target.value }
                          })}
                        />
                      </div>

                      <div>
                        <Label>Subtítulo</Label>
                        <Input
                          value={config.subtitle}
                          onChange={(e) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { subtitle: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Mensagem de Boas-vindas</Label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md"
                        rows={3}
                        value={config.welcomeMessage || ""}
                        onChange={(e) => updateConfigMutation.mutate({
                          id: config.id,
                          data: { welcomeMessage: e.target.value }
                        })}
                        placeholder="Olá! Como posso ajudá-lo hoje?"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label>Coletar Nome</Label>
                          <p className="text-sm text-gray-500">
                            Solicitar nome no formulário inicial
                          </p>
                        </div>
                        <Switch
                          checked={config.collectName !== false}
                          onCheckedChange={(checked) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { collectName: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label>Coletar Email</Label>
                          <p className="text-sm text-gray-500">
                            Solicitar email no formulário inicial
                          </p>
                        </div>
                        <Switch
                          checked={config.collectEmail !== false}
                          onCheckedChange={(checked) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { collectEmail: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label>Coletar Telefone</Label>
                          <p className="text-sm text-gray-500">
                            Solicitar telefone no formulário inicial
                          </p>
                        </div>
                        <Switch
                          checked={config.collectPhone !== false}
                          onCheckedChange={(checked) => updateConfigMutation.mutate({
                            id: config.id,
                            data: { collectPhone: checked }
                          })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba Analytics */}
                  <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <p className="text-sm text-gray-500">Total de Sessões</p>
                        <p className="text-2xl font-bold">{config.totalSessions || 0}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-sm text-gray-500">Total de Mensagens</p>
                        <p className="text-2xl font-bold">{config.totalMessages || 0}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-sm text-gray-500">Taxa de Conversão</p>
                        <p className="text-2xl font-bold">
                          {config.totalSessions > 0 
                            ? ((config.totalMessages / config.totalSessions) * 100).toFixed(1) 
                            : 0}%
                        </p>
                      </Card>
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Gráficos detalhados em breve...</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
