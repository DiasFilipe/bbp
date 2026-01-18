'use client';

import { useState, useEffect, useMemo } from 'react';
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
  resolveAt: string;
  isResolved: boolean;
  outcomes: Outcome[];
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const categories = useMemo(
    () => [
      { value: 'all', label: 'Todas as Categorias' },
      { value: 'Fofoca Midiática', label: 'Fofoca Midiática' },
      { value: 'Futebol', label: 'Futebol' },
      { value: 'Política', label: 'Política' },
    ],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (category !== 'all') params.append('category', category);
        params.append('orderBy', orderBy);
        params.append('order', order);

        const response = await fetch(`/api/markets?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Falha ao carregar mercados');
        }
        const data = await response.json();
        setMarkets(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setError(error instanceof Error ? error.message : 'Erro ao carregar mercados');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search, category, orderBy, order]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Mercados em destaque</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Explore previsões recentes e acompanhe a atividade em tempo real.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Título ou descrição"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Ordenação
              </label>
              <div className="flex gap-2">
                <select
                  value={orderBy}
                  onChange={(event) => setOrderBy(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Mais recentes</option>
                  <option value="resolveAt">Resolução</option>
                </select>
                <select
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{markets.length} mercados encontrados</span>
            <button
              onClick={() => {
                setSearch('');
                setCategory('all');
                setOrderBy('createdAt');
                setOrder('desc');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && markets.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum mercado encontrado com os filtros selecionados.
              </p>
            </div>
          )}

          {!loading && !error && markets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {markets.map((market) => (
                <MarketCard
                  key={market.id}
                  title={market.title}
                  outcomes={market.outcomes}
                  category={market.category}
                  resolveAt={market.resolveAt}
                  isResolved={market.isResolved}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
