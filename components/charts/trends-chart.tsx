"use client"

import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface TrendsChartProps {
  periodo: string
}

export function TrendsChart({ periodo }: TrendsChartProps) {
  const getData = (periodo: string) => {
    const dataMap = {
      "7dias": [
        { name: "Seg", volume: 42, automacao: 78, escalamentos: 8 },
        { name: "Ter", volume: 58, automacao: 82, escalamentos: 12 },
        { name: "Qua", volume: 65, automacao: 75, escalamentos: 7 },
        { name: "Qui", volume: 49, automacao: 80, escalamentos: 9 },
        { name: "Sex", volume: 62, automacao: 85, escalamentos: 15 },
        { name: "Sáb", volume: 38, automacao: 72, escalamentos: 5 },
        { name: "Dom", volume: 30, automacao: 70, escalamentos: 3 },
      ],
      "30dias": [
        { name: "Sem 1", volume: 280, automacao: 75, escalamentos: 28 },
        { name: "Sem 2", volume: 310, automacao: 78, escalamentos: 31 },
        { name: "Sem 3", volume: 290, automacao: 82, escalamentos: 25 },
        { name: "Sem 4", volume: 340, automacao: 85, escalamentos: 30 },
      ],
      personalizado: [
        { name: "Período 1", volume: 420, automacao: 73, escalamentos: 35 },
        { name: "Período 2", volume: 380, automacao: 79, escalamentos: 28 },
        { name: "Período 3", volume: 450, automacao: 84, escalamentos: 22 },
        { name: "Período 4", volume: 510, automacao: 87, escalamentos: 18 },
      ],
    }
    return dataMap[periodo as keyof typeof dataMap] || dataMap["30dias"]
  }

  const data = getData(periodo)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const escPercentage = (payload[0].payload.escalamentos / payload[0].payload.volume) * 100

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[220px]">
          <p className="font-semibold text-gray-800 mb-2 text-sm border-b pb-1">{label}</p>

          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-medium">{entry.name}:</span>
              </div>
              <span className="text-xs font-bold">
                {entry.dataKey === "automacao" ? `${entry.value}%` : entry.value}
              </span>
            </div>
          ))}

          <div className="border-t pt-2 mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Taxa de escalamento:</span>
              <span className="text-xs font-medium">{escPercentage.toFixed(1)}%</span>
            </div>

            <div className="text-xs">
              {escPercentage > 15 ? (
                <span className="text-red-600 font-medium">⚠ Acima da média</span>
              ) : escPercentage < 8 ? (
                <span className="text-green-600 font-medium">✓ Abaixo da média</span>
              ) : (
                <span className="text-blue-600 font-medium">→ Na média</span>
              )}
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
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0088FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0088FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#0088FF", strokeWidth: 1 }} />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingBottom: "5px" }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            fill="url(#colorVolume)"
            stroke="#0088FF"
            strokeWidth={2}
            name="Volume de E-mails"
          />
          <Line
            type="monotone"
            dataKey="automacao"
            stroke="#27AE60"
            strokeWidth={2}
            dot={{ fill: "#27AE60", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#27AE60", strokeWidth: 2 }}
            name="Taxa de Automação (%)"
          />
          <Line
            type="monotone"
            dataKey="escalamentos"
            stroke="#E74C3C"
            strokeWidth={2}
            dot={{ fill: "#E74C3C", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#E74C3C", strokeWidth: 2 }}
            name="Escalamentos"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
