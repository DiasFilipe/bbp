# Guia da Aplicação - Mercado Preditivo

Este documento serve como um guia para o desenvolvimento do nosso site de mercado preditivo, similar ao Polymarket.

## Visão Geral

A plataforma permitirá que os usuários comprem e vendam ações de resultados de eventos futuros. O preço das ações refletirá a probabilidade percebida do resultado de um evento.

### Idioma

Toda a interface do usuário, comunicação e conteúdo do site devem ser apresentados em **português (Brasil)**.

## Temas Principais dos Mercados

Para manter o foco inicial, nosso mercado de previsões se concentrará majoritariamente nos três temas a seguir. A criação de novos mercados deve aderir a estas categorias.

1.  **Fofoca Midiática:** Eventos relacionados a influenciadores digitais, celebridades e cultura pop.
2.  **Futebol:** Resultados de partidas, transferências de jogadores e outros eventos relacionados ao mundo do futebol.
3.  **Política:** Resultados de eleições, aprovação de leis e outros eventos do cenário político.

## Funcionalidades Principais

1.  **Mercados (Markets):** Eventos sobre os quais os usuários podem negociar.
2.  **Resultados (Outcomes):** Os possíveis resultados de um mercado. (Ex: "Sim" ou "Não").
3.  **Negociação (Trading):** Usuários podem comprar e vender ações de resultados.
4.  **Contas de Usuário (User Accounts):** Para gerenciar fundos, posições e histórico.
5.  **Resolução de Mercado (Market Resolution):** O processo de determinar o resultado final de um evento e pagar os detentores de ações vencedoras.

## Modelos de Dados (Esquema Prisma)

Com base nas funcionalidades acima, podemos definir os seguintes modelos de dados no nosso arquivo `prisma/schema.prisma`.

### `User`

Representa um usuário na plataforma.

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String    // Em um cenário real, isso seria um hash
  balance   Float     @default(1000.0) // Saldo inicial para negociação
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  trades    Trade[]
  positions Position[]
}
```

### `Market`

Representa um evento futuro que pode ser negociado.

```prisma
model Market {
  id          String     @id @default(cuid())
  title       String
  description String
  resolveAt   DateTime   // Data em que o mercado será resolvido
  isResolved  Boolean    @default(false)
  resolvedOutcomeId String?    // ID do resultado vencedor
  outcomes    Outcome[]
  trades      Trade[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  resolvedOutcome   Outcome?   @relation("ResolvedMarket", fields: [resolvedOutcomeId], references: [id])
}
```

### `Outcome`

Representa um possível resultado de um mercado.

```prisma
model Outcome {
  id        String    @id @default(cuid())
  marketId  String
  market    Market    @relation(fields: [marketId], references: [id])
  title     String    // Ex: "Sim", "Não", "Candidato A"
  price     Float     @default(0.50) // Preço atual do resultado
  shares    Float     @default(0)    // Total de ações em circulação
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  positions Position[]
  winningMarket Market[] @relation("ResolvedMarket")
}
```

### `Trade`

Representa uma única transação de compra ou venda.

```prisma
model Trade {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  marketId  String
  market    Market   @relation(fields: [marketId], references: [id])
  outcomeId String
  // outcome   Outcome  @relation(fields: [outcomeId], references: [id]) // Prisma não permite múltiplas relações em cascata no mesmo caminho
  type      String   // "BUY" ou "SELL"
  shares    Float
  price     Float    // Preço por ação no momento da transação
  createdAt DateTime @default(now())
}
```

### `Position`

Representa as ações que um usuário possui para um determinado resultado.

```prisma
model Position {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  outcomeId String
  outcome   Outcome  @relation(fields: [outcomeId], references: [id])
  shares    Float    // Quantidade de ações que o usuário possui

  @@unique([userId, outcomeId])
}
```

## Tecnologias Utilizadas

A seguir, a stack tecnológica principal utilizada neste projeto:

*   **Next.js:** Framework React para construção de aplicações web.
*   **React:** Biblioteca JavaScript para construção de interfaces de usuário.
*   **TypeScript:** Linguagem de programação que adiciona tipagem estática ao JavaScript.
*   **Prisma:** ORM (Object-Relational Mapper) para interagir com o banco de dados.
*   **Tailwind CSS:** Framework CSS utility-first para estilização rápida e responsiva.
*   **NextAuth.js:** Solução completa de autenticação para aplicações Next.js.
*   **Google Generative AI:** Integração com modelos de inteligência artificial generativa do Google.
*   **ioredis:** Cliente Redis de alto desempenho para caching e outras funcionalidades.

## Melhorias Importantes e Próximos Passos Sugeridos

Com base na análise do código atual e nas melhores práticas, aqui estão algumas áreas-chave para melhoria e desenvolvimento futuro:

### 1. Segurança e Autorização (Prioridade Alta)

*   **Corrigir Autorização na Resolução de Mercados:** Atualmente, qualquer usuário autenticado pode resolver qualquer mercado. É crucial modificar o modelo `Market` para incluir um `creatorId` (ID do usuário que criou o mercado) e, na rota de resolução, verificar se o usuário logado é o criador do mercado ou um administrador.
*   **Implementar Papéis de Usuário (Admin):** Introduzir um sistema de controle de acesso baseado em papéis (RBAC). Adicionar um campo como `isAdmin: Boolean` ao modelo `User` permitiria restringir funcionalidades sensíveis a administradores.

### 2. Lógica Econômica e Funcionalidades Core (Prioridade Média-Alta)

*   **Melhorar a Lógica de Preços:** A mecânica atual de ajuste de preços é muito simplificada. Para um mercado de previsão mais realista e eficiente, considere implementar um **criador de mercado automatizado (AMM)** baseado em regras de pontuação (como LMSR - Logarithmic Market Scoring Rule). Isso garante que os preços reflitam probabilidades de forma mais precisa e que a plataforma mantenha a neutralidade financeira.
*   **Adicionar Taxas de Transação:** Introduzir uma pequena taxa sobre as operações de compra e venda. Isso pode gerar receita para a plataforma ou cobrir custos operacionais.
*   **Refinar o Balanço Financeiro:** Em sistemas de mercado de previsão, é comum que as ações de resultados perdedores se tornem sem valor. Adicionar uma etapa na resolução do mercado para "limpar" ou desativar essas posições para os usuários, após o pagamento dos vencedores.

### 3. Experiência do Usuário (UX) e Features (Prioridade Média)

*   **Dashboard do Usuário Completo:** Criar uma página de painel para o usuário onde ele possa visualizar de forma clara:
    *   Seu saldo atual.
    *   Todas as suas posições abertas em diferentes mercados.
    *   Um histórico detalhado de suas transações (compras, vendas, ganhos de resolução).
*   **Melhorar a Descoberta de Mercados:** Implementar funcionalidades avançadas na página de listagem de mercados, como:
    *   Funcionalidade de busca por título ou descrição.
    *   Filtros por categoria (Fofoca, Futebol, Política, etc.).
    *   Opções de ordenação (por data de criação, data de resolução, volume de negociação).
*   **Sistema de Notificações:** Desenvolver um sistema de notificações para alertar os usuários sobre eventos importantes, como:
    *   Mercados em que participaram foram resolvidos.
    *   Resultados de transações importantes.

### 4. Melhorias Técnicas e Refatoração (Prioridade Média-Baixa)

*   **Consolidar Definições de Tipos:** Centralizar as interfaces de tipos (para `Market`, `Outcome`, `User`, etc.) em um arquivo ou módulo, usando os tipos gerados pelo Prisma, para evitar duplicação e garantir a consistência em todo o frontend e backend.
*   **Cliente de API Centralizado:** Refatorar as chamadas de API (`fetch`) no frontend para usar um cliente de API centralizado ou ganchos (hooks) personalizados. Isso melhora a manutenibilidade, a capacidade de reutilização do código e pode adicionar funcionalidades como cache ou tratamento global de erros.
*   **Validação de Variáveis de Ambiente:** Utilizar uma biblioteca de validação (ex: Zod) para garantir que todas as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.) estejam presentes e formatadas corretamente na inicialização da aplicação.
