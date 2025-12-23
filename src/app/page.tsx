'use client';

import { useState, useEffect } from 'react';
import MarketCard from '@/components/market-card';
import ActivityFeed from '@/components/activity-feed';

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
  outcomes: Outcome[];
}

const CATEGORIES = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'Fofoca', label: 'Fofoca Midiática' },
  { value: 'Futebol', label: 'Futebol' },
  { value: 'Política', label: 'Política' },
];

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderBy, setOrderBy] = useState('createdAt');

  useEffect(() => {
    fetchMarkets();
  }, [searchTerm, selectedCategory, orderBy]);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('orderBy', orderBy);
      params.append('order', 'desc');

      const response = await fetch(`/api/markets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar mercados por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Order By */}
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Mais Recentes</option>
            <option value="resolveAt">Data de Resolução</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? (
            'Carregando...'
          ) : (
            `${markets.length} mercado${markets.length !== 1 ? 's' : ''} encontrado${markets.length !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      {/* Main Content with Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Markets Section - Takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Carregando mercados...</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum mercado encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {markets.map((market) => (
                <MarketCard
                  key={market.id}
                  title={market.title}
                  outcomes={market.outcomes}
                  category={market.category}
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed - Takes 1/3 on large screens */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
