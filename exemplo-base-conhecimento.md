# Como Resetar Senha do Cliente

## Visão Geral
Este documento descreve o processo completo para resetar a senha de um cliente no sistema.

## Pré-requisitos
- Acesso ao painel administrativo
- E-mail do cliente cadastrado no sistema
- Cliente deve ter acesso ao e-mail cadastrado

## Passo a Passo

### 1. Acessar o Painel Admin
1. Entre no painel em `https://app.exemplo.com/admin`
2. Use suas credenciais de administrador
3. Navegue até **Clientes** > **Gerenciar**

### 2. Localizar o Cliente
- Use a barra de busca para encontrar o cliente
- Pode buscar por:
  - Nome completo
  - E-mail
  - CPF/CNPJ
  - ID do cliente

### 3. Resetar a Senha
1. Clique no botão **Ações** ao lado do cliente
2. Selecione **Resetar Senha**
3. Confirme a ação no modal que aparecerá
4. Sistema enviará e-mail automático com link de reset

### 4. Informações do E-mail
O cliente receberá um e-mail contendo:
- Link temporário (válido por 24 horas)
- Instruções para criar nova senha
- Link para suporte caso tenha problemas

## Requisitos da Nova Senha
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

## Problemas Comuns

### Cliente não recebeu o e-mail
1. Verificar pasta de spam
2. Confirmar e-mail cadastrado está correto
3. Reenviar e-mail após 5 minutos
4. Verificar se domínio não está bloqueado

### Link expirado
- Links expiram em 24 horas
- Necessário gerar novo link
- Cliente pode solicitar diretamente na tela de login

## Observações Importantes
- **Segurança**: Nunca compartilhe links de reset via chat ou telefone
- **Logs**: Todas ações de reset são registradas no sistema
- **Limite**: Máximo 3 tentativas de reset por dia por cliente

## Contato Suporte Técnico
Se problemas persistirem:
- E-mail: suporte@exemplo.com
- Chat interno: #suporte-tecnico
- Documentação técnica: wiki.interno/senha-reset
