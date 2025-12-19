'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Types
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
  isResolved: boolean;
}

export default function MarketDetailPage() {
  const params = useParams();
  const { id } = params;

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeShares, setTradeShares] = useState<{ [key: string]: number }>({});
  const [tradeFeedback, setTradeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchMarket() {
        try {
          const response = await fetch(`/api/markets/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch market details');
          }
          const data = await response.json();
          setMarket(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
      fetchMarket();
    }
  }, [id]);

  const handleTrade = async (type: 'BUY' | 'SELL', outcomeId: string) => {
    const shares = tradeShares[outcomeId];
    if (!shares || shares <= 0) {
      setTradeFeedback('Please enter a valid number of shares.');
      return;
    }

    setTradeFeedback('Processing transaction...');

    try {
      const response = await fetch(`/api/trade/${type.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeId, shares }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Trade failed');
      }

      setTradeFeedback(`${type} successful!`);
      // Optionally, refresh user balance or market data here
    } catch (err) {
      setTradeFeedback(err instanceof Error ? `Error: ${err.message}` : 'An unknown trade error occurred');
    }
  };

  const handleSharesChange = (outcomeId: string, value: string) => {
    setTradeShares(prev => ({
      ...prev,
      [outcomeId]: Number(value),
    }));
  };

  if (loading) {
    return <div className="text-center p-10">Loading market details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!market) {
    return <div className="text-center p-10">Market not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <p className="text-sm text-gray-500 dark:text-pm-gray mb-2">{market.category}</p>
      <h1 className="text-3xl font-bold mb-2">{market.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{market.description}</p>

      {market.isResolved && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Market Resolved</p>
          <p>This market has been resolved and is no longer available for trading.</p>
        </div>
      )}

      <div className="space-y-4">
        {market.outcomes.map(outcome => (
          <div key={outcome.id} className="bg-gray-50 dark:bg-pm-light-dark border border-gray-200 dark:border-pm-light-gray rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{outcome.title}</h3>
              <span className="text-2xl font-bold text-pm-green">{Math.round(outcome.price * 100)}¢</span>
            </div>
            {!market.isResolved && (
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  placeholder="Shares"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={tradeShares[outcome.id] || ''}
                  onChange={e => handleSharesChange(outcome.id, e.target.value)}
                />
                <button
                  onClick={() => handleTrade('BUY', outcome.id)}
                  className="bg-pm-green text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleTrade('SELL', outcome.id)}
                  className="bg-pm-red text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition"
                >
                  Sell
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {tradeFeedback && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
          <p>{tradeFeedback}</p>
        </div>
      )}
    </div>
  );
}
