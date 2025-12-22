# BBP - Mercado Preditivo Brasileiro

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.2-green)
![License](https://img.shields.io/badge/license-MIT-blue)

Plataforma de mercados preditivos focada em eventos brasileiros, similar ao Polymarket. Os usuários podem criar mercados, negociar ações de resultados e ganhar com suas previsões.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Rodar](#como-rodar)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O BBP (Brazilian Betting Platform) é uma plataforma de mercados preditivos onde usuários podem:

- **Criar mercados** sobre eventos futuros (Fofoca, Futebol, Política)
- **Negociar ações** de resultados possíveis
- **Ganhar dinheiro** quando suas previsões estão corretas
- **Acompanhar** seu portfólio e histórico de transações

### Categorias Principais

1. **Fofoca Midiática** - Eventos relacionados a influenciadores digitais, celebridades e cultura pop
2. **Futebol** - Resultados de partidas, transferências de jogadores
3. **Política** - Eleições, aprovação de leis, eventos políticos

## 🛠 Tecnologias

### Core

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Prisma 7.2](https://www.prisma.io/)** - ORM para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticação

### Estilização

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Suporte a dark mode

### Ferramentas de Desenvolvimento

- **[Jest](https://jestjs.io/)** - Testes unitários
- **[ESLint](https://eslint.org/)** - Linter
- **[Zod](https://zod.dev/)** - Validação de schemas

## ⚙️ Pré-requisitos

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **PostgreSQL** >= 14.x (ou serviço cloud como Railway, Neon, Supabase)
- **Git**

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/bbp.git
cd bbp
```

2. Instale as dependências:

```bash
npm install
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"

# NextAuth
NEXTAUTH_SECRET="seu-secret-aqui-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

#### Como gerar NEXTAUTH_SECRET:

```bash
openssl rand -hex 32
```

#### Opções para DATABASE_URL:

**Local:**
```
postgresql://postgres:senha@localhost:5432/bbp
```

**Railway:**
```
postgresql://postgres:senha@monorail.proxy.rlwy.net:porta/railway
```

**Neon/Supabase:**
Copie a connection string do dashboard do serviço

### 2. Banco de Dados

Execute as migrações do Prisma:

```bash
# Gerar o Prisma Client
npx prisma generate

# Sincronizar o schema com o banco (desenvolvimento)
npx prisma db push

# OU rodar migrações (produção)
npx prisma migrate deploy
```

### 3. Seed (Opcional)

Para popular o banco com dados de exemplo:

```bash
npx prisma db seed
```

## 🚀 Como Rodar

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build de Produção

```bash
npm run build
npm start
```

### Testes

```bash
# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## ✨ Funcionalidades

### ✅ Implementadas

- [x] **Autenticação**
  - Cadastro e login de usuários
  - Sessões com NextAuth.js
  - Proteção de rotas

- [x] **Mercados**
  - Criar mercados com múltiplos outcomes
  - Listar mercados com busca e filtros
  - Filtrar por categoria
  - Ordenar por data
  - Ver detalhes do mercado

- [x] **Trading**
  - Comprar ações de outcomes
  - Vender ações
  - Preços dinâmicos baseados em oferta/demanda
  - Transações atômicas (Prisma)

- [x] **Dashboard do Usuário**
  - Ver saldo disponível
  - Acompanhar posições ativas
  - Histórico de trades
  - Posições resolvidas (ganhos/perdas)

- [x] **Resolução de Mercados**
  - Criador do mercado pode resolver
  - Pagamento automático aos vencedores
  - Validação de autorização

- [x] **UI/UX**
  - Design responsivo
  - Dark mode
  - Feedback visual de ações

### 🔄 Em Desenvolvimento

- [ ] Sistema de notificações
- [ ] Melhorar algoritmo de precificação (LMSR)
- [ ] Taxas de transação
- [ ] Sistema de roles (Admin)
- [ ] Expandir cobertura de testes

## 📁 Estrutura do Projeto

```
bbp/
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   ├── migrations/          # Migrações
│   └── prisma.config.ts     # Configuração do Prisma 7
├── src/
│   ├── app/                 # App Router do Next.js
│   │   ├── api/            # API Routes
│   │   │   ├── auth/       # Autenticação
│   │   │   ├── markets/    # CRUD de mercados
│   │   │   ├── trade/      # Buy/Sell
│   │   │   └── user/       # Dados do usuário
│   │   ├── dashboard/      # Dashboard do usuário
│   │   ├── markets/        # Páginas de mercados
│   │   ├── login/          # Autenticação
│   │   └── page.tsx        # Home
│   ├── components/         # Componentes React
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── market-card.tsx
│   │   └── ...
│   ├── lib/                # Utilitários
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── env.ts          # Validação de env
│   └── types/              # Tipos TypeScript
├── public/                 # Assets estáticos
├── .env                    # Variáveis de ambiente (não commitado)
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🧪 Testes

Executamos testes usando Jest e React Testing Library.

### Rodar Todos os Testes

```bash
npm test
```

### Estrutura de Testes

```
src/
└── app/
    └── api/
        └── trade/
            └── buy/
                ├── route.ts
                └── route.test.ts
```

### Exemplo de Teste

```typescript
describe('POST /api/trade/buy', () => {
  it('should process a successful purchase', async () => {
    // ... test code
  });
});
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Railway

1. Crie um novo projeto
2. Adicione PostgreSQL
3. Configure variáveis de ambiente
4. Deploy

### Docker

```bash
docker build -t bbp .
docker run -p 3000:3000 bbp
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Inspirado no [Polymarket](https://polymarket.com/)
- Comunidade Next.js e Prisma
- Todos os contribuidores

---

**Feito com ❤️ por [Seu Nome]**
