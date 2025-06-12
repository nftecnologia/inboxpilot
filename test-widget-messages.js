// Script para testar mensagens no widget
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWidgetMessages() {
  try {
    console.log('🔍 Testando sincronização Widget x Atendimento...\n');

    // 1. Buscar sessão escalada mais recente
    console.log('1️⃣ Buscando sessão escalada ou ativa...');
    const session = await prisma.chatSession.findFirst({
      where: {
        OR: [
          { status: 'ESCALATED' },
          { status: 'ACTIVE' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!session) {
      console.log('❌ Nenhuma sessão encontrada');
      console.log('💡 Execute create-escalated-session.js primeiro');
      return;
    }

    console.log(`✅ Sessão encontrada: ${session.id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Cliente: ${session.userName || session.userEmail}`);
    console.log(`   Total de mensagens: ${session.messages.length}`);

    // 2. Listar últimas mensagens
    console.log('\n2️⃣ Últimas mensagens da sessão:');
    session.messages.reverse().forEach((msg, index) => {
      const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR');
      console.log(`\n[${index + 1}] ${msg.role} (${time}):`);
      console.log(`   "${msg.content.substring(0, 80)}${msg.content.length > 80 ? '...' : ''}"`);
      if (msg.metadata) {
        console.log(`   Metadata:`, JSON.stringify(msg.metadata).substring(0, 100));
      }
    });

    // 3. Simular mensagem do agente
    console.log('\n3️⃣ Simulando mensagem do agente...');
    const testMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: `[TESTE] Mensagem de teste enviada pelo agente em ${new Date().toLocaleTimeString('pt-BR')}`,
        metadata: {
          isHuman: true,
          sentBy: 'test-script',
          sentByName: 'Script de Teste'
        }
      }
    });

    console.log(`✅ Mensagem de teste criada: ${testMessage.id}`);

    // 4. Verificar se foi salva
    console.log('\n4️⃣ Verificando se a mensagem foi salva...');
    const verifySession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (verifySession?.messages[0]?.id === testMessage.id) {
      console.log('✅ Mensagem salva corretamente no banco!');
    } else {
      console.log('❌ ERRO: Mensagem não encontrada!');
    }

    // 5. Instruções para teste
    console.log('\n📝 INSTRUÇÕES DE TESTE:\n');
    console.log('1. Abra o widget do chat');
    console.log('2. Se necessário, escale para atendimento humano');
    console.log('3. No console do navegador (F12), execute:');
    console.log(`\n   fetch('/api/chat/sessions/${session.id}/messages')`);
    console.log('     .then(r => r.json())');
    console.log('     .then(messages => {');
    console.log('       console.log("Total de mensagens:", messages.length);');
    console.log('       console.log("Última mensagem:", messages[messages.length - 1]);');
    console.log('     });\n');
    
    console.log('4. A mensagem de teste deve aparecer:');
    console.log(`   "${testMessage.content}"`);
    
    console.log('\n5. Se não aparecer no widget após 2 segundos:');
    console.log('   - Verifique se o widget está fazendo polling (Network tab)');
    console.log('   - Recarregue a página do widget (F5)');
    console.log('   - Verifique erros no console');
    
    console.log('\n💡 DICA: O widget faz polling a cada 2 segundos');
    console.log('         Deve buscar /api/chat/sessions/[id]/messages automaticamente');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWidgetMessages();
