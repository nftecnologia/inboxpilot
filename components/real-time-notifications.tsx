"use client"

import { useEffect, useState } from "react"
import { Bell, X, Zap, Brain, Mail, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeNotifications } from "@/hooks/useSocket"
import { cn } from "@/lib/utils"

export function RealTimeNotifications() {
  const { notifications, removeNotification, clearNotifications, isConnected } = useRealTimeNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)

  // Show notification panel when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0 && !isVisible) {
      setHasNewNotification(true)
      // Auto-show for 3 seconds then hide
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications.length, isVisible])

  // Clear "new notification" indicator when user opens panel
  useEffect(() => {
    if (isVisible) {
      setHasNewNotification(false)
    }
  }, [isVisible])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new-email":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "ai-processed":
        return <Brain className="h-4 w-4 text-purple-500" />
      case "auto-response":
        return <Zap className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new-email":
        return "border-l-blue-500 bg-blue-50"
      case "ai-processed":
        return "border-l-purple-500 bg-purple-50"
      case "auto-response":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
    setHasNewNotification(false)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status & Notification Button */}
      <div className="flex items-center gap-2 mb-2">
        {/* Connection Indicator */}
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
          isConnected 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        )}>
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline
            </>
          )}
        </div>

        {/* Notification Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleVisibility}
          className={cn(
            "relative transition-all duration-200",
            hasNewNotification && "ring-2 ring-blue-500 ring-opacity-50 animate-pulse"
          )}
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-hidden shadow-lg border border-gray-200 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-sm">Notificações em Tempo Real</h3>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-xs h-6 px-2"
                >
                  Limpar
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-md border-l-4 transition-all duration-200 hover:shadow-sm",
                      getNotificationColor(notification.type)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {notification.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Nenhuma notificação recente</p>
                <p className="text-xs text-gray-400 mt-1">
                  Você receberá atualizações em tempo real aqui
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="border-t border-gray-100 p-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Status: {isConnected ? "Conectado" : "Desconectado"}</span>
              <span>{notifications.length} notificações</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
