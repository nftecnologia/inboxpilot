"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Mail,
  BookOpen,
  BarChart2,
  ChevronRight,
  Menu,
  X,
  Settings,
  CheckCheck,
  AlertCircle,
  Clock,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RealTimeNotifications } from "@/components/real-time-notifications"
import { useState, useEffect } from "react"

interface AppLayoutProps {
  children: ReactNode
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "warning" | "success"
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Nova integração disponível",
      message: "A integração com Microsoft Teams está disponível",
      time: "há 5 min",
      read: false,
      type: "info",
    },
    {
      id: 2,
      title: "Alerta de desempenho",
      message: "Taxa de resposta automática caiu para 65%",
      time: "há 15 min",
      read: false,
      type: "warning",
    },
    {
      id: 3,
      title: "Meta atingida",
      message: "Satisfação do cliente atingiu 4.8/5 este mês",
      time: "há 1 hora",
      read: true,
      type: "success",
    },
  ])

  useEffect(() => {
    setIsMounted(true)

    // Fechar sidebar ao redimensionar para desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevenir scroll quando sidebar estiver aberta em mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }

    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [sidebarOpen])

  const isActive = (path: string) => {
    return pathname === path
  }

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "E-mails",
      path: "/emails",
      icon: Mail,
      // badge removido - será dinâmico no futuro
    },
    {
      name: "Tickets CRM",
      path: "/tickets",
      icon: CheckCheck,
      // badge removido - será dinâmico no futuro
    },
    {
      name: "Base de Conhecimento",
      path: "/base-conhecimento",
      icon: BookOpen,
    },
    {
      name: "Analytics de IA",
      path: "/ia",
      icon: Brain,
    },
    {
      name: "Relatórios",
      path: "/relatorios",
      icon: BarChart2,
    },
    {
      name: "Configurações",
      path: "/configuracoes",
      icon: Settings,
    },
  ]

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A65F9]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] pattern-dots">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixo sem espaçamentos */}
      <div
        className={`
        w-64 bg-white border-r border-[#E0E0E0] flex-shrink-0 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed lg:static h-full z-50 lg:z-auto
      `}
      >
        {/* Logo e controles mobile */}
        <div className="py-6 px-4 border-b border-[#E0E0E0] flex items-center justify-between">
          <Link href="/dashboard" className="transition-transform hover:scale-105 duration-200">
            <img src="/inboxpilot-logo.png" alt="InboxPilot Logo" className="h-8" />
          </Link>
          <div className="flex items-center space-x-2">
            {/* Notificações na sidebar para mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-[#2A65F9]/10 hover:text-[#2A65F9] transition-colors h-8 w-8"
                >
                  <Bell className="h-4 w-4 text-[#2A65F9]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 bg-gradient-to-r from-[#2A65F9] to-[#1D4ED8] rounded-full flex items-center justify-center text-[8px] text-white font-medium shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-sm">Notificações</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#2A65F9] hover:text-[#2A65F9]/80 h-7 px-2"
                    onClick={markAllAsRead}
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`px-4 py-2 focus:bg-gray-50 rounded-md mx-1 my-0.5 cursor-pointer transition-all duration-200 ${notification.read ? "opacity-70" : "bg-blue-50/50"}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === "info" && <Bell className="h-4 w-4 text-[#2A65F9]" />}
                            {notification.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                            {notification.type === "success" && <CheckCheck className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-xs font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400 ml-1">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">Não há notificações</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 text-center">
                  <Link href="/notificacoes" className="text-xs text-[#2A65F9] hover:underline">
                    Ver todas as notificações
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-500 hover:text-[#2A65F9] hover:bg-blue-50 h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu de navegação */}
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MENU PRINCIPAL</p>
          </div>
          <nav className="mt-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-1.5 mx-2 rounded-md transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-[#2A65F9]/10 to-[#2A65F9]/20 text-[#2A65F9] font-medium"
                        : "text-gray-700 hover:bg-[#F3F4F6]"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`h-4 w-4 mr-2 ${isActive(item.path) ? "text-[#2A65F9]" : "text-gray-500"}`} />
                    <span className="text-sm">{item.name}</span>
                    {isActive(item.path) && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Perfil do usuário */}
        <div className="border-t border-[#E0E0E0] p-3">
          <div className="flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-[#F3F4F6] transition-colors cursor-pointer">
            <Avatar className="h-7 w-7 ring-2 ring-[#2A65F9]/20 ring-offset-2 ring-offset-white">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-r from-[#2A65F9] to-[#1D4ED8] text-white">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2E2E2E] truncate">Usuário</p>
              <p className="text-[10px] text-gray-500 truncate">usuario@empresa.com</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-[#2A65F9] hover:bg-blue-50"
              onClick={() => {
                // Função de logout aqui
                console.log("Logout executado")
                // Redirecionar para página de login
                window.location.href = "/login"
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - Sem espaçamentos e ocupando todo espaço restante */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-5">
        {/* Botão mobile menu - fixo no canto superior esquerdo */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md hover:bg-[#2A65F9]/10 hover:text-[#2A65F9] h-10 w-10"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page content - Ocupa toda a tela sem padding */}
        <main className="flex-1 h-full w-full overflow-auto bg-[#F9FAFB] px-4 py-4 sm:px-6 sm:py-5">{children}</main>
      </div>
    </div>
  )
}
