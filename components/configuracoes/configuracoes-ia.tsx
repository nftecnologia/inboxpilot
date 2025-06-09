"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Save, Info, Sparkles } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ConfiguracoesIA() {
  const [estiloEscrita, setEstiloEscrita] = useState("neutro")
  const [respostaAutomatica, setRespostaAutomatica] = useState(true)
  const [enviarDadosAnonimos, setEnviarDadosAnonimos] = useState(false)
  const [modeloIA, setModeloIA] = useState("gpt-4o")
  const [limiteComplexidade, setLimiteComplexidade] = useState("3")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações da IA salvas",
        description: "Suas configurações de IA foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-2xl font-semibold text-[#0088FF]">Configurações da IA</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">
            Configure o comportamento da inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Modelo de IA</h3>
            <Select value={modeloIA} onValueChange={setModeloIA}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais rápido)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              O modelo GPT-4o oferece o melhor equilíbrio entre qualidade e velocidade para análise e resposta de
              e-mails.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estilo de Escrita</h3>
            <RadioGroup value={estiloEscrita} onValueChange={setEstiloEscrita} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="formal" id="formal" />
                <Label htmlFor="formal" className="cursor-pointer">
                  Formal
                </Label>
                <span className="text-sm text-gray-500 ml-2">
                  (Linguagem corporativa, termos técnicos, tratamento respeitoso)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutro" id="neutro" />
                <Label htmlFor="neutro" className="cursor-pointer">
                  Neutro
                </Label>
                <span className="text-sm text-gray-500 ml-2">(Balanceado, profissional mas acessível)</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="informal" id="informal" />
                <Label htmlFor="informal" className="cursor-pointer">
                  Informal
                </Label>
                <span className="text-sm text-gray-500 ml-2">(Amigável, casual, uso de emojis ocasionais)</span>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Modo de Atuação</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="resposta-automatica" className="text-base">
                  Resposta Automática
                </Label>
                <p className="text-sm text-gray-500">
                  Quando ativado, a IA responderá automaticamente aos e-mails. A intervenção humana será solicitada
                  apenas quando necessário para casos complexos ou que exijam análise especializada.
                </p>
              </div>
              <Switch id="resposta-automatica" checked={respostaAutomatica} onCheckedChange={setRespostaAutomatica} />
            </div>

            <div className="mt-4">
              <Label htmlFor="limite-complexidade" className="text-base mb-2 block">
                Limite de Complexidade para Resposta Automática
              </Label>
              <Select value={limiteComplexidade} onValueChange={setLimiteComplexidade}>
                <SelectTrigger id="limite-complexidade" className="w-full">
                  <SelectValue placeholder="Selecione o limite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 - Apenas e-mails muito simples</SelectItem>
                  <SelectItem value="3">3 - E-mails de complexidade média (Recomendado)</SelectItem>
                  <SelectItem value="4">4 - Maioria dos e-mails (exceto muito complexos)</SelectItem>
                  <SelectItem value="5">5 - Todos os e-mails</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                E-mails com complexidade acima deste limite serão encaminhados para análise humana.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Autoaprendizado e Feedback</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dados-anonimos" className="text-base">
                  Enviar Dados Anônimos
                </Label>
                <p className="text-sm text-gray-500">
                  Compartilhar dados anônimos para melhorar o modelo global da IA.
                </p>
              </div>
              <Switch id="dados-anonimos" checked={enviarDadosAnonimos} onCheckedChange={setEnviarDadosAnonimos} />
            </div>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-[#2A65F9]" />
                    Como funciona o autoaprendizado?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 space-y-2">
                  <p>O sistema de autoaprendizado está sempre ativo e funciona da seguinte forma:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sugestões aceitas são registradas para reforçar o modelo</li>
                    <li>Sugestões rejeitadas ou editadas são usadas para ajustar as ponderações</li>
                    <li>O sistema implementa um mecanismo de fallback para detectar casos complexos</li>
                    <li>Um feedback loop contínuo melhora as respostas ao longo do tempo</li>
                    <li>
                      Casos que exigem conhecimento especializado são automaticamente encaminhados para intervenção
                      humana
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#0088FF] hover:bg-[#0066CC]" disabled={isLoading}>
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
