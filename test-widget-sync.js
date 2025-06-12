// Script para testar sincronização completa Widget x Atendimento
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWidgetSync() {
  try {
    console.log('🔍 TESTE COMPLETO DE SINCRONIZAÇÃO WIDGET x ATENDIMENTO\n');

    // 1. Buscar todas as sessões ativas
    console.log('1️⃣ Buscando sessões ativas e escaladas...');
    const sessions = await prisma.chatSession.findMany({
      where: {
        status: { in: ['ACTIVE', 'ESCALATED'] }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        client: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (sessions.length === 0) {
      console.log('❌ Nenhuma sessão ativa encontrada!');
      console.log('💡 Crie uma sessão primeiro através do widget');
      return;
    }

    console.log(`✅ ${sessions.length} sessões encontradas:\n`);

    // 2. Listar cada sessão com detalhes
    sessions.forEach((session, index) => {
      console.log(`\n📌 SESSÃO ${index + 1}:`);
      console.log(`   ID: ${session.id}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Cliente: ${session.userName || session.userEmail}`);
      console.log(`   Criada: ${new Date(session.createdAt).toLocaleString('pt-BR')}`);
      console.log(`   Total de mensagens: ${session.messages.length}`);
      
      if (session.messages.length > 0) {
        console.log(`\n   📝 Últimas mensagens:`);
        session.messages.slice(0, 5).forEach((msg, msgIndex) => {
          const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR');
          const role = msg.role === 'ASSISTANT' && msg.metadata?.isHuman ? 'ATENDENTE' : msg.role;
          console.log(`\n   [${msgIndex + 1}] ${role} (${time}):`);
          console.log(`       "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`);
          if (msg.metadata?.isHuman) {
            console.log(`       👤 Enviado por: ${msg.metadata.sentByName || 'Atendente'}`);
          }
        });
      }
    });

    // 3. Testar endpoint de mensagens
    console.log('\n\n3️⃣ Testando endpoint de mensagens...');
    const testSession = sessions[0];
    console.log(`   Testando para sessão: ${testSession.id}`);
    
    // Simular requisição do widget
    const apiUrl = `http://localhost:3001/api/chat/sessions/${testSession.id}/messages`;
    console.log(`   URL: ${apiUrl}`);
    
    try {
      const fetch = require('node-fetch');
      const response = await fetch(apiUrl);
      const messages = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ API retornou ${messages.length} mensagens`);
      } else {
        console.log(`   ❌ Erro na API: ${response.status}`);
        console.log(`   Resposta:`, messages);
      }
    } catch (error) {
      console.log(`   ⚠️  Não foi possível testar a API (servidor pode estar offline)`);
    }

    // 4. Instruções de teste manual
    console.log('\n\n📋 INSTRUÇÕES PARA TESTE MANUAL:\n');
    console.log('1. Abra o widget do chat em uma aba');
    console.log('2. Abra /atendimento em outra aba');
    console.log('3. No widget, solicite atendimento humano');
    console.log('4. No /atendimento, assuma o chat');
    console.log('5. Envie uma mensagem do /atendimento');
    console.log('6. A mensagem deve aparecer no widget em até 2 segundos');
    
    console.log('\n🔧 VERIFICAÇÕES NO CONSOLE DO WIDGET (F12):');
    console.log('\n// Verificar polling:');
    console.log('// Na aba Network, procure por requisições para:');
    console.log(`// /api/chat/sessions/${testSession.id}/messages`);
    console.log('// Deve haver uma requisição a cada 2 segundos');
    
    console.log('\n// Verificar mensagens manualmente:');
    console.log(`fetch('/api/chat/sessions/${testSession.id}/messages')`);
    console.log('  .then(r => r.json())');
    console.log('  .then(msgs => {');
    console.log('    console.log("Total:", msgs.length);');
    console.log('    msgs.forEach((m, i) => {');
    console.log('      console.log(`[${i}] ${m.role}: ${m.content.substring(0, 50)}...`);');
    console.log('    });');
    console.log('  });');
    
    console.log('\n💡 POSSÍVEIS PROBLEMAS:');
    console.log('1. Widget está buscando sessão errada');
    console.log('2. Polling não está funcionando');
    console.log('3. API não está retornando mensagens novas');
    console.log('4. Cache do navegador');
    
    console.log('\n🚀 SOLUÇÕES:');
    console.log('1. Limpar cache: Ctrl+Shift+R');
    console.log('2. Verificar ID da sessão em ambos os lados');
    console.log('3. Verificar console para erros');
    console.log('4. Reiniciar servidor e recarregar páginas');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWidgetSync();
