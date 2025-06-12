// Script para testar o sistema de mensagens
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMessages() {
  try {
    console.log('🔍 Testando sistema de mensagens...\n');

    // 1. Buscar sessão ativa
    console.log('1️⃣ Buscando sessão ativa...');
    const activeSession = await prisma.chatSession.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!activeSession) {
      console.log('❌ Nenhuma sessão ativa encontrada');
      console.log('💡 Acesse /atendimento e assuma um chat primeiro');
      return;
    }

    console.log(`✅ Sessão ativa: ${activeSession.id}`);
    console.log(`📊 Total de mensagens: ${activeSession.messages.length}`);
    
    // 2. Listar últimas mensagens
    console.log('\n2️⃣ Últimas mensagens:');
    activeSession.messages.forEach((msg, index) => {
      console.log(`\n[${index + 1}] ${msg.role}:`);
      console.log(`   "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`);
      console.log(`   Criada em: ${new Date(msg.createdAt).toLocaleString('pt-BR')}`);
    });

    // 3. Buscar todas as mensagens da sessão
    console.log('\n3️⃣ Buscando TODAS as mensagens da sessão...');
    const allMessages = await prisma.chatMessage.findMany({
      where: { sessionId: activeSession.id },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`✅ Total de mensagens no banco: ${allMessages.length}`);

    // 4. Verificar mensagens recentes (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMessages = allMessages.filter(msg => 
      new Date(msg.createdAt) > fiveMinutesAgo
    );

    console.log(`\n4️⃣ Mensagens dos últimos 5 minutos: ${recentMessages.length}`);
    
    if (recentMessages.length > 0) {
      console.log('📝 Mensagens recentes:');
      recentMessages.forEach((msg) => {
        const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR');
        console.log(`   [${time}] ${msg.role}: "${msg.content.substring(0, 60)}..."`);
      });
    }

    // 5. Testar criação de mensagem
    console.log('\n5️⃣ Testando criação de mensagem...');
    const testMessage = await prisma.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: 'SYSTEM',
        content: `[TESTE] Mensagem de teste criada em ${new Date().toLocaleTimeString('pt-BR')}`,
        metadata: {
          test: true,
          createdBy: 'test-script'
        }
      }
    });

    console.log(`✅ Mensagem de teste criada: ${testMessage.id}`);
    
    // 6. Verificar se a mensagem foi salva
    const verifyMessage = await prisma.chatMessage.findUnique({
      where: { id: testMessage.id }
    });

    if (verifyMessage) {
      console.log('✅ Mensagem verificada no banco de dados');
    } else {
      console.log('❌ ERRO: Mensagem não encontrada no banco!');
    }

    console.log('\n🔍 DIAGNÓSTICO:');
    console.log(`- Sessão ativa: ${activeSession.id}`);
    console.log(`- Total de mensagens: ${allMessages.length}`);
    console.log(`- Mensagens recentes: ${recentMessages.length}`);
    console.log(`- WebSocket necessário para atualização em tempo real`);
    
    console.log('\n💡 DICAS:');
    console.log('1. Se as mensagens não aparecem, verifique o console do navegador');
    console.log('2. Certifique-se de que o servidor está rodando');
    console.log('3. Verifique se o WebSocket está conectado');
    console.log('4. Tente recarregar a página (F5)');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMessages();
