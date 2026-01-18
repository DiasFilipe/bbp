'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  isResolved: boolean;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const categories = useMemo(
    () => [
      { label: 'Todas', value: 'all' },
      { label: 'Fofoca Midiática', value: 'Fofoca Midiática' },
      { label: 'Futebol', value: 'Futebol' },
      { label: 'Política', value: 'Política' },
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
        if (search.trim()) {
          params.set('search', search.trim());
        }
        if (category !== 'all') {
          params.set('category', category);
        }
        if (orderBy) {
          params.set('orderBy', orderBy);
        }
        if (order) {
          params.set('order', order);
        }

        const response = await fetch(`/api/markets?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Falha ao carregar mercados');
        }
        const data = await response.json();
        setMarkets(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Erro ao carregar mercados');
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mercados</h1>
          <p className="text-sm text-gray-500">Descubra previsões e oportunidades.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/markets/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Criar mercado
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Título ou descrição"
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

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center p-10 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="text-center p-10 text-gray-500">
          Nenhum mercado encontrado. Experimente ajustar os filtros.
        </div>
      )}

      {!loading && !error && markets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <Link href={`/markets/${market.id}`} key={market.id}>
              <div className="cursor-pointer h-full">
                <MarketCard
                  title={market.title}
                  category={market.category}
                  outcomes={market.outcomes}
                  resolveAt={market.resolveAt}
                  isResolved={market.isResolved}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
