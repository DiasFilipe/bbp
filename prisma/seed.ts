import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL not found in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter: adapter,
});

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Criar usuário de exemplo
  const hashedPassword = await hash('senha123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@bbp.com' },
    update: {},
    create: {
      email: 'admin@bbp.com',
      name: 'Admin BBP',
      password: hashedPassword,
      balance: 10000, // Saldo maior para criar mercados
    },
  });

  console.log('✅ Usuário admin criado:', user.email);

  // Mercados de Fofoca Midiática
  console.log('\n📱 Criando mercados de Fofoca...');

  const fofocaMarkets = [
    {
      title: 'Whindersson Nunes lançará novo stand-up em 2025?',
      description: 'Whindersson Nunes confirmará o lançamento de um novo especial de stand-up até 31/12/2025. Anúncio oficial nas redes sociais ou plataformas de streaming contam como confirmação.',
      category: 'Fofoca',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Anitta ganhará Grammy em 2026?',
      description: 'Anitta levará para casa pelo menos um prêmio Grammy na cerimônia de 2026. Qualquer categoria conta.',
      category: 'Fofoca',
      resolveAt: new Date('2026-02-10'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Casamento de Bruna Biancardi e Neymar até junho/2025?',
      description: 'Bruna Biancardi e Neymar Jr. oficializarão o casamento (civil ou religioso) até 30 de junho de 2025.',
      category: 'Fofoca',
      resolveAt: new Date('2025-06-30'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Virginia Fonseca terá mais um filho em 2025?',
      description: 'Virginia Fonseca anunciará ou terá mais um bebê durante o ano de 2025.',
      category: 'Fofoca',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Qual reality show terá maior audiência em 2025?',
      description: 'Entre BBB 25, A Fazenda 17 e outros reality shows brasileiros, qual terá a maior audiência média?',
      category: 'Fofoca',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['BBB 25', 'A Fazenda 17', 'Outro'],
    },
    {
      title: 'Luva de Pedreiro terá 30M de seguidores no Instagram até julho/2025?',
      description: 'O perfil do Luva de Pedreiro (@luva_de_pedreiro) alcançará 30 milhões de seguidores no Instagram até 31/07/2025.',
      category: 'Fofoca',
      resolveAt: new Date('2025-07-31'),
      outcomes: ['Sim', 'Não'],
    },
  ];

  for (const market of fofocaMarkets) {
    await prisma.market.create({
      data: {
        title: market.title,
        description: market.description,
        category: market.category,
        resolveAt: market.resolveAt,
        creatorId: user.id,
        outcomes: {
          create: market.outcomes.map((title) => ({ title })),
        },
      },
    });
  }

  console.log(`✅ ${fofocaMarkets.length} mercados de Fofoca criados`);

  // Mercados de Futebol
  console.log('\n⚽ Criando mercados de Futebol...');

  const futebolMarkets = [
    {
      title: 'Flamengo será campeão do Brasileirão 2025?',
      description: 'O Clube de Regatas do Flamengo conquistará o título do Campeonato Brasileiro de 2025.',
      category: 'Futebol',
      resolveAt: new Date('2025-12-15'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Palmeiras chegará na final da Libertadores 2025?',
      description: 'O Palmeiras se classificará para a final da Copa Libertadores da América de 2025.',
      category: 'Futebol',
      resolveAt: new Date('2025-11-30'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Brasil se classificará para a Copa do Mundo 2026?',
      description: 'A Seleção Brasileira garantirá vaga na Copa do Mundo de 2026 através das Eliminatórias.',
      category: 'Futebol',
      resolveAt: new Date('2025-11-20'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Neymar retornará ao Santos em 2025?',
      description: 'Neymar Jr. será oficialmente anunciado como jogador do Santos FC até 31/12/2025.',
      category: 'Futebol',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Qual time paulista terminará melhor no Brasileirão 2025?',
      description: 'Entre os 4 grandes de São Paulo, qual terminará em melhor posição no Brasileirão 2025?',
      category: 'Futebol',
      resolveAt: new Date('2025-12-15'),
      outcomes: ['Corinthians', 'Palmeiras', 'São Paulo', 'Santos'],
    },
    {
      title: 'Dorival Júnior continuará como técnico da Seleção até a Copa 2026?',
      description: 'Dorival Júnior permanecerá como treinador da Seleção Brasileira até o início da Copa do Mundo 2026.',
      category: 'Futebol',
      resolveAt: new Date('2026-06-01'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Vinicius Jr. ganhará a Bola de Ouro em 2025?',
      description: 'Vinicius Junior, do Real Madrid, será premiado com a Bola de Ouro France Football em 2025.',
      category: 'Futebol',
      resolveAt: new Date('2025-10-31'),
      outcomes: ['Sim', 'Não'],
    },
  ];

  for (const market of futebolMarkets) {
    await prisma.market.create({
      data: {
        title: market.title,
        description: market.description,
        category: market.category,
        resolveAt: market.resolveAt,
        creatorId: user.id,
        outcomes: {
          create: market.outcomes.map((title) => ({ title })),
        },
      },
    });
  }

  console.log(`✅ ${futebolMarkets.length} mercados de Futebol criados`);

  // Mercados de Política
  console.log('\n🏛️  Criando mercados de Política...');

  const politicaMarkets = [
    {
      title: 'Lula completará seu mandato até 2026?',
      description: 'O presidente Luiz Inácio Lula da Silva permanecerá no cargo até o final de seu mandato em 31/12/2026.',
      category: 'Política',
      resolveAt: new Date('2026-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Reforma Tributária será totalmente implementada em 2025?',
      description: 'A Reforma Tributária aprovada pelo Congresso será completamente regulamentada e implementada até 31/12/2025.',
      category: 'Política',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Bolsonaro será condenado e ficará inelegível?',
      description: 'Jair Bolsonaro será condenado em processo judicial e declarado inelegível antes das eleições de 2026.',
      category: 'Política',
      resolveAt: new Date('2026-06-30'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Brasil entrará na OCDE em 2025?',
      description: 'O Brasil será oficialmente aceito como membro da Organização para a Cooperação e Desenvolvimento Econômico (OCDE) em 2025.',
      category: 'Política',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Salário mínimo ultrapassará R$ 1.500 em 2025?',
      description: 'O salário mínimo nacional será reajustado para valor igual ou superior a R$ 1.500,00 durante o ano de 2025.',
      category: 'Política',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
    {
      title: 'Quem será o candidato mais forte da direita em 2026?',
      description: 'Entre os possíveis candidatos de direita, quem liderará as pesquisas até junho de 2026?',
      category: 'Política',
      resolveAt: new Date('2026-06-30'),
      outcomes: ['Bolsonaro', 'Tarcísio de Freitas', 'Ronaldo Caiado', 'Outro'],
    },
    {
      title: 'Haverá aprovação da PEC das praias em 2025?',
      description: 'A PEC que trata da privatização ou regulamentação de terrenos de marinha será aprovada pelo Congresso em 2025.',
      category: 'Política',
      resolveAt: new Date('2025-12-31'),
      outcomes: ['Sim', 'Não'],
    },
  ];

  for (const market of politicaMarkets) {
    await prisma.market.create({
      data: {
        title: market.title,
        description: market.description,
        category: market.category,
        resolveAt: market.resolveAt,
        creatorId: user.id,
        outcomes: {
          create: market.outcomes.map((title) => ({ title })),
        },
      },
    });
  }

  console.log(`✅ ${politicaMarkets.length} mercados de Política criados`);

  console.log('\n✨ Seed concluído com sucesso!');
  console.log(`\n📊 Total de mercados criados: ${fofocaMarkets.length + futebolMarkets.length + politicaMarkets.length}`);
  console.log('\n👤 Credenciais de login:');
  console.log('   Email: admin@bbp.com');
  console.log('   Senha: senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
