import { CheckCircle, XCircle } from "lucide-react"

interface StatusIndicatorProps {
  id: string
  title: string
  status: "online" | "offline"
}

export function StatusIndicator({ id, title, status }: StatusIndicatorProps) {
  return (
    <div
      id={id}
      className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-md border border-transparent hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow"
    >
      <span className="font-medium text-[#2E2E2E]">{title}</span>
      <div className="flex items-center">
        {status === "online" ? (
          <>
            <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-[#27AE60] mr-1.5" />
              <span className="text-[#27AE60] text-sm font-medium">Online</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center bg-red-50 px-2 py-1 rounded-full">
              <XCircle className="h-4 w-4 text-[#E74C3C] mr-1.5" />
              <span className="text-[#E74C3C] text-sm font-medium">Offline</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
