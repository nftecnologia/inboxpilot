"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface CategoriesChartProps {
  tipo: "resolucao" | "conhecimento" | "horarios"
  periodo: string
}

export function CategoriesChart({ tipo, periodo }: CategoriesChartProps) {
  const getData = (tipo: string) => {
    const dataMap = {
      resolucao: [
        { name: "100% IA", value: 68, color: "#27AE60" },
        { name: "IA + Humano", value: 25, color: "#E67E22" },
        { name: "100% Humano", value: 7, color: "#E74C3C" },
      ],
      conhecimento: [
        { name: "Produtos", value: 28, color: "#0088FF" },
        { name: "Checkout e Conversão", value: 22, color: "#27AE60" },
        { name: "Integrações", value: 18, color: "#E67E22" },
        { name: "Geral", value: 15, color: "#8B5CF6" },
        { name: "Suporte Técnico", value: 12, color: "#E74C3C" },
        { name: "Outros", value: 5, color: "#6B7280" },
      ],
      horarios: [
        { name: "08h", value: 12, color: "#0088FF" },
        { name: "09h", value: 28, color: "#0088FF" },
        { name: "10h", value: 45, color: "#0088FF" },
        { name: "11h", value: 52, color: "#0088FF" },
        { name: "14h", value: 48, color: "#0088FF" },
        { name: "15h", value: 38, color: "#0088FF" },
        { name: "16h", value: 35, color: "#0088FF" },
        { name: "17h", value: 25, color: "#0088FF" },
      ],
    }
    return dataMap[tipo as keyof typeof dataMap] || dataMap.resolucao
  }

  const data = getData(tipo)

  const getEmailCount = (value: number) => {
    return Math.round((value / 100) * 1248)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const emailCount = getEmailCount(data.value)

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-800 text-sm border-b pb-1 mb-2">{data.name}</p>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Percentual:</span>
              <span className="text-xs font-bold">{data.value}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs font-medium">Quantidade:</span>
              <span className="text-xs font-bold">{emailCount} e-mails</span>
            </div>

            {tipo === "conhecimento" && (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Tempo médio:</span>
                  <span className="text-xs">{(Math.random() * 2 + 0.5).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Taxa resolução:</span>
                  <span className="text-xs">{Math.round(Math.random() * 20 + 75)}%</span>
                </div>
              </>
            )}

            {tipo === "resolucao" && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Tempo médio:</span>
                <span className="text-xs">
                  {data.name === "100% IA" ? "0.8h" : data.name === "IA + Humano" ? "1.5h" : "2.3h"}
                </span>
              </div>
            )}

            {tipo === "horarios" && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Pico do dia:</span>
                <span className="text-xs">{data.value > 40 ? "Alto" : data.value > 25 ? "Médio" : "Baixo"}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (tipo === "horarios") {
    return (
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 136, 255, 0.1)" }} />
            <Bar dataKey="value" fill="#0088FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-[280px] w-full">
      <div className="w-full md:w-3/5 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={tipo === "resolucao" ? 50 : 0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-2/5 h-full flex flex-col justify-center space-y-2 mt-2 md:mt-0 md:pl-2">
        {data.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <div className="flex-1 flex justify-between items-center">
              <span className="text-xs text-gray-700">{entry.name}</span>
              <span className="text-xs font-semibold text-gray-800">{entry.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
