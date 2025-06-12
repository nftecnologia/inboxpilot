# Guia de Integração do Widget Kirvano Chat

## 🚀 Início Rápido

### 1. Código de Integração Básico

Cole este código em qualquer página HTML onde deseja o chat:

```html
<script>
  window.KirvanoChat = {
    appId: 'SEU_APP_ID_AQUI'
  };
  (function(){var w=window;var d=document;var s=d.createElement('script');
  s.src='https://seudominio.com/widget.js';s.async=true;
  d.head.appendChild(s);})();
</script>
```

## 📋 Configurações Disponíveis

```javascript
window.KirvanoChat = {
  // Obrigatório
  appId: 'SEU_APP_ID',
  
  // Opcional - Aparência
  primaryColor: '#2A65F9',     // Cor principal do chat
  position: 'bottom-right',    // bottom-right, bottom-left, top-right, top-left
  title: 'Suporte',           // Título do chat
  subtitle: 'Como podemos ajudar?', // Subtítulo
  
  // Opcional - Dados do usuário (pré-preenche o formulário)
  user: {
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999'
  },
  
  // Opcional - Callbacks
  onLoad: function() {
    console.log('Chat carregado!');
  },
  onOpen: function() {
    console.log('Chat aberto!');
  },
  onClose: function() {
    console.log('Chat fechado!');
  },
  onMessage: function(message) {
    console.log('Nova mensagem:', message);
  }
};
</script>
```

## 🎨 Exemplos de Uso

### Exemplo 1: Integração Simples

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meu Site</title>
</head>
<body>
  <h1>Bem-vindo ao meu site!</h1>
  
  <!-- Widget Kirvano Chat -->
  <script>
    window.KirvanoChat = {
      appId: 'abc123'
    };
    (function(){var w=window;var d=document;var s=d.createElement('script');
    s.src='https://seudominio.com/widget.js';s.async=true;
    d.head.appendChild(s);})();
  </script>
</body>
</html>
```

### Exemplo 2: Com Configurações Personalizadas

```html
<script>
  window.KirvanoChat = {
    appId: 'abc123',
    primaryColor: '#FF5722',
    position: 'bottom-left',
    title: 'Fale Conosco',
    subtitle: 'Resposta em menos de 5 minutos!',
    
    onOpen: function() {
      // Rastrear evento no Google Analytics
      gtag('event', 'chat_opened', {
        'event_category': 'engagement'
      });
    }
  };
  
  (function(){var w=window;var d=document;var s=d.createElement('script');
  s.src='https://seudominio.com/widget.js';s.async=true;
  d.head.appendChild(s);})();
</script>
```

### Exemplo 3: Com Dados do Usuário Logado

```html
<script>
  // Se você tem um usuário logado no seu site
  window.KirvanoChat = {
    appId: 'abc123',
    
    // Pré-preencher com dados do usuário
    user: {
      name: '<?php echo $user->name; ?>',
      email: '<?php echo $user->email; ?>',
      phone: '<?php echo $user->phone; ?>'
    }
  };
  
  (function(){var w=window;var d=document;var s=d.createElement('script');
  s.src='https://seudominio.com/widget.js';s.async=true;
  d.head.appendChild(s);})();
</script>
```

## 🛠️ API JavaScript

Após o carregamento, você pode controlar o widget programaticamente:

```javascript
// Abrir o chat
window.KirvanoChatAPI.open();

// Fechar o chat
window.KirvanoChatAPI.close();

// Enviar mensagem programaticamente
window.KirvanoChatAPI.sendMessage('Olá, preciso de ajuda!');
```

### Exemplo: Abrir chat após 30 segundos

```javascript
setTimeout(function() {
  if (window.KirvanoChatAPI) {
    window.KirvanoChatAPI.open();
  }
}, 30000);
```

### Exemplo: Abrir chat ao clicar em botão

```html
<button onclick="window.KirvanoChatAPI.open()">
  Precisa de ajuda?
</button>
```

## 🔒 Segurança

### CORS e Domínios Autorizados

Por segurança, configure os domínios autorizados no painel de administração:

1. Acesse Configurações → Chat → Domínios
2. Adicione os domínios onde o widget será usado
3. Exemplo: `https://example.com`, `https://app.example.com`

### Content Security Policy (CSP)

Se seu site usa CSP, adicione estas diretivas:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://seudominio.com;
  frame-src 'self' https://seudominio.com;
  connect-src 'self' https://seudominio.com wss://seudominio.com;
">
```

## 📊 Integração com Analytics

### Google Analytics 4

```javascript
window.KirvanoChat = {
  appId: 'abc123',
  
  onOpen: () => {
    gtag('event', 'chat_interaction', {
      'action': 'open'
    });
  },
  
  onMessage: (message) => {
    gtag('event', 'chat_interaction', {
      'action': 'message_sent',
      'label': message.substring(0, 50)
    });
  }
};
```

### Google Tag Manager

```javascript
window.KirvanoChat = {
  appId: 'abc123',
  
  onOpen: () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'kirvano_chat_open'
    });
  }
};
```

## 🎯 Casos de Uso

### 1. E-commerce
```javascript
// Abrir chat quando usuário adiciona item ao carrinho
function addToCart(product) {
  // ... lógica do carrinho
  
  // Abrir chat com mensagem personalizada
  window.KirvanoChatAPI.open();
  window.KirvanoChatAPI.sendMessage(
    `Olá! Vi que você adicionou ${product.name} ao carrinho. Posso ajudar?`
  );
}
```

### 2. SaaS
```javascript
// Detectar quando usuário está com dificuldade
let errorCount = 0;

window.addEventListener('error', function() {
  errorCount++;
  if (errorCount >= 3) {
    window.KirvanoChatAPI.open();
  }
});
```

### 3. Landing Page
```javascript
// Abrir chat quando usuário rola até o final
window.addEventListener('scroll', function() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    window.KirvanoChatAPI.open();
  }
});
```

## 🔧 Solução de Problemas

### Chat não aparece

1. Verifique se o `appId` está correto
2. Verifique o console do navegador por erros
3. Confirme que o domínio está autorizado
4. Teste com `window.KirvanoChat` no console

### Conflitos de CSS

Se o chat conflita com seu CSS, adicione:

```css
#kirvano-chat-container {
  /* Força z-index alto */
  z-index: 2147483647 !important;
}
```

### Performance

Para melhor performance, carregue o widget após o carregamento da página:

```javascript
window.addEventListener('load', function() {
  window.KirvanoChat = { appId: 'abc123' };
  var s = document.createElement('script');
  s.src = 'https://seudominio.com/widget.js';
  s.async = true;
  document.head.appendChild(s);
});
```

## 📱 Mobile

O widget é totalmente responsivo e funciona em dispositivos móveis. Em telas pequenas:

- O chat ocupa largura total
- Altura ajustada para teclado virtual
- Touch-friendly

## 🌐 Internacionalização

```javascript
window.KirvanoChat = {
  appId: 'abc123',
  language: 'en-US', // pt-BR, en-US, es-ES
  
  // Ou textos customizados
  title: 'Support',
  subtitle: 'How can we help?',
  placeholder: 'Type your message...'
};
```

## 🚀 Deploy em Produção

1. Use a versão minificada: `widget.min.js`
2. Configure CDN para melhor performance
3. Habilite cache com headers apropriados
4. Monitore uso via dashboard

## 📞 Suporte

- Documentação: https://docs.kirvano.com/widget
- Email: suporte@kirvano.com
- Chat: Use nosso próprio widget! 😊
