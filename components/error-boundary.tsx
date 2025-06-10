"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{error: Error; retry: () => void}>
  onError?: (error: Error, errorInfo: any) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("🚨 Error Boundary caught an error:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.props.onError?.(error, errorInfo)
    
    // Log structured error
    this.logError(error, errorInfo)
  }

  logError = (error: Error, errorInfo: any) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      userId: 'unknown' // This could be populated from context
    }

    console.error("📊 Structured Error Log:", JSON.stringify(errorData, null, 2))
    
    // In production, send to monitoring service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorData })
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro na aplicação</AlertTitle>
            <AlertDescription>
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </AlertDescription>
          </Alert>

          {isDevelopment && (
            <div className="bg-gray-100 p-3 rounded-md">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Detalhes do erro (dev):</h4>
              <code className="text-xs text-red-600 break-all">
                {error.message}
              </code>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Recarregar página
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Se o problema persistir, entre em contato com o suporte.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para uso em componentes funcionais
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error("🚨 Error caught by hook:", error, errorInfo)
    
    // Log structured error
    const errorData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    console.error("📊 Structured Error Log:", JSON.stringify(errorData, null, 2))
  }
}

// Error Boundary específico para componentes async
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Falha ao carregar os dados. Tente novamente.</span>
            <Button size="sm" onClick={retry} variant="outline">
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
