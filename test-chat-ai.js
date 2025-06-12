const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testChatAI() {
  console.log('🤖 Testando Agente de IA do Chat...\n');

  try {
    // 1. Verificar se há documentos na base de conhecimento
    console.log('📚 Verificando Base de Conhecimento...');
    const knowledgeCount = await prisma.knowledgeBase.count({
      where: { isActive: true }
    });
    
    console.log(`✅ Total de documentos ativos: ${knowledgeCount}`);
    
    if (knowledgeCount === 0) {
      console.log('⚠️  AVISO: Nenhum documento na base! A IA não terá contexto.');
      console.log('💡 Adicione documentos em /base-conhecimento\n');
    }

    // 2. Listar categorias disponíveis
    const categories = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });
    
    console.log('\n📂 Categorias disponíveis:');
    categories.forEach(c => console.log(`   - ${c.category}`));

    // 3. Verificar configurações do chat
    console.log('\n⚙️  Verificando configurações...');
    
    // Simular busca de configurações (normalmente vem da API)
    const defaultSettings = {
      ai: {
        model: 'gpt-4o',
        temperature: 0.3,
        confidenceThreshold: 80
      },
      knowledgeBase: {
        enabledCategories: categories.map(c => c.category),
        maxContexts: 5
      }
    };
    
    console.log(`   - Modelo: ${defaultSettings.ai.model}`);
    console.log(`   - Temperatura: ${defaultSettings.ai.temperature}`);
    console.log(`   - Threshold confiança: ${defaultSettings.ai.confidenceThreshold}%`);
    console.log(`   - Max contextos: ${defaultSettings.knowledgeBase.maxContexts}`);

    // 4. Mostrar exemplos de perguntas
    console.log('\n💬 Exemplos de perguntas para testar:');
    const exemplos = [
      "Como faço para criar uma conta?",
      "Qual é o horário de atendimento?",
      "Como resetar minha senha?",
      "Quais são os planos disponíveis?",
      "Como funciona o suporte técnico?"
    ];
    
    exemplos.forEach(ex => console.log(`   - "${ex}"`));

    // 5. Verificar integração com Pinecone
    console.log('\n🔍 Verificando integração com Pinecone...');
    
    if (!process.env.PINECONE_API_KEY) {
      console.log('❌ PINECONE_API_KEY não configurada!');
      console.log('   Configure no arquivo .env');
    } else {
      console.log('✅ Pinecone configurado');
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY não configurada!');
      console.log('   Configure no arquivo .env');
    } else {
      console.log('✅ OpenAI configurada');
    }

    // 6. Sugestões de melhorias
    console.log('\n💡 Sugestões para melhorar o agente:');
    console.log('   1. Adicione mais documentos na base de conhecimento');
    console.log('   2. Organize por categorias específicas');
    console.log('   3. Inclua FAQs comuns da empresa');
    console.log('   4. Configure horário de atendimento em /configuracoes');
    console.log('   5. Ajuste o threshold de confiança se necessário');

    console.log('\n✅ Teste concluído!');
    console.log('\n🚀 Para testar o chat:');
    console.log('   1. Acesse o widget no canto inferior direito');
    console.log('   2. Preencha os dados obrigatórios');
    console.log('   3. Faça uma pergunta');
    console.log('   4. O agente buscará na base e responderá!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatAI();
