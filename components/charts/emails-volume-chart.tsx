"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface EmailsVolumeChartProps {
  periodo: string
}

export function EmailsVolumeChart({ periodo }: EmailsVolumeChartProps) {
  const getData = (periodo: string) => {
    const dataMap = {
      "7dias": [
        { name: "Seg", recebidos: 42, respondidos: 38, pendentes: 4 },
        { name: "Ter", recebidos: 58, respondidos: 52, pendentes: 6 },
        { name: "Qua", recebidos: 65, respondidos: 59, pendentes: 6 },
        { name: "Qui", recebidos: 49, respondidos: 44, pendentes: 5 },
        { name: "Sex", recebidos: 62, respondidos: 56, pendentes: 6 },
        { name: "Sáb", recebidos: 38, respondidos: 35, pendentes: 3 },
        { name: "Dom", recebidos: 30, respondidos: 28, pendentes: 2 },
      ],
      "30dias": [
        { name: "Sem 1", recebidos: 280, respondidos: 252, pendentes: 28 },
        { name: "Sem 2", recebidos: 310, respondidos: 279, pendentes: 31 },
        { name: "Sem 3", recebidos: 290, respondidos: 261, pendentes: 29 },
        { name: "Sem 4", recebidos: 340, respondidos: 306, pendentes: 34 },
      ],
      "90dias": [
        { name: "Mês 1", recebidos: 1200, respondidos: 1080, pendentes: 120 },
        { name: "Mês 2", recebidos: 1350, respondidos: 1215, pendentes: 135 },
        { name: "Mês 3", recebidos: 1340, respondidos: 1206, pendentes: 134 },
      ],
      personalizado: [
        { name: "Período 1", recebidos: 450, respondidos: 405, pendentes: 45 },
        { name: "Período 2", recebidos: 520, respondidos: 468, pendentes: 52 },
        { name: "Período 3", recebidos: 380, respondidos: 342, pendentes: 38 },
        { name: "Período 4", recebidos: 610, respondidos: 549, pendentes: 61 },
      ],
    }
    return dataMap[periodo as keyof typeof dataMap] || dataMap["30dias"]
  }

  const data = getData(periodo)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-800 mb-2 text-sm border-b pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const percentage = ((entry.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-medium">{entry.name}:</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold">{entry.value}</span>
                  <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                </div>
              </div>
            )
          })}
          <div className="border-t pt-1 mt-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Total:</span>
              <span className="text-xs font-bold">{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Taxa de resolução:</span>
              <span className="text-xs text-green-600">{((payload[1]?.value / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 136, 255, 0.1)" }} />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingBottom: "5px" }}
          />
          <Bar dataKey="recebidos" fill="#0088FF" name="Recebidos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="respondidos" fill="#27AE60" name="Respondidos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pendentes" fill="#E74C3C" name="Pendentes" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
