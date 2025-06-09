"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface StatusItem {
  id: string
  nome: string
  status: "online" | "offline" | "warning"
  ultimaVerificacao: Date
  detalhes?: string
}

export function ConfiguracoesStatus() {
  const [statusItems, setStatusItems] = useState<StatusItem[]>([
    {
      id: "email",
      nome: "Servidor de E-mail",
      status: "online",
      ultimaVerificacao: new Date(),
      detalhes: "IMAP/SMTP funcionando normalmente",
    },
    {
      id: "ia",
      nome: "API de IA",
      status: "online",
      ultimaVerificacao: new Date(),
      detalhes: "Conexão estável com OpenAI",
    },
    {
      id: "webhook",
      nome: "Webhooks",
      status: "warning",
      ultimaVerificacao: new Date(),
      detalhes: "1 webhook com resposta lenta",
    },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulação de verificação de status
    setTimeout(() => {
      // Atualiza o status aleatoriamente para demonstração
      const newStatusItems = statusItems.map((item) => {
        const statuses: ("online" | "offline" | "warning")[] = ["online", "warning", "online"]
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

        return {
          ...item,
          status: randomStatus,
          ultimaVerificacao: new Date(),
        }
      })

      setStatusItems(newStatusItems)
      setIsRefreshing(false)

      toast({
        title: "Status atualizado",
        description: "O status de conexão foi atualizado com sucesso.",
      })
    }, 1500)
  }

  // Formata a data de última verificação
  const formatarData = (data: Date) => {
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Renderiza o ícone de status
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-[#27AE60]" />
      case "offline":
        return <XCircle className="h-5 w-5 text-[#E74C3C]" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[#F4C145]" />
      default:
        return null
    }
  }

  // Renderiza o texto de status
  const renderStatusText = (status: string) => {
    switch (status) {
      case "online":
        return <span className="text-[#27AE60] font-medium">Online</span>
      case "offline":
        return <span className="text-[#E74C3C] font-medium">Offline</span>
      case "warning":
        return <span className="text-[#F4C145] font-medium">Atenção</span>
      default:
        return null
    }
  }

  // Atualiza o status a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusItems((items) =>
        items.map((item) => ({
          ...item,
          ultimaVerificacao: new Date(),
        })),
      )
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold text-[#0088FF] mb-1">Status de Conexão</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Verifique o status de conexão dos serviços
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-[#D1D5DB] text-[#2E2E2E]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                item.status === "online"
                  ? "bg-green-50 border-green-200"
                  : item.status === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="space-y-1 mb-2 sm:mb-0">
                  <div className="flex items-center">
                    {renderStatusIcon(item.status)}
                    <h3 className="ml-2 font-medium text-gray-800">{item.nome}</h3>
                  </div>
                  {item.detalhes && <p className="text-sm text-gray-600 ml-7">{item.detalhes}</p>}
                </div>
                <div className="flex flex-col sm:items-end">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Status:</span>
                    {renderStatusText(item.status)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Última verificação: {formatarData(item.ultimaVerificacao)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Informações Adicionais</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-[#27AE60] mr-2 mt-0.5" />
              <span>
                <strong>Online:</strong> O serviço está funcionando normalmente.
              </span>
            </li>
            <li className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-[#F4C145] mr-2 mt-0.5" />
              <span>
                <strong>Atenção:</strong> O serviço está funcionando, mas com alguma limitação ou lentidão.
              </span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-4 w-4 text-[#E74C3C] mr-2 mt-0.5" />
              <span>
                <strong>Offline:</strong> O serviço está indisponível no momento.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
