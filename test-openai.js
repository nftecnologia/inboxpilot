import OpenAI from 'openai';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testOpenAI() {
  console.log('🔍 Testando configuração OpenAI...\n');
  
  // Verificar se a chave está configurada
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não está configurada no arquivo .env');
    console.log('   Por favor, adicione: OPENAI_API_KEY=sua-chave-aqui');
    return;
  }
  
  console.log('✅ OPENAI_API_KEY encontrada');
  console.log(`   Primeiros caracteres: ${process.env.OPENAI_API_KEY.substring(0, 8)}...`);
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('\n📤 Testando chamada para OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente útil."
        },
        {
          role: "user",
          content: "Responda apenas: OK"
        }
      ],
      temperature: 0,
      max_tokens: 10
    });
    
    console.log('✅ OpenAI funcionando corretamente!');
    console.log(`   Resposta: ${completion.choices[0].message.content}`);
    
    // Testar categorização
    console.log('\n📤 Testando categorização...');
    
    const categorizationTest = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Categorize o seguinte texto em uma destas categorias: Cadastro e Conta, Produtos, Geral. Responda apenas com o nome da categoria."
        },
        {
          role: "user",
          content: "Como faço para resetar minha senha?"
        }
      ],
      temperature: 0,
      max_tokens: 20
    });
    
    console.log('✅ Categorização funcionando!');
    console.log(`   Categoria detectada: ${categorizationTest.choices[0].message.content}`);
    
  } catch (error) {
    console.error('\n❌ Erro ao conectar com OpenAI:', error.message);
    
    if (error.message.includes('401')) {
      console.log('   → Chave de API inválida');
    } else if (error.message.includes('429')) {
      console.log('   → Limite de requisições excedido');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('   → Cota insuficiente (sem créditos)');
    }
  }
}

// Executar teste
testOpenAI();
