import OpenAI from 'openai';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testOpenAIKey() {
  console.log('🔍 Testando chave OpenAI do arquivo .env...\n');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY não encontrada no .env');
    return;
  }
  
  console.log(`📝 Chave encontrada: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`📏 Tamanho da chave: ${apiKey.length} caracteres`);
  
  // Verificar formato da chave
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ Formato inválido: Chave OpenAI deve começar com "sk-"');
    return;
  }
  
  try {
    const openai = new OpenAI({ apiKey });
    
    console.log('\n📤 Testando conexão com OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say 'API working'" }
      ],
      max_tokens: 10
    });
    
    console.log('✅ Chave OpenAI VÁLIDA e funcionando!');
    console.log(`💬 Resposta: ${completion.choices[0].message.content}`);
    
  } catch (error) {
    console.error('\n❌ Erro ao usar a chave OpenAI:');
    
    if (error.status === 401) {
      console.error('🔑 Chave inválida ou expirada');
      console.error('   → Verifique se a chave está correta');
      console.error('   → Gere uma nova chave em: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      console.error('⏰ Limite de taxa excedido');
    } else if (error.status === 400) {
      console.error('📛 Requisição inválida');
    } else if (error.message?.includes('insufficient_quota')) {
      console.error('💸 Sem créditos na conta OpenAI');
      console.error('   → Adicione créditos em: https://platform.openai.com/account/billing');
    } else {
      console.error('🚨 Erro desconhecido:', error.message);
    }
    
    if (error.response) {
      console.error('\n📋 Detalhes do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar teste
testOpenAIKey();
