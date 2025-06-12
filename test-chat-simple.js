const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testChatSimple() {
  console.log('🔍 Teste Simples do Chat AI\n');

  try {
    // 1. Verificar OpenAI API Key
    console.log('1️⃣ Verificando configurações...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não está configurada!');
      console.log('   Configure no arquivo .env');
      return;
    } else {
      console.log('✅ OpenAI API Key encontrada');
    }

    if (!process.env.PINECONE_API_KEY) {
      console.error('❌ PINECONE_API_KEY não está configurada!');
      console.log('   Configure no arquivo .env');
      return;
    } else {
      console.log('✅ Pinecone API Key encontrada');
    }

    // 2. Verificar base de conhecimento
    console.log('\n2️⃣ Verificando base de conhecimento...');
    
    const knowledgeCount = await prisma.knowledgeBase.count({
      where: { isActive: true }
    });
    
    console.log(`📚 Total de documentos: ${knowledgeCount}`);
    
    if (knowledgeCount === 0) {
      console.error('❌ Nenhum documento na base!');
      console.log('   A IA não terá contexto para responder');
      console.log('   Adicione documentos em /base-conhecimento');
      return;
    }

    // 3. Listar primeiros documentos
    console.log('\n3️⃣ Primeiros documentos na base:');
    const docs = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      take: 5,
      select: {
        title: true,
        category: true
      }
    });
    
    docs.forEach((doc, i) => {
      console.log(`   ${i + 1}. "${doc.title}" (${doc.category})`);
    });

    // 4. Sugestões de teste
    console.log('\n4️⃣ Para testar o chat:');
    console.log('   1. Certifique-se que o servidor está rodando (pnpm dev)');
    console.log('   2. Abra o navegador em http://localhost:3000');
    console.log('   3. Clique no widget de chat (canto inferior direito)');
    console.log('   4. Preencha os dados e faça uma pergunta');
    console.log('\n💡 Perguntas sugeridas baseadas na sua base:');
    
    if (docs.length > 0) {
      console.log(`   - "Me fale sobre ${docs[0].title.toLowerCase()}"`);
      console.log(`   - "Como funciona ${docs[0].category.toLowerCase()}?"`);
      console.log(`   - "Quais são as opções de ${docs[1]?.category.toLowerCase() || 'produtos'}?"`);
    }

    // 5. Debug adicional
    console.log('\n5️⃣ Se o chat não estiver respondendo:');
    console.log('   - Verifique o console do navegador (F12)');
    console.log('   - Verifique os logs do servidor');
    console.log('   - Confirme que as APIs estão acessíveis');
    console.log('   - Tente reiniciar o servidor');

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testChatSimple();
