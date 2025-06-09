"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLayout } from "@/components/app-layout"
import { ConfiguracoesGerais } from "@/components/configuracoes/configuracoes-gerais"
import { ConfiguracoesIA } from "@/components/configuracoes/configuracoes-ia"
import { ConfiguracoesConta } from "@/components/configuracoes/configuracoes-conta"
import { ConfiguracoesWebhooks } from "@/components/configuracoes/configuracoes-webhooks"
import { ConfiguracoesStatus } from "@/components/configuracoes/configuracoes-status"
import { Mail, Bot, User, Webhook, Activity } from "lucide-react"

export function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("gerais")

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie as configurações do seu sistema</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="gerais" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Gerais</span>
            </TabsTrigger>
            <TabsTrigger value="ia" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="conta" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerais">
            <ConfiguracoesGerais />
          </TabsContent>

          <TabsContent value="ia">
            <ConfiguracoesIA />
          </TabsContent>

          <TabsContent value="conta">
            <ConfiguracoesConta />
          </TabsContent>

          <TabsContent value="webhooks">
            <ConfiguracoesWebhooks />
          </TabsContent>

          <TabsContent value="status">
            <ConfiguracoesStatus />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
