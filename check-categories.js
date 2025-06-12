const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const knowledge = await prisma.knowledgeBase.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📚 Documentos na base de conhecimento:\n');
    knowledge.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   📁 Categoria: ${doc.category}`);
      console.log(`   📅 Criado em: ${doc.createdAt.toLocaleString('pt-BR')}\n`);
    });
    
    // Contar por categoria
    const categoryCounts = {};
    knowledge.forEach(doc => {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
    });
    
    console.log('📊 Distribuição por categoria:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} documentos`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
