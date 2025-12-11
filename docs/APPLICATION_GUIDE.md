# Guia da Aplicação - Mercado Preditivo

Este documento serve como um guia para o desenvolvimento do nosso site de mercado preditivo, similar ao Polymarket.

## Visão Geral

A plataforma permitirá que os usuários comprem e vendam ações de resultados de eventos futuros. O preço das ações refletirá a probabilidade percebida do resultado de um evento.

## Temas Principais dos Mercados

Para manter o foco inicial, nosso mercado de previsões se concentrará majoritariamente em três temas:

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
*   **pdf-parse:** Biblioteca para parsing de documentos PDF.

## Próximos Passos

1.  **Atualizar o `schema.prisma`:** Copiar e colar esses modelos no arquivo `prisma/schema.prisma`.
2.  **Executar a Migração do Prisma:** Rodar `npx prisma migrate dev --name init` para criar as tabelas no banco de dados.
3.  **Desenvolver a Lógica de Negociação:** Implementar as funções para comprar e vender ações, atualizando os preços e as posições dos usuários.

