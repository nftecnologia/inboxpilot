import type React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  id: string
  title: string
  value: string
  icon: React.ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
}

export function StatCard({ id, title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card
      id={id}
      className="border border-[#E0E0E0]/60 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#2E2E2E]">{title}</CardTitle>
        <div className="h-9 w-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#2A65F9] shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[#2E2E2E] group-hover:text-[#0F172A] transition-colors duration-300">
          {value}
        </div>
        {description && (
          <CardDescription className="flex items-center mt-1">
            {trend === "up" && <ArrowUp className="h-3 w-3 text-[#27AE60] mr-1" />}
            {trend === "down" && <ArrowDown className="h-3 w-3 text-[#E74C3C] mr-1" />}
            <span className={trend === "up" ? "text-[#27AE60]" : trend === "down" ? "text-[#E74C3C]" : "text-gray-500"}>
              {description}
            </span>
          </CardDescription>
        )}
      </CardContent>
    </Card>
  )
}
