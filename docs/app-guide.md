# Guia da Aplicação - Mercado Preditivo

## 1. Visão do Produto

Plataforma de mercado preditivo para compra e venda de ações sobre eventos futuros, com foco em experiências simples e objetivas.

### Idioma

Toda a interface, comunicação e conteúdo devem estar em **português (Brasil)**.

### Temas Principais dos Mercados

1. **Fofoca Midiática:** influenciadores, celebridades e cultura pop.
2. **Futebol:** resultados de partidas, transferências e eventos do esporte.
3. **Política:** eleições, aprovação de leis e eventos do cenário político.

## 2. Domínio e Conceitos

- **Mercado (Market):** evento futuro negociável.
- **Resultado (Outcome):** opção de resultado de um mercado.
- **Trade:** compra ou venda de ações de um resultado.
- **Posição (Position):** quantidade de ações que um usuário possui em um resultado.
- **Resolução:** definição do resultado vencedor e pagamento dos vencedores.
- **Taxa:** percentual aplicado às operações de compra/venda.
- **Preço:** representa probabilidade; soma dos preços deve ser 1.0 por mercado.

## 3. Requisitos Funcionais

- **Mercados**
  - Criar mercados com dois ou mais resultados.
  - Listar mercados com busca, filtro por categoria e ordenação.
  - Exibir detalhes de mercado com estatísticas.
- **Negociação**
  - Comprar e vender ações com validações de saldo e posição.
  - Atualizar preços e shares com normalização.
- **Contas de Usuário**
  - Cadastro, login e sessão.
  - Saldo, posições e histórico de trades.
- **Resolução**
  - Resolução por criador do mercado ou admin.
  - Pagamento automático aos vencedores.

## 4. Requisitos Não-Funcionais

- **Segurança e Autorização**
  - Autenticação via NextAuth.
  - Restringir resolução a criador/admin.
- **Consistência**
  - Operações financeiras com transações.
  - Soma de preços = 1.0 após trades.
- **Performance**
  - Limites de paginação e carga.
- **Observabilidade**
  - Logs de erros em rotas críticas.

## 5. Arquitetura

- **Frontend:** Next.js App Router + React + Tailwind.
- **Backend:** Next.js API Routes + Prisma.
- **Banco:** PostgreSQL.
- **Autenticação:** NextAuth (credentials).

### Fluxos Principais

1. **Compra/Venda**
   - Validar sessão, saldo/posição, estado do mercado.
   - Criar trade, atualizar posição e preços.
2. **Resolução**
   - Validar autorização.
   - Marcar mercado como resolvido e pagar vencedores.

## 6. Modelo de Dados (Prisma)

### `User`

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String
  balance   Float     @default(1000.0)
  isAdmin   Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  markets   Market[]
  trades    Trade[]
  positions Position[]
}
```

### `Market`

```prisma
model Market {
  id                 String     @id @default(cuid())
  title              String
  description        String
  category           String
  creatorId          String
  creator            User       @relation(fields: [creatorId], references: [id])
  resolveAt          DateTime
  isResolved         Boolean    @default(false)
  resolvedOutcomeId  String?
  liquidityParameter Float      @default(100.0)
  outcomes           Outcome[]
  trades             Trade[]
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  resolvedOutcome    Outcome?   @relation("ResolvedMarket", fields: [resolvedOutcomeId], references: [id])
}
```

### `Outcome`

```prisma
model Outcome {
  id        String    @id @default(cuid())
  marketId  String
  market    Market    @relation(fields: [marketId], references: [id])
  title     String
  price     Float     @default(0.50)
  shares    Float     @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  positions Position[]
  winningMarket Market[] @relation("ResolvedMarket")
}
```

### `Trade`

```prisma
model Trade {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  marketId  String
  market    Market   @relation(fields: [marketId], references: [id])
  outcomeId String
  type      String
  shares    Float
  price     Float
  createdAt DateTime @default(now())
}
```

### `Position`

```prisma
model Position {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  outcomeId String
  outcome   Outcome  @relation(fields: [outcomeId], references: [id])
  shares    Float

  @@unique([userId, outcomeId])
}
```

## 7. APIs (Resumo)

- `GET /api/markets` (search, category, orderBy, order)
- `POST /api/markets`
- `GET /api/markets/[id]`
- `POST /api/markets/[id]/resolve`
- `POST /api/trade/buy`
- `POST /api/trade/sell`
- `GET /api/user/me`
- `GET /api/user/positions`
- `GET /api/user/trades`
- `GET /api/activity`

## 8. Frontend (Páginas)

- `/` Home
- `/markets` Listagem
- `/markets/[id]` Detalhe do mercado
- `/markets/create` Criação
- `/dashboard` Painel do usuário
- `/login` e `/signup`

## 9. Economia do Mercado

- Taxa de transação configurada em `src/lib/constants.ts`.
- Preços devem ser normalizados para soma 1.0 por mercado.
- Resolução paga 1 unidade por ação vencedora.

## 10. Testes

- Unit tests para rotas críticas de trade.
- Cobrir validações, autorização e cálculos.

## 11. Operação

- Variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`.
- Seeds e dados de desenvolvimento (quando existirem).
