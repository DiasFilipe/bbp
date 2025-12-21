import MarketCard from '@/components/market-card';
import type { Market, Outcome } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // Import prisma directly

type MarketWithOutcomes = Market & {
  outcomes: Outcome[];
};

// This function now fetches data directly from the database
async function getMarkets(): Promise<MarketWithOutcomes[]> {
  try {
    const markets = await prisma.market.findMany({
      include: {
        outcomes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return markets;
  } catch (error) {
    console.error('Error fetching markets directly:', error);
    return []; // Return an empty array on error
  }
}

export default async function Home() {
  const markets = await getMarkets();

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market) => (
          <MarketCard
            key={market.id}
            title={market.title}
            outcomes={market.outcomes}
            category={market.category}
          />
        ))}
      </div>
    </div>
  );
}
