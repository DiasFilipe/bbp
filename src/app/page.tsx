import MarketCard from '@/components/market-card';
import type { Market, Outcome } from '@prisma/client';

type MarketWithOutcomes = Market & {
  outcomes: Outcome[];
};

async function getMarkets(): Promise<MarketWithOutcomes[]> {
  // In a real app, you'd fetch from your absolute URL
  // For server components, you can fetch directly from the API route
  // For simplicity here, we'll assume the app is running on localhost:3000
  // A better approach would be to use an environment variable for the base URL
  try {
    const res = await fetch('http://localhost:3000/api/markets', {
      cache: 'no-store', // Disable cache for development to see changes
    });

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
