"use client"

export function AssuntosFrequentesChart() {
  const data = [
    { label: "Suporte Técnico", value: 35, color: "bg-blue-500" },
    { label: "Reembolso", value: 25, color: "bg-emerald-500" },
    { label: "Informações", value: 20, color: "bg-amber-500" },
    { label: "Reclamações", value: 15, color: "bg-red-500" },
    { label: "Outros", value: 5, color: "bg-purple-500" },
  ]

  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="w-full h-[240px] p-4">
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            {/* Barra */}
            <div className="flex-1 relative">
              <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full shadow-sm transition-all duration-500 ease-out relative`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  {/* Brilho na barra */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 rounded-full"></div>
                </div>
              </div>

              {/* Valor na barra */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-white text-sm font-semibold">{item.value}%</span>
              </div>
            </div>

            {/* Label */}
            <div className="w-32 text-right">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
