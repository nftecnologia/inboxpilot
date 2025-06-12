const fetch = require('node-fetch');

async function testChatDebug() {
  console.log('🔍 Debug do Chat AI...\n');

  // 1. Criar sessão de chat
  console.log('1️⃣ Criando sessão de chat...');
  
  try {
    const createSessionResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'Teste Debug',
        userEmail: 'debug@teste.com',
        userPhone: '11999999999',
        source: 'widget'
      })
    });

    if (!createSessionResponse.ok) {
      const error = await createSessionResponse.text();
      console.error('❌ Erro ao criar sessão:', error);
      return;
    }

    const { session, welcomeMessage } = await createSessionResponse.json();
    console.log('✅ Sessão criada:', session.id);
    console.log('📩 Mensagem de boas-vindas:', welcomeMessage.content);

    // 2. Enviar uma pergunta simples
    console.log('\n2️⃣ Enviando pergunta ao chat...');
    const pergunta = "Olá, como posso criar uma conta?";
    console.log('❓ Pergunta:', pergunta);

    const sendMessageResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        content: pergunta
      })
    });

    if (!sendMessageResponse.ok) {
      const error = await sendMessageResponse.text();
      console.error('❌ Erro ao enviar mensagem:', error);
      return;
    }

    const response = await sendMessageResponse.json();
    
    console.log('\n3️⃣ Resposta recebida:');
    console.log('━'.repeat(50));
    console.log('📝 Conteúdo:', response.message.content);
    console.log('━'.repeat(50));
    console.log('🎯 Confiança:', response.message.confidence || 'N/A');
    console.log('💡 Perguntas sugeridas:', response.suggestedQuestions || []);
    console.log('⚠️  Escalar para humano?', response.shouldEscalate || false);
    
    // 3. Verificar se a resposta está vazia ou genérica
    if (!response.message.content || response.message.content.trim() === '') {
      console.error('\n❌ PROBLEMA: Resposta vazia!');
    } else if (response.message.content.includes('RESPOSTA:')) {
      console.error('\n❌ PROBLEMA: Parser não funcionou - resposta contém marcadores!');
    } else {
      console.log('\n✅ Resposta parece OK!');
    }

    // 4. Testar outra pergunta
    console.log('\n4️⃣ Testando segunda pergunta...');
    const pergunta2 = "Quais serviços vocês oferecem?";
    console.log('❓ Pergunta:', pergunta2);

    const sendMessage2Response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id,
        content: pergunta2
      })
    });

    if (sendMessage2Response.ok) {
      const response2 = await sendMessage2Response.json();
      console.log('\n📝 Resposta 2:', response2.message.content.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }

  console.log('\n🔚 Debug concluído!');
  console.log('\n💡 DICAS:');
  console.log('   1. Verifique os logs do servidor para ver o que a IA está retornando');
  console.log('   2. Confirme que OPENAI_API_KEY está configurada');
  console.log('   3. Verifique se há documentos na base de conhecimento');
  console.log('   4. Reinicie o servidor se necessário');
}

// Executar teste
testChatDebug().catch(console.error);
