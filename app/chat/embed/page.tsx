"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"

function ChatEmbedContent() {
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<any>({})
  
  useEffect(() => {
    // Obter configurações da URL
    const appId = searchParams.get("appId")
    const configParam = searchParams.get("config")
    
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam))
        setConfig(parsedConfig)
      } catch (e) {
        console.error("Erro ao parsear configurações:", e)
      }
    }
    
    // Listener para receber configurações do parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "KIRVANO_CONFIG") {
        setConfig(event.data.config)
      }
      
      if (event.data.type === "KIRVANO_SEND_MESSAGE") {
        // Implementar envio de mensagem programático
        // TODO: Adicionar método para enviar mensagem automaticamente
      }
    }
    
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [searchParams])
  
  // Função para comunicar com o parent
  const sendToParent = (type: string, data: any) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type, ...data }, "*")
    }
  }
  
  // Customizar o widget para funcionar em modo embed
  const handleClose = () => {
    sendToParent("KIRVANO_CLOSE", {})
  }
  
  const handleMessage = (message: any) => {
    sendToParent("KIRVANO_MESSAGE", { message })
  }
  
  return (
    <div className="h-screen bg-transparent">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
        }
        
        /* Ocultar o botão flutuante no modo embed */
        #kirvano-chat-container > button {
          display: none !important;
        }
        
        /* Fazer o card ocupar toda a tela */
        #kirvano-chat-container {
          position: static !important;
        }
        
        #kirvano-chat-container > div {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
      `}</style>
      
      <ChatWidget
        position="bottom-right"
        primaryColor={config.primaryColor}
        title={config.title}
        subtitle={config.subtitle}
        placeholder={config.placeholder}
      />
      
      {/* Script para interceptar o fechamento */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Interceptar cliques no botão de fechar
            document.addEventListener('click', function(e) {
              if (e.target.closest('button') && e.target.closest('button').querySelector('svg')) {
                const svg = e.target.closest('button').querySelector('svg');
                if (svg && svg.innerHTML.includes('M19')) { // Ícone X
                  e.preventDefault();
                  window.parent.postMessage({ type: 'KIRVANO_CLOSE' }, '*');
                }
              }
            });
          `
        }}
      />
    </div>
  )
}

export default function ChatEmbedPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Carregando...</div>}>
      <ChatEmbedContent />
    </Suspense>
  )
}
