'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  createdAt: string;
  user: {
    name: string;
  };
  market: {
    id: string;
    title: string;
    category: string;
  };
  outcome: {
    title: string;
  };
}

export default function ActivityFeed() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/activity?limit=15');
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Atividade Recente</h2>
        <div className="text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span>📊</span> Atividade Recente
      </h2>

      {trades.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Nenhuma atividade recente
        </p>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => (
            <Link
              key={trade.id}
              href={`/markets/${trade.market.id}`}
              className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        trade.type === 'BUY'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {trade.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {trade.user.name}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {trade.shares} ações de "{trade.outcome.title}"
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {trade.market.title}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    R$ {(trade.shares * trade.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(trade.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
