import MarketCard from '@/components/market-card';
import type { Market, Outcome } from '@prisma/client';
import { GET } from './api/markets/route';

type MarketWithOutcomes = Market & {
  outcomes: Outcome[];
};

async function getMarkets(): Promise<MarketWithOutcomes[]> {
  try {
    const res = await GET();

    if (!res.ok) {
      throw new Error('Failed to fetch markets');
    }

    const markets = await res.json();
    return markets;
  } catch (error) {
    console.error(error);
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
