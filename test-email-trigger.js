const fetch = require('node-fetch');

async function testEmailCreation() {
  console.log('🚀 Testando criação de email com Trigger.dev...\n');
  
  try {
    const response = await fetch('http://localhost:3003/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Temporariamente sem autenticação para teste
      },
      body: JSON.stringify({
        from: 'cliente@exemplo.com',
        to: 'suporte@empresa.com',
        subject: 'Teste Trigger.dev - ' + new Date().toLocaleString('pt-BR'),
        content: 'Este é um email de teste para verificar se o processamento com Trigger.dev está funcionando!',
        priority: 'high',
        category: 'teste'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email criado com sucesso!');
      console.log('📧 ID do Email:', result.data?.id);
      console.log('🔄 Processamento automático:', result.processing ? 'ATIVADO' : 'DESATIVADO');
      console.log('\n📊 Dados completos:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.processing) {
        console.log('\n⏳ O email foi enviado para processamento assíncrono via Trigger.dev!');
        console.log('👀 Verifique o dashboard em: https://app.trigger.dev/project/proj_ytqxzwzfpxfddtmhmzyy');
      }
    } else {
      console.log('❌ Erro ao criar email:', response.status);
      console.log('Resposta:', result);
    }
  } catch (error) {
    console.error('🔥 Erro na requisição:', error.message);
  }
}

// Executar teste
testEmailCreation();
