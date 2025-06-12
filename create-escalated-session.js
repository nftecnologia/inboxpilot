// Script para criar uma sessão escalada para teste
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createEscalatedSession() {
  try {
    console.log('🔄 Criando sessão escalada para teste...\n');

    // Buscar ou criar cliente
    let client = await prisma.client.findFirst({
      where: { email: 'suporte@empresa.com' }
    });
    
    if (!client) {
      client = await prisma.client.create({
        data: {
          email: 'suporte@empresa.com',
          name: 'João da Silva',
          phone: '11987654321',
          company: 'Empresa ABC'
        }
      });
      console.log('✅ Cliente criado:', client.name);
    }

    // Criar sessão escalada
    const newSession = await prisma.chatSession.create({
      data: {
        userEmail: client.email,
        userName: client.name,
        userPhone: client.phone,
        clientId: client.id,
        status: 'ESCALATED',
        source: 'widget',
        metadata: {
          escalationReason: 'Cliente solicitou falar com humano',
          aiConfidence: 0.2
        }
      }
    });

    console.log('✅ Sessão criada:', newSession.id);

    // Adicionar mensagens de exemplo
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId: newSession.id,
          role: 'USER',
          content: 'Olá, estou com um problema urgente no meu pedido #12345'
        },
        {
          sessionId: newSession.id,
          role: 'ASSISTANT',
          content: 'Entendo sua preocupação com o pedido #12345. Vou transferir você para um de nossos especialistas que poderá ajudá-lo melhor.',
          confidence: 0.3
        },
        {
          sessionId: newSession.id,
          role: 'USER',
          content: 'Por favor, preciso resolver isso hoje!'
        },
        {
          sessionId: newSession.id,
          role: 'SYSTEM',
          content: 'Chat escalado para atendimento humano',
          metadata: {
            event: 'chat_escalated',
            reason: 'low_confidence'
          }
        }
      ]
    });

    console.log('✅ Mensagens adicionadas\n');
    
    console.log('📌 INSTRUÇÕES:');
    console.log('1. Acesse /atendimento');
    console.log('2. Na aba "Em Espera", você verá o chat de João da Silva');
    console.log('3. Clique em "Atender" para assumir o chat');
    console.log('4. Tente enviar uma mensagem\n');
    
    console.log('🆔 ID da sessão:', newSession.id);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEscalatedSession();
