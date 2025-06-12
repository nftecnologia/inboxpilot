import fetch from 'node-fetch';

async function testPineconeSearch() {
  console.log('🔍 Testando busca semântica no Pinecone...\n');
  
  try {
    // 1. Fazer login primeiro
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: '', // Ignorar CSRF para teste
      }),
    });

    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('✅ Login realizado\n');

    // 2. Testar busca semântica
    console.log('2️⃣ Testando busca semântica...');
    const searchResponse = await fetch('http://localhost:3000/api/knowledge/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies ? cookies.join('; ') : '',
      },
      body: JSON.stringify({
        query: 'como resetar senha',
        limit: 5,
      }),
    });

    const searchResult = await searchResponse.json();
    
    if (searchResponse.ok && searchResult.success) {
      console.log('✅ Busca bem-sucedida!\n');
      console.log('📊 Resultados encontrados:', searchResult.data.length);
      
      searchResult.data.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.title}`);
        console.log(`   📁 Categoria: ${doc.category}`);
        console.log(`   📊 Score: ${doc.score || 'N/A'}`);
        console.log(`   📝 Trecho: ${doc.content.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ Erro na busca:', searchResult);
    }

    // 3. Testar busca com categoria específica
    console.log('\n\n3️⃣ Testando busca com categoria...');
    const categorySearchResponse = await fetch('http://localhost:3000/api/knowledge/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies ? cookies.join('; ') : '',
      },
      body: JSON.stringify({
        query: 'cadastro',
        category: 'Cadastro e Conta',
        limit: 3,
      }),
    });

    const categoryResult = await categorySearchResponse.json();
    
    if (categorySearchResponse.ok && categoryResult.success) {
      console.log('✅ Busca por categoria bem-sucedida!');
      console.log('📊 Resultados encontrados:', categoryResult.data.length);
      
      categoryResult.data.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.title}`);
        console.log(`   📊 Score: ${doc.score || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testPineconeSearch();
