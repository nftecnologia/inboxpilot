"use client"

import { ResponseRateAlert } from "@/components/alerts/response-rate-alert"

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Detalhes do Alerta</h1>

        <ResponseRateAlert
          currentRate={65}
          targetRate={80}
          detectedTime="há 15 min"
          onClose={() => console.log("Fechar alerta")}
          onUpdateKnowledgeBase={() => console.log("Atualizar base de conhecimento")}
        />

        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Histórico de Taxas de Resposta</h2>
            <div className="h-64 bg-gray-50 rounded-md border flex items-center justify-center text-gray-500">
              Gráfico de histórico de taxas de resposta
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Análise de Causas</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="font-medium text-gray-700 mb-2">Volume de E-mails</h3>
                <p className="text-sm text-gray-600">
                  O volume de e-mails aumentou 35% nas últimas 24 horas, o que pode estar sobrecarregando o sistema.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="font-medium text-gray-700 mb-2">Conexão com API</h3>
                <p className="text-sm text-gray-600">
                  Foram detectadas 12 falhas de conexão com a API de IA nas últimas 3 horas.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="font-medium text-gray-700 mb-2">Base de Conhecimento</h3>
                <p className="text-sm text-gray-600">
                  A última atualização da base de conhecimento foi há 14 dias. Recomenda-se atualizar a cada 7 dias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
