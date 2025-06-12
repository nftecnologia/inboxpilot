import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

async function testMarkdownAPI() {
  console.log('🔍 Testando API de processamento de Markdown...\n');
  
  // 1. Fazer login primeiro
  console.log('1️⃣ Fazendo login...');
  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: '', // Ignorar CSRF para teste
      }),
    });

    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('✅ Login realizado\n');

    // 2. Criar um arquivo Markdown de teste
    const testContent = `# Como resetar minha senha

Este documento explica como resetar sua senha na plataforma.

## Passos:

1. Acesse a página de login
2. Clique em "Esqueci minha senha"
3. Digite seu email cadastrado
4. Verifique seu email
5. Clique no link de redefinição
6. Crie uma nova senha

## Requisitos da senha:
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos um número

Em caso de problemas, entre em contato com o suporte.`;

    fs.writeFileSync('test-password-reset.md', testContent);
    console.log('2️⃣ Arquivo de teste criado: test-password-reset.md\n');

    // 3. Testar processamento
    console.log('3️⃣ Enviando arquivo para processamento...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('test-password-reset.md'));

    const response = await fetch('http://localhost:3000/api/knowledge/process-markdown', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Cookie': cookies ? cookies.join('; ') : '',
      },
      body: form
    });

    console.log(`📥 Status da resposta: ${response.status}`);
    
    const result = await response.text();
    console.log('📄 Resposta completa:', result);
    
    if (response.ok) {
      const data = JSON.parse(result);
      console.log('\n✅ Processamento bem-sucedido!');
      console.log('📋 Título:', data.title);
      console.log('📁 Categoria:', data.category);
      console.log('📝 Conteúdo:', data.content.substring(0, 100) + '...');
    } else {
      console.log('\n❌ Erro no processamento');
    }

    // Limpar arquivo de teste
    fs.unlinkSync('test-password-reset.md');
    console.log('\n🧹 Arquivo de teste removido');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
  }
}

// Executar teste
testMarkdownAPI();
