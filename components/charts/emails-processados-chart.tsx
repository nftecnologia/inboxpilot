"use client"

interface EmailsProcessadosChartProps {
  periodo: "dia" | "semana" | "mes"
}

export function EmailsProcessadosChart({ periodo }: EmailsProcessadosChartProps) {
  // Dados simulados
  let labels: string[] = []
  let data: number[] = []

  if (periodo === "dia") {
    labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    data = [42, 58, 65, 49, 62, 38, 30]
  } else if (periodo === "semana") {
    labels = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"]
    data = [280, 310, 290, 340]
  } else {
    labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
    data = [1200, 1350, 1100, 1450, 1300, 1500]
  }

  const maxValue = Math.max(...data)

  return (
    <div className="w-full h-[280px] p-4">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((value, index) => {
          const height = (value / maxValue) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative flex flex-col items-center justify-end h-48 w-full">
                {/* Valor no topo */}
                <div className="text-xs font-semibold text-gray-700 mb-1">{value}</div>

                {/* Barra */}
                <div
                  className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-[#2A65F9] to-[#5D8BFA] shadow-lg relative"
                  style={{ height: `${height}%` }}
                >
                  {/* Brilho no topo */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-md"></div>
                </div>
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-gray-600 mt-2">{labels[index]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
