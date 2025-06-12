import { prisma } from '../lib/prisma'
import { indexDocument, ensureIndexExists, testPineconeConnection } from '../lib/pinecone'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

async function migrarParaPinecone() {
  console.log('🚀 Iniciando migração para Pinecone...')
  
  try {
    // Testar conexão com Pinecone
    console.log('📡 Testando conexão com Pinecone...')
    const connected = await testPineconeConnection()
    
    if (!connected) {
      throw new Error('Não foi possível conectar ao Pinecone')
    }
    
    // Garantir que o índice existe
    console.log('🔍 Verificando índice...')
    await ensureIndexExists()
    
    // Buscar todos os documentos da base de conhecimento
    console.log('📚 Buscando documentos no banco de dados...')
    const documentos = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📊 Total de documentos para migrar: ${documentos.length}`)
    
    if (documentos.length === 0) {
      console.log('✅ Nenhum documento para migrar!')
      return
    }
    
    // Migrar documentos em lotes
    const batchSize = 10
    let migrados = 0
    let erros = 0
    
    for (let i = 0; i < documentos.length; i += batchSize) {
      const batch = documentos.slice(i, i + batchSize)
      
      console.log(`\n📦 Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(documentos.length / batchSize)}...`)
      
      for (const doc of batch) {
        try {
          await indexDocument(
            doc.id,
            doc.title,
            doc.content,
            doc.category,
            doc.userId
          )
          
          migrados++
          console.log(`✅ [${migrados}/${documentos.length}] ${doc.title}`)
          
          // Delay para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          erros++
          console.error(`❌ Erro ao migrar documento ${doc.id}:`, error)
        }
      }
      
      // Pausa entre lotes
      if (i + batchSize < documentos.length) {
        console.log('⏳ Aguardando antes do próximo lote...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMO DA MIGRAÇÃO')
    console.log('='.repeat(50))
    console.log(`✅ Documentos migrados com sucesso: ${migrados}`)
    console.log(`❌ Documentos com erro: ${erros}`)
    console.log(`📚 Total de documentos: ${documentos.length}`)
    console.log('='.repeat(50))
    
    if (erros > 0) {
      console.log('\n⚠️  Alguns documentos não foram migrados. Verifique os logs acima.')
    } else {
      console.log('\n🎉 Migração concluída com sucesso!')
    }
    
  } catch (error) {
    console.error('💥 Erro fatal na migração:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração
migrarParaPinecone()
  .then(() => {
    console.log('\n✨ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erro não tratado:', error)
    process.exit(1)
  })
