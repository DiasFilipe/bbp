import MarketCard from '@/components/market-card';
import { markets } from '@/data/markets';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market) => (
          <MarketCard
            key={market.id}
            title={market.title}
            outcomes={market.outcomes}
            volume={market.volume}
            category={market.category}
          />
        ))}
      </div>
    </div>
  );
}
