import { Suspense } from "react"
import { LoadingState } from "@/components/loading-states"

export default function TicketsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets CRM</h1>
        <p className="text-muted-foreground">
          Gerencie todos os tickets de suporte em um só lugar
        </p>
      </div>
      
      <Suspense fallback={<LoadingState />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Abertos</h3>
            <p className="text-2xl font-bold text-red-600">12</p>
            <p className="text-xs text-muted-foreground">+2 hoje</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Em Andamento</h3>
            <p className="text-2xl font-bold text-yellow-600">8</p>
            <p className="text-xs text-muted-foreground">+1 hoje</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Resolvidos</h3>
            <p className="text-2xl font-bold text-green-600">45</p>
            <p className="text-xs text-muted-foreground">+5 hoje</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Satisfação</h3>
            <p className="text-2xl font-bold text-blue-600">4.8</p>
            <p className="text-xs text-muted-foreground">⭐ Média</p>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Sistema CRM em Desenvolvimento</h2>
          <p className="text-muted-foreground mb-4">
            O sistema de tickets CRM está sendo implementado com as seguintes funcionalidades:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>📋 Kanban board para gestão visual de tickets</li>
            <li>👥 Gestão completa de clientes</li>
            <li>🔄 Conversão automática de emails em tickets</li>
            <li>📊 Analytics e relatórios avançados</li>
            <li>⚡ SLA tracking e alertas</li>
            <li>🤖 IA para categorização automática</li>
          </ul>
        </div>
      </Suspense>
    </div>
  )
}
