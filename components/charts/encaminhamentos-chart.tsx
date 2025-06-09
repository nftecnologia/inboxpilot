"use client"

export function EncaminhamentosChart() {
  const data = [
    { label: "Seg", value: 8 },
    { label: "Ter", value: 12 },
    { label: "Qua", value: 7 },
    { label: "Qui", value: 9 },
    { label: "Sex", value: 15 },
    { label: "Sáb", value: 5 },
    { label: "Dom", value: 3 },
  ]

  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="w-full h-[240px] p-4">
      <div className="relative h-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-t border-gray-200 w-full"></div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          {[
            Math.round(maxValue),
            Math.round(maxValue * 0.75),
            Math.round(maxValue * 0.5),
            Math.round(maxValue * 0.25),
            0,
          ].map((value, index) => (
            <span key={index}>{value}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="relative h-full pt-4 pb-8">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Area under curve */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <path
              d={`M 0 200 ${data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 400
                  const y = 200 - (item.value / maxValue) * 180
                  return `L ${x} ${y}`
                })
                .join(" ")} L 400 200 Z`}
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d={`M ${data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 400
                  const y = 200 - (item.value / maxValue) * 180
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}`}
              fill="none"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400
              const y = 200 - (item.value / maxValue) * 180
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="6" fill="white" stroke="#EF4444" strokeWidth="3" />
                  <circle cx={x} cy={y} r="3" fill="#EF4444" />
                </g>
              )
            })}
          </svg>

          {/* Value labels */}
          <div className="absolute inset-0 flex justify-between items-start pt-2">
            {data.map((item, index) => {
              const y = (item.value / maxValue) * 100
              return (
                <div key={index} className="flex flex-col items-center" style={{ marginTop: `${100 - y - 15}%` }}>
                  <span className="text-xs font-semibold text-gray-700 bg-white px-1 rounded shadow-sm">
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
