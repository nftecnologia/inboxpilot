import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "recebidos":
        return {
          label: "Recebido",
          color: "bg-gradient-to-r from-[#2A65F9] to-[#4A7FFF] text-white shadow-sm shadow-blue-200",
        }
      case "respondidos":
        return {
          label: "Respondido",
          color: "bg-gradient-to-r from-[#F4C145] to-[#F7D06C] text-white shadow-sm shadow-amber-200",
        }
      case "aguardando":
        return {
          label: "Aguardando",
          color: "bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white shadow-sm shadow-orange-200",
        }
      case "resolvidos":
        return {
          label: "Resolvido",
          color: "bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white shadow-sm shadow-green-200",
        }
      case "pendentes":
        return {
          label: "Pendente",
          color: "bg-gradient-to-r from-[#E74C3C] to-[#F16354] text-white shadow-sm shadow-red-200",
        }
      case "arquivados":
        return {
          label: "Arquivado",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm shadow-gray-200",
        }
      default:
        return {
          label: "Desconhecido",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm shadow-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)

  return <Badge className={`${config.color} text-xs px-2.5 py-1 font-medium rounded-full`}>{config.label}</Badge>
}
