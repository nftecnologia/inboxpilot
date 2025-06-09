"use client"

export function TaxaAceitacaoChart() {
  const data = [
    { label: "Aceitas", value: 78, color: "bg-emerald-500", textColor: "text-emerald-600" },
    { label: "Editadas", value: 15, color: "bg-amber-500", textColor: "text-amber-600" },
    { label: "Rejeitadas", value: 7, color: "bg-red-500", textColor: "text-red-600" },
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="w-full h-[280px] flex flex-col items-center justify-center p-4">
      {/* Gráfico Donut */}
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage} ${100 - percentage}`
            const strokeDashoffset = -cumulativePercentage
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={item.color.replace("bg-", "").replace("-500", "")}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`${item.color.replace("bg-", "stroke-")}`}
                style={{
                  strokeDasharray: `${(item.value / total) * 251.2} 251.2`,
                  strokeDashoffset: (-(cumulativePercentage - item.value) / total) * 251.2,
                }}
              />
            )
          })}
        </svg>

        {/* Centro do donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-800">{data[0].value}%</div>
          <div className="text-sm text-gray-500">Taxa de Aceitação</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`text-sm font-semibold ${item.textColor}`}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
