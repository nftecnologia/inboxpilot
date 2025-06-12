// Script para testar o sistema de atendimento
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAtendimento() {
  try {
    console.log('🔍 Testando sistema de atendimento...\n');

    // 1. Verificar sessões escaladas
    console.log('1️⃣ Buscando sessões escaladas...');
    const escalatedSessions = await prisma.chatSession.findMany({
      where: { status: 'ESCALATED' },
      include: {
        messages: true,
        client: true
      }
    });
    
    console.log(`   ✅ Encontradas ${escalatedSessions.length} sessões em espera`);
    
    if (escalatedSessions.length > 0) {
      const session = escalatedSessions[0];
      console.log(`   📋 Primeira sessão:`, {
        id: session.id,
        userName: session.userName,
        userEmail: session.userEmail,
        status: session.status,
        messageCount: session.messages.length
      });
    }

    // 2. Verificar sessões ativas
    console.log('\n2️⃣ Buscando sessões ativas...');
    const activeSessions = await prisma.chatSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log(`   ✅ Encontradas ${activeSessions.length} sessões ativas`);
    
    if (activeSessions.length > 0) {
      const session = activeSessions[0];
      console.log(`   📋 Primeira sessão ativa:`, {
        id: session.id,
        userName: session.userName,
        status: session.status,
        messageCount: session.messages.length,
        lastMessage: session.messages[session.messages.length - 1]?.content?.substring(0, 50) + '...'
      });
    }

    // 3. Criar uma sessão de teste se não houver nenhuma
    if (escalatedSessions.length === 0 && activeSessions.length === 0) {
      console.log('\n3️⃣ Criando sessão de teste...');
      
      // Buscar ou criar cliente
      let client = await prisma.client.findFirst({
        where: { email: 'teste@cliente.com' }
      });
      
      if (!client) {
        client = await prisma.client.create({
          data: {
            email: 'teste@cliente.com',
            name: 'Cliente Teste',
            phone: '11999999999',
            company: 'Empresa Teste'
          }
        });
      }

      // Criar sessão escalada
      const newSession = await prisma.chatSession.create({
        data: {
          userEmail: 'teste@cliente.com',
          userName: 'Cliente Teste',
          userPhone: '11999999999',
          clientId: client.id,
          status: 'ESCALATED',
          source: 'widget',
          metadata: {
            escalationReason: 'Solicitação manual do cliente'
          }
        }
      });

      // Adicionar mensagens de teste
      await prisma.chatMessage.createMany({
        data: [
          {
            sessionId: newSession.id,
            role: 'USER',
            content: 'Olá, preciso de ajuda com meu pedido'
          },
          {
            sessionId: newSession.id,
            role: 'ASSISTANT',
            content: 'Olá! Vou transferir você para um de nossos atendentes.',
            confidence: 0.3
          },
          {
            sessionId: newSession.id,
            role: 'USER',
            content: 'Ok, obrigado!'
          }
        ]
      });

      console.log(`   ✅ Sessão de teste criada: ${newSession.id}`);
      console.log('   📌 Acesse /atendimento para ver a sessão em espera');
    }

    // 4. Verificar se há atendentes
    console.log('\n4️⃣ Verificando atendentes disponíveis...');
    const agents = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'agent'] }
      }
    });
    
    console.log(`   ✅ Encontrados ${agents.length} atendentes`);
    agents.forEach(agent => {
      console.log(`   👤 ${agent.name || agent.email} (${agent.role})`);
    });

    console.log('\n✅ Teste concluído!');
    console.log('\n📝 Instruções:');
    console.log('1. Faça login como atendente (admin ou agent)');
    console.log('2. Acesse /atendimento');
    console.log('3. Clique em "Atender" em um chat em espera');
    console.log('4. Tente enviar uma mensagem');
    console.log('\nSe o envio falhar, verifique o console do navegador (F12)');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAtendimento();
