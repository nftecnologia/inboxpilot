import { AppLayout } from "@/components/app-layout"
import { AIDashboard } from "@/components/ai-dashboard"

export default function IAPage() {
  return (
    <AppLayout>
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Analytics de IA</h1>
        <p className="text-sm text-gray-500">
          Acompanhe o desempenho e insights do sistema de inteligência artificial
        </p>
      </div>

      <AIDashboard />
    </AppLayout>
  )
}

export const dynamic = 'force-dynamic'
