"use client"

export function AnalisesMelhoriaChart() {
  const data = [
    { label: "Respostas detalhadas", value: 35, color: "bg-blue-500" },
    { label: "Melhor contexto", value: 25, color: "bg-emerald-500" },
    { label: "Mais soluções", value: 20, color: "bg-amber-500" },
    { label: "Linguagem amigável", value: 15, color: "bg-purple-500" },
    { label: "Outros", value: 5, color: "bg-red-500" },
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="w-full h-[240px] p-4">
      {/* Gráfico de Pizza */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const circumference = 2 * Math.PI * 35 // raio = 35
            const strokeDasharray = (item.value / total) * circumference
            const strokeDashoffset = -(cumulativePercentage / total) * circumference

            cumulativePercentage += item.value

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                strokeWidth="20"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className={`${item.color.replace("bg-", "stroke-")}`}
              />
            )
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-gray-600 truncate">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
