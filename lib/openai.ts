import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { buscarConhecimentoRelevante, formatarConhecimentoParaIA } from "./knowledge-search"

// Função para analisar o conteúdo do e-mail e categorizar
export async function analisarEmail(assunto: string, corpo: string) {
  console.log("🔍 analisarEmail chamada com:", { assunto, corpo })

  // Verificar se a API key está configurada
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY não configurada")
    throw new Error("OPENAI_API_KEY não configurada")
  }

  const prompt = `
    Analise o seguinte e-mail e categorize-o em uma das seguintes categorias:
    - Cadastro e Conta
    - Checkout e Conversão
    - Produtos
    - Marketplace
    - Área de Membros
    - Integrações
    - Afiliados
    - Geral
    - Consumidor
    - Plágio
    - Upsell One Click
    - Biometria
    - Finanças

    Assunto do e-mail: ${assunto}
    Corpo do e-mail: ${corpo}

    Retorne apenas o nome da categoria, sem explicações adicionais.
  `

  try {
    console.log("📤 Enviando para OpenAI...")
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 50,
    })
    console.log("📥 Resposta do OpenAI:", text)

    return text.trim()
  } catch (error) {
    console.error("💥 Erro ao analisar e-mail:", error)
    console.error("Detalhes do erro:", error instanceof Error ? error.message : "Erro desconhecido")
    return "Geral" // Categoria padrão em caso de erro
  }
}

// Função para gerar resposta do e-mail
export async function gerarRespostaEmail(
  assunto: string,
  corpo: string,
  nomeRemetente: string,
  categoria: string,
  palavrasChave: string[] = [],
) {
  console.log("🔍 gerarRespostaEmail chamada")

  try {
    // Buscar conhecimento relevante na base de dados
    console.log("🔍 Buscando conhecimento relevante...")
    const conhecimentosRelevantes = await buscarConhecimentoRelevante(categoria, palavrasChave, assunto, corpo)
    const contextoConhecimento = formatarConhecimentoParaIA(conhecimentosRelevantes)
    console.log("✅ Conhecimento encontrado:", conhecimentosRelevantes.length, "itens")

    const prompt = `
      Você é um assistente de suporte ao cliente profissional e prestativo.
      
      IMPORTANTE: Use as informações da base de conhecimento abaixo para responder quando disponível.
      Se a base de conhecimento não contém informações suficientes, forneça uma resposta útil baseada no contexto.
      
      BASE DE CONHECIMENTO DISPONÍVEL:
      ${contextoConhecimento}
      
      INFORMAÇÕES DO E-MAIL:
      Categoria: ${categoria}
      Assunto: ${assunto}
      Corpo: ${corpo}
      Nome do remetente: ${nomeRemetente}
      Palavras-chave identificadas: ${palavrasChave.join(", ")}
      
      INSTRUÇÕES:
      1. Use um tom ${obterTomPorCategoria(categoria)}
      2. Responda em português do Brasil
      3. Seja claro, conciso e útil
      4. Use informações da base de conhecimento quando disponível
      5. Inicie com "Olá ${nomeRemetente},"
      6. Termine com "Atenciosamente, Equipe de Suporte"
      7. Limite a resposta a no máximo 250 palavras
      8. Forneça uma resposta útil mesmo se não houver conhecimento específico
    `

    console.log("📤 Gerando resposta com OpenAI...")
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
      maxTokens: 500,
    })
    console.log("✅ Resposta gerada com sucesso")

    return text.trim()
  } catch (error) {
    console.error("💥 Erro ao gerar resposta:", error)
    return `Olá ${nomeRemetente},

Agradecemos seu contato. Recebemos sua mensagem e nossa equipe está analisando o caso. Em breve retornaremos com informações mais detalhadas.

Para urgências, entre em contato através do nosso chat online.

Atenciosamente,
Equipe de Suporte`
  }
}

// Função para extrair palavras-chave do e-mail
export async function extrairPalavrasChave(assunto: string, corpo: string) {
  console.log("🔍 extrairPalavrasChave chamada")

  const prompt = `
    Extraia 5 palavras-chave relevantes do seguinte e-mail:
    
    Assunto: ${assunto}
    Corpo: ${corpo}
    
    Retorne apenas as palavras-chave separadas por vírgula, sem explicações adicionais.
  `

  try {
    console.log("📤 Extraindo palavras-chave...")
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 100,
    })
    console.log("✅ Palavras-chave extraídas:", text)

    return text
      .trim()
      .split(",")
      .map((keyword) => keyword.trim())
  } catch (error) {
    console.error("💥 Erro ao extrair palavras-chave:", error)
    return []
  }
}

// Função para avaliar a complexidade do e-mail
export async function avaliarComplexidade(assunto: string, corpo: string) {
  console.log("🔍 avaliarComplexidade chamada")

  const prompt = `
    Avalie a complexidade do seguinte e-mail em uma escala de 1 a 5, onde:
    1 = Muito simples (pode ser respondido com template)
    2 = Simples (resposta direta)
    3 = Moderado (requer alguma análise)
    4 = Complexo (requer análise detalhada)
    5 = Muito complexo (requer intervenção humana especializada)
    
    Assunto: ${assunto}
    Corpo: ${corpo}
    
    Retorne apenas o número da escala, sem explicações adicionais.
  `

  try {
    console.log("📤 Avaliando complexidade...")
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 10,
    })
    console.log("✅ Complexidade avaliada:", text)

    const complexidade = Number.parseInt(text.trim())
    return isNaN(complexidade) ? 3 : complexidade
  } catch (error) {
    console.error("💥 Erro ao avaliar complexidade:", error)
    return 3 // Complexidade moderada por padrão
  }
}

// Função auxiliar para determinar o tom baseado na categoria
function obterTomPorCategoria(categoria: string): string {
  switch (categoria) {
    case "Cadastro e Conta":
    case "Checkout e Conversão":
    case "Integrações":
      return "profissional e prestativo"
    case "Produtos":
    case "Marketplace":
    case "Área de Membros":
      return "entusiástico e informativo"
    case "Consumidor":
    case "Plágio":
      return "formal e respeitoso"
    case "Finanças":
      return "profissional e claro"
    default:
      return "amigável e profissional"
  }
}
