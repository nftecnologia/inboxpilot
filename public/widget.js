(function() {
  'use strict';
  
  // Configurações padrão
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#2A65F9',
    title: 'Suporte Kirvano',
    subtitle: 'Como podemos ajudar?',
    language: 'pt-BR'
  };
  
  // Mesclar configurações do usuário com as padrões
  const config = Object.assign({}, defaultConfig, window.KirvanoChat || {});
  
  // Verificar se appId foi fornecido
  if (!config.appId) {
    console.error('KirvanoChat: appId é obrigatório');
    return;
  }
  
  // Criar container do widget
  const container = document.createElement('div');
  container.id = 'kirvano-chat-container';
  container.style.cssText = `
    position: fixed;
    ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
    ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
    z-index: 99999;
  `;
  
  // Injetar estilos básicos
  const style = document.createElement('style');
  style.textContent = `
    #kirvano-chat-container * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    #kirvano-chat-iframe {
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      transition: all 0.3s ease;
      background: white;
    }
    
    #kirvano-chat-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    
    #kirvano-chat-bubble:hover {
      transform: scale(1.1);
    }
    
    #kirvano-chat-bubble svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
  `;
  document.head.appendChild(style);
  
  // Estado do widget
  let isOpen = false;
  let iframe = null;
  
  // Criar botão flutuante
  const bubble = document.createElement('button');
  bubble.id = 'kirvano-chat-bubble';
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.51 15.55 3.39 17L2 22L7.01 20.61C8.35 21.41 9.91 21.88 11.58 21.97C11.72 21.99 11.86 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 16.5C16.5 16.5 14.47 14.47 14.47 14.47C13.47 14.97 12.31 15.16 11.18 14.97C10.05 14.78 9.03 14.23 8.25 13.41C7.47 12.59 6.98 11.54 6.85 10.41C6.72 9.28 6.96 8.14 7.53 7.16L5.5 5.5C5.5 5.5 7.53 7.53 7.53 7.53C8.16 7 8.95 6.69 9.77 6.64C10.59 6.59 11.41 6.81 12.11 7.26C12.81 7.71 13.35 8.36 13.67 9.13C13.99 9.9 14.07 10.75 13.9 11.57C13.73 12.39 13.32 13.14 12.73 13.73C12.14 14.32 11.39 14.73 10.57 14.9C9.75 15.07 8.9 14.99 8.13 14.67C7.36 14.35 6.71 13.81 6.26 13.11C5.81 12.41 5.59 11.59 5.64 10.77C5.69 9.95 6 9.16 6.53 8.53L4.5 6.5C4.5 6.5 6.53 8.53 6.53 8.53" fill="white"/>
    </svg>
  `;
  
  // Função para criar o iframe
  function createIframe() {
    iframe = document.createElement('iframe');
    iframe.id = 'kirvano-chat-iframe';
    iframe.src = `${window.location.protocol}//${window.location.host}/chat/embed?appId=${config.appId}&config=${encodeURIComponent(JSON.stringify(config))}`;
    iframe.style.cssText = `
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      display: ${isOpen ? 'block' : 'none'};
    `;
    
    // Comunicação entre iframe e página pai
    iframe.onload = function() {
      // Enviar configurações para o iframe
      iframe.contentWindow.postMessage({
        type: 'KIRVANO_CONFIG',
        config: config
      }, '*');
    };
    
    container.appendChild(iframe);
  }
  
  // Toggle do chat
  bubble.onclick = function() {
    isOpen = !isOpen;
    
    if (!iframe) {
      createIframe();
    }
    
    bubble.style.display = isOpen ? 'none' : 'flex';
    if (iframe) {
      iframe.style.display = isOpen ? 'block' : 'none';
    }
    
    // Callback
    if (config.onOpen && isOpen) {
      config.onOpen();
    } else if (config.onClose && !isOpen) {
      config.onClose();
    }
  };
  
  // Adicionar elementos ao DOM
  container.appendChild(bubble);
  document.body.appendChild(container);
  
  // Listener para mensagens do iframe
  window.addEventListener('message', function(event) {
    // Verificar origem
    if (event.origin !== window.location.origin) return;
    
    const data = event.data;
    
    switch (data.type) {
      case 'KIRVANO_CLOSE':
        isOpen = false;
        bubble.style.display = 'flex';
        if (iframe) iframe.style.display = 'none';
        if (config.onClose) config.onClose();
        break;
        
      case 'KIRVANO_MESSAGE':
        if (config.onMessage) config.onMessage(data.message);
        break;
        
      case 'KIRVANO_RESIZE':
        if (iframe && data.height) {
          iframe.style.height = data.height + 'px';
        }
        break;
    }
  });
  
  // Callback de carregamento
  if (config.onLoad) {
    config.onLoad();
  }
  
  // Expor API global
  window.KirvanoChatAPI = {
    open: function() {
      if (!isOpen) bubble.click();
    },
    close: function() {
      if (isOpen) bubble.click();
    },
    sendMessage: function(message) {
      if (iframe) {
        iframe.contentWindow.postMessage({
          type: 'KIRVANO_SEND_MESSAGE',
          message: message
        }, '*');
      }
    }
  };
})();
