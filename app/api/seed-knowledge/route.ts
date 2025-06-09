import { NextResponse } from "next/server"
import { createKnowledgeCard } from "@/lib/knowledge-db"

// Dados de exemplo para seed
const knowledgeData = [
  {
    title: "Como resetar senha",
    category: "Cadastro e Conta",
    content:
      "Para resetar a senha: 1) Acesse a página de login 2) Clique em 'Esqueci minha senha' 3) Digite seu e-mail 4) Verifique sua caixa de entrada 5) Clique no link recebido 6) Defina uma nova senha",
  },
  {
    title: "Política de reembolso",
    category: "Checkout e Conversão",
    content:
      "Nossa política de reembolso permite devoluções em até 30 dias após a compra. O produto deve estar em perfeitas condições. O reembolso é processado em até 5 dias úteis após a aprovação.",
  },
  {
    title: "Funcionalidades do plano premium",
    category: "Produtos",
    content:
      "O plano premium inclui: análise avançada de dados, relatórios personalizados, suporte prioritário 24/7, integração com APIs externas, armazenamento ilimitado e acesso a recursos beta.",
  },
  {
    title: "Problemas de conectividade",
    category: "Integrações",
    content:
      "Para resolver problemas de conectividade: 1) Verifique sua conexão com a internet 2) Limpe o cache do navegador 3) Desative extensões 4) Tente usar outro navegador 5) Entre em contato se o problema persistir",
  },
  {
    title: "Horário de atendimento",
    category: "Geral",
    content:
      "Nosso atendimento funciona de segunda a sexta-feira, das 8h às 18h. Aos sábados das 9h às 14h. Domingos e feriados não há atendimento. Para urgências, use o chat online.",
  },
  {
    title: "Como cancelar assinatura",
    category: "Cadastro e Conta",
    content:
      "Para cancelar sua assinatura: 1) Acesse sua conta 2) Vá em 'Configurações' 3) Clique em 'Gerenciar Assinatura' 4) Selecione 'Cancelar' 5) Confirme o cancelamento. O acesso permanece até o fim do período pago.",
  },
  {
    title: "Integração com APIs externas",
    category: "Integrações",
    content:
      "Oferecemos integração com mais de 50 APIs populares incluindo Zapier, Webhook, REST APIs personalizadas. Documentação completa disponível em nossa central de desenvolvedores.",
  },
  {
    title: "Política de privacidade e LGPD",
    category: "Geral",
    content:
      "Respeitamos sua privacidade e seguimos rigorosamente a LGPD. Seus dados são criptografados, nunca compartilhados com terceiros sem consentimento, e você pode solicitar exclusão a qualquer momento.",
  },
]

export async function GET() {
  try {
    const results = []

    for (const data of knowledgeData) {
      const card = await createKnowledgeCard(data)
      results.push(card)
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} conhecimentos adicionados com sucesso!`,
      data: results,
    })
  } catch (error) {
    console.error("Erro ao fazer seed da base de conhecimento:", error)
    return NextResponse.json({ success: false, message: "Erro ao fazer seed da base de conhecimento" }, { status: 500 })
  }
}
