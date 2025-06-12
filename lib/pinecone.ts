import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Inicializar clientes
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'knowledge-base';

// Interface para metadados do documento
interface DocumentMetadata {
  title: string;
  category: string;
  content: string;
  userId?: string;
  createdAt?: string;
  [key: string]: any; // Index signature para compatibilidade com RecordMetadata
}

// Gerar embedding para texto usando OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw new Error('Falha ao gerar embedding');
  }
}

// Indexar documento no Pinecone
export async function indexDocument(
  id: string,
  title: string,
  content: string,
  category: string,
  userId?: string
): Promise<void> {
  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Gerar embedding do conteúdo completo
    const textToEmbed = `${title} ${content}`;
    const embedding = await generateEmbedding(textToEmbed);
    
    // Preparar metadados
    const metadata: DocumentMetadata = {
      title,
      category,
      content: content.substring(0, 2000), // Limitar tamanho do conteúdo nos metadados
      userId,
      createdAt: new Date().toISOString(),
    };
    
    // Salvar no Pinecone
    const record: PineconeRecord = {
      id,
      values: embedding,
      metadata,
    };
    
    await index.upsert([record]);
    
    console.log(`✅ Documento indexado no Pinecone: ${title}`);
  } catch (error) {
    console.error('Erro ao indexar documento:', error);
    throw error;
  }
}

// Atualizar documento no Pinecone
export async function updateDocument(
  id: string,
  title: string,
  content: string,
  category: string,
  userId?: string
): Promise<void> {
  // Atualizar é o mesmo que indexar (upsert)
  return indexDocument(id, title, content, category, userId);
}

// Deletar documento do Pinecone
export async function deleteDocument(id: string): Promise<void> {
  try {
    const index = pinecone.index(INDEX_NAME);
    await index.deleteOne(id);
    console.log(`🗑️ Documento removido do Pinecone: ${id}`);
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
}

// Buscar documentos similares
export async function searchSimilarDocuments(
  query: string,
  topK: number = 5,
  category?: string | string[],
  userId?: string
): Promise<Array<{
  id: string;
  score: number;
  title: string;
  category: string;
  content: string;
}>> {
  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query);
    
    // Configurar filtros
    const filter: any = {};
    if (category) {
      // Se for array de categorias, usar $in ao invés de $eq
      if (Array.isArray(category)) {
        filter.category = { $in: category };
      } else {
        filter.category = { $eq: category };
      }
    }
    if (userId) {
      filter.userId = { $eq: userId };
    }
    
    // Buscar no Pinecone
    const queryOptions: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };
    
    if (Object.keys(filter).length > 0) {
      queryOptions.filter = filter;
    }
    
    const results = await index.query(queryOptions);
    
    // Formatar resultados
    return results.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      title: (match.metadata?.title as string) || '',
      category: (match.metadata?.category as string) || '',
      content: (match.metadata?.content as string) || '',
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar documentos similares:', error);
    throw error;
  }
}

// Buscar contexto relevante para resposta de email
export async function getRelevantContext(
  emailContent: string,
  category?: string | string[],
  limit: number = 3
): Promise<string> {
  try {
    const documents = await searchSimilarDocuments(emailContent, limit, category);
    
    if (documents.length === 0) {
      return '';
    }
    
    // Formatar contexto para a IA
    let context = 'Base de Conhecimento Relevante:\n\n';
    
    documents.forEach((doc, index) => {
      context += `${index + 1}. ${doc.title}\n`;
      context += `   Categoria: ${doc.category}\n`;
      context += `   Conteúdo: ${doc.content}\n\n`;
    });
    
    return context;
  } catch (error) {
    console.error('Erro ao buscar contexto relevante:', error);
    return '';
  }
}

// Verificar se o índice existe e criar se necessário
export async function ensureIndexExists(): Promise<void> {
  try {
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === INDEX_NAME);
    
    if (!indexExists) {
      console.log(`📦 Criando índice ${INDEX_NAME}...`);
      
      await pinecone.createIndex({
        name: INDEX_NAME,
        dimension: 1536, // Dimensão para text-embedding-3-small
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      
      console.log(`✅ Índice ${INDEX_NAME} criado com sucesso!`);
      
      // Aguardar o índice ficar pronto
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60 segundos
    } else {
      console.log(`✅ Índice ${INDEX_NAME} já existe`);
    }
  } catch (error) {
    console.error('Erro ao verificar/criar índice:', error);
    throw error;
  }
}

// Função para testar a conexão
export async function testPineconeConnection(): Promise<boolean> {
  try {
    const indexes = await pinecone.listIndexes();
    console.log('✅ Conexão com Pinecone estabelecida');
    console.log('Índices disponíveis:', indexes);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Pinecone:', error);
    return false;
  }
}
