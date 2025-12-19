'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketCard from '@/components/market-card';

// Define the types for our data structure
interface Outcome {
  id: string;
  title: string;
  price: number;
}

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  resolveAt: string;
  outcomes: Outcome[];
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch('/api/markets');
        if (!response.ok) {
          throw new Error('Failed to fetch markets');
        }
        const data = await response.json();
        setMarkets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading markets...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Markets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <Link href={`/markets/${market.id}`} key={market.id}>
            <div className="cursor-pointer h-full">
              <MarketCard
                title={market.title}
                category={market.category}
                outcomes={market.outcomes}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
