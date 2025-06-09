"use client"

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"

interface PerformanceChartProps {
  periodo: string
}

export function PerformanceChart({ periodo }: PerformanceChartProps) {
  const getData = (periodo: string) => {
    const dataMap = {
      "7dias": [
        { name: "Seg", taxaAceitacao: 78, tempoResposta: 1.2, satisfacao: 4.5 },
        { name: "Ter", taxaAceitacao: 82, tempoResposta: 1.1, satisfacao: 4.6 },
        { name: "Qua", taxaAceitacao: 75, tempoResposta: 1.4, satisfacao: 4.4 },
        { name: "Qui", taxaAceitacao: 80, tempoResposta: 1.3, satisfacao: 4.7 },
        { name: "Sex", taxaAceitacao: 85, tempoResposta: 1.0, satisfacao: 4.8 },
        { name: "Sáb", taxaAceitacao: 72, tempoResposta: 1.5, satisfacao: 4.3 },
        { name: "Dom", taxaAceitacao: 70, tempoResposta: 1.6, satisfacao: 4.2 },
      ],
      "30dias": [
        { name: "Sem 1", taxaAceitacao: 75, tempoResposta: 1.8, satisfacao: 4.4 },
        { name: "Sem 2", taxaAceitacao: 78, tempoResposta: 1.6, satisfacao: 4.5 },
        { name: "Sem 3", taxaAceitacao: 82, tempoResposta: 1.4, satisfacao: 4.7 },
        { name: "Sem 4", taxaAceitacao: 85, tempoResposta: 1.2, satisfacao: 4.8 },
      ],
      personalizado: [
        { name: "Período 1", taxaAceitacao: 73, tempoResposta: 1.9, satisfacao: 4.3 },
        { name: "Período 2", taxaAceitacao: 79, tempoResposta: 1.5, satisfacao: 4.6 },
        { name: "Período 3", taxaAceitacao: 84, tempoResposta: 1.3, satisfacao: 4.8 },
        { name: "Período 4", taxaAceitacao: 87, tempoResposta: 1.1, satisfacao: 4.9 },
      ],
    }
    return dataMap[periodo as keyof typeof dataMap] || dataMap["30dias"]
  }

  const data = getData(periodo)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
                {entry.dataKey === "tempoResposta"
                  ? `${entry.value}h`
                  : entry.dataKey === "satisfacao"
                    ? `${entry.value}/5`
                    : `${entry.value}%`}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-600">
              {payload[0]?.payload.taxaAceitacao > 80 ? (
                <span className="text-green-600 font-medium">✓ Desempenho acima da meta</span>
              ) : payload[0]?.payload.taxaAceitacao < 75 ? (
                <span className="text-red-600 font-medium">⚠ Desempenho abaixo da meta</span>
              ) : (
                <span className="text-blue-600 font-medium">→ Desempenho dentro da meta</span>
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTaxa" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="taxaAceitacao"
            stroke="#0088FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTaxa)"
            name="Taxa de Aceitação (%)"
            dot={{ fill: "#0088FF", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#0088FF", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="satisfacao"
            stroke="#27AE60"
            strokeWidth={2}
            dot={{ fill: "#27AE60", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#27AE60", strokeWidth: 2 }}
            name="Satisfação (1-5)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
