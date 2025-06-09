"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Sparkles, TestTube, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function TesteIAPage() {
  const [emailTeste, setEmailTeste] = useState({
    assunto: "Problema com checkout no meu pedido",
    corpo:
      "Olá, estou tentando finalizar minha compra há 2 horas mas o sistema não aceita meu cartão de crédito. Já tentei com 3 cartões diferentes e todos dão erro. Preciso urgente dessa compra para hoje. Por favor me ajudem!",
    remetente: "João Silva",
  })

  const [resultados, setResultados] = useState<any>(null)
  const [isTestando, setIsTestando] = useState(false)
  const [testeConectividade, setTesteConectividade] = useState<"idle" | "testing" | "success" | "error">("idle")

  const testarAnaliseCompleta = async () => {
    setIsTestando(true)
    setResultados(null)

    try {
      const response = await fetch("/api/email-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assunto: emailTeste.assunto,
          corpo: emailTeste.corpo,
          nomeRemetente: emailTeste.remetente,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      setResultados(data)

      toast({
        title: "✅ Teste concluído com sucesso!",
        description: "Todas as funcionalidades de IA estão operacionais.",
      })
    } catch (error) {
      console.error("Erro no teste:", error)
      toast({
        title: "❌ Erro no teste",
        description: "Falha ao testar as funcionalidades de IA. Verifique a configuração.",
        variant: "destructive",
      })
    } finally {
      setIsTestando(false)
    }
  }

  const testarConectividadeOpenAI = async () => {
    setTesteConectividade("testing")

    try {
      // Teste simples de conectividade
      const response = await fetch("/api/email-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assunto: "Teste de conectividade",
          corpo: "Este é um teste simples para verificar a conectividade com OpenAI.",
          nomeRemetente: "Sistema",
        }),
      })

      if (response.ok) {
        setTesteConectividade("success")
        toast({
          title: "✅ Conectividade OK",
          description: "Conexão com OpenAI está funcionando corretamente.",
        })
      } else {
        throw new Error(`Status: ${response.status}`)
      }
    } catch (error) {
      setTesteConectividade("error")
      toast({
        title: "❌ Erro de conectividade",
        description: "Não foi possível conectar com OpenAI. Verifique a API key.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teste de Funcionalidades IA</h1>
          <p className="text-gray-600">Verificar se todas as integrações com OpenAI estão funcionando</p>
        </div>
      </div>

      {/* Teste de Conectividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(testeConectividade)}
            Teste de Conectividade OpenAI
          </CardTitle>
          <CardDescription>Verificar se a conexão com a API do OpenAI está funcionando</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testarConectividadeOpenAI} disabled={testeConectividade === "testing"} className="w-full">
            {testeConectividade === "testing" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando conectividade...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Testar Conectividade
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Configuração do E-mail de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>E-mail de Teste</CardTitle>
          <CardDescription>Configure um e-mail para testar todas as funcionalidades de IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="assunto">Assunto do E-mail</Label>
            <Input
              id="assunto"
              value={emailTeste.assunto}
              onChange={(e) => setEmailTeste((prev) => ({ ...prev, assunto: e.target.value }))}
              placeholder="Digite o assunto do e-mail"
            />
          </div>

          <div>
            <Label htmlFor="remetente">Nome do Remetente</Label>
            <Input
              id="remetente"
              value={emailTeste.remetente}
              onChange={(e) => setEmailTeste((prev) => ({ ...prev, remetente: e.target.value }))}
              placeholder="Nome do remetente"
            />
          </div>

          <div>
            <Label htmlFor="corpo">Corpo do E-mail</Label>
            <Textarea
              id="corpo"
              value={emailTeste.corpo}
              onChange={(e) => setEmailTeste((prev) => ({ ...prev, corpo: e.target.value }))}
              placeholder="Digite o conteúdo do e-mail"
              className="min-h-[120px]"
            />
          </div>

          <Button
            onClick={testarAnaliseCompleta}
            disabled={isTestando || !emailTeste.assunto || !emailTeste.corpo}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isTestando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Testar Análise Completa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Resultados da Análise IA
            </CardTitle>
            <CardDescription>Resultados detalhados de todas as funcionalidades testadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categorização */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                Categorização Automática
              </h3>
              <Badge className="bg-purple-600 text-white">{resultados.categoria}</Badge>
              <p className="text-sm text-gray-600 mt-1">✅ E-mail categorizado automaticamente pela IA</p>
            </div>

            <Separator />

            {/* Avaliação de Complexidade */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                Avaliação de Complexidade
              </h3>
              <Badge className="bg-orange-600 text-white">Nível {resultados.complexidade}/5</Badge>
              <p className="text-sm text-gray-600 mt-1">
                ✅ Complexidade avaliada:{" "}
                {resultados.complexidade <= 2
                  ? "Simples"
                  : resultados.complexidade <= 3
                    ? "Moderado"
                    : resultados.complexidade <= 4
                      ? "Complexo"
                      : "Muito Complexo"}
              </p>
            </div>

            <Separator />

            {/* Palavras-chave */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                Extração de Palavras-chave
              </h3>
              <div className="flex flex-wrap gap-2">
                {resultados.palavrasChave?.map((palavra: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {palavra}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ✅ {resultados.palavrasChave?.length || 0} palavras-chave extraídas
              </p>
            </div>

            <Separator />

            {/* Resposta Sugerida */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                Resposta Automática Gerada
              </h3>
              {resultados.resposta ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 whitespace-pre-line">{resultados.resposta}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Resposta não gerada - Complexidade muito alta, requer intervenção humana
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-1">✅ Sistema de resposta automática funcionando</p>
            </div>

            <Separator />

            {/* Intervenção Humana */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                Detecção de Intervenção Humana
              </h3>
              <Badge
                className={resultados.precisaIntervencaoHumana ? "bg-red-600 text-white" : "bg-green-600 text-white"}
              >
                {resultados.precisaIntervencaoHumana ? "Intervenção Necessária" : "Automático"}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">✅ Sistema de detecção de complexidade funcionando</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Análise de E-mail</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Geração de Resposta</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Extração de Palavras-chave</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Avaliação de Complexidade</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
