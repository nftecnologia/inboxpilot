"use client"

import { Loader2, Brain, Mail, Database, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-blue-600",
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingStateProps {
  type?: "page" | "component" | "inline"
  message?: string
  children?: React.ReactNode
}

export function LoadingState({ type = "component", message, children }: LoadingStateProps) {
  if (type === "page") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {message || "Carregando..."}
          </h2>
          <p className="text-sm text-gray-500">
            Aguarde enquanto preparamos tudo para você
          </p>
          {children}
        </div>
      </div>
    )
  }

  if (type === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <LoadingSpinner size="sm" />
        <span>{message || "Carregando..."}</span>
      </div>
    )
  }

  // Component loading
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <LoadingSpinner size="md" className="mb-3" />
      <p className="text-sm text-gray-600">
        {message || "Carregando dados..."}
      </p>
      {children}
    </div>
  )
}

interface SmartLoadingProps {
  context: "dashboard" | "emails" | "ai" | "knowledge" | "analytics"
  message?: string
}

export function SmartLoading({ context, message }: SmartLoadingProps) {
  const contextConfig = {
    dashboard: {
      icon: Database,
      color: "text-blue-600",
      defaultMessage: "Carregando dashboard...",
      details: "Buscando métricas e estatísticas"
    },
    emails: {
      icon: Mail,
      color: "text-green-600", 
      defaultMessage: "Carregando emails...",
      details: "Sincronizando sua caixa de entrada"
    },
    ai: {
      icon: Brain,
      color: "text-purple-600",
      defaultMessage: "Processando com IA...",
      details: "Analisando conteúdo inteligentemente"
    },
    knowledge: {
      icon: Database,
      color: "text-orange-600",
      defaultMessage: "Carregando base de conhecimento...",
      details: "Acessando informações relevantes"
    },
    analytics: {
      icon: Zap,
      color: "text-indigo-600",
      defaultMessage: "Gerando analytics...",
      details: "Calculando insights e tendências"
    }
  }

  const config = contextConfig[context]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-4">
        <Icon className={cn("h-12 w-12", config.color, "animate-pulse")} />
        <div className="absolute -bottom-1 -right-1">
          <LoadingSpinner size="sm" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message || config.defaultMessage}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {config.details}
      </p>
      <div className="w-48 bg-gray-200 rounded-full h-1">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: "text" | "rectangular" | "circular"
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height,
  lines = 1 
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-200 rounded",
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            style={{
              width: i === lines - 1 ? "75%" : width,
              height: height || "1rem"
            }}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    text: "h-4 bg-gray-200 rounded",
    rectangular: "bg-gray-200 rounded",
    circular: "bg-gray-200 rounded-full"
  }

  return (
    <div
      className={cn(
        "animate-pulse",
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// Skeleton específicos para diferentes seções
export function EmailListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" height="1rem" />
              <Skeleton variant="text" width="40%" height="0.875rem" />
            </div>
            <Skeleton variant="rectangular" width={60} height={24} />
          </div>
          <Skeleton variant="text" lines={2} />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Skeleton variant="text" width="400px" height="1rem" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="100px" height="1rem" />
              <Skeleton variant="circular" width={24} height={24} />
            </div>
            <Skeleton variant="text" width="60px" height="2rem" />
            <Skeleton variant="text" width="80px" height="0.875rem" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <Skeleton variant="text" width="150px" height="1.25rem" />
            <Skeleton variant="rectangular" width="100%" height="300px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function KnowledgeBaseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="200px" height="2rem" />
        <Skeleton variant="rectangular" width="120px" height="40px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="rectangular" width={60} height={20} />
              <Skeleton variant="circular" width={6} height={6} />
            </div>
            <Skeleton variant="text" width="100%" height="1.25rem" />
            <Skeleton variant="text" lines={3} />
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width="80px" height="0.875rem" />
              <Skeleton variant="rectangular" width={60} height={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
