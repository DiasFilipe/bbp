'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string | null;
  balance: number;
  createdAt: string;
}

interface Position {
  id: string;
  shares: number;
  currentValue: number;
  potentialPayout: number;
  outcome: {
    id: string;
    title: string;
    price: number;
    market: {
      id: string;
      title: string;
      isResolved: boolean;
      resolvedOutcomeId: string | null;
    };
  };
}

interface Trade {
  id: string;
  type: string;
  shares: number;
  price: number;
  totalCost: number;
  outcomeTitle: string;
  createdAt: string;
  market: {
    id: string;
    title: string;
    isResolved: boolean;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const [userRes, positionsRes, tradesRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/positions'),
        fetch('/api/user/trades?limit=20'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setTrades(tradesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalInvested = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const activePositions = positions.filter((pos) => !pos.outcome.market.isResolved);
  const resolvedPositions = positions.filter((pos) => pos.outcome.market.isResolved);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* User Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Disponível</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              R$ {user.balance.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Investido</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              R$ {totalInvested.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Posições Ativas</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {activePositions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'positions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
            >
              Posições ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trades'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
            >
              Histórico de Trades ({trades.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {positions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Você ainda não tem posições. Comece a negociar!
              </p>
            </div>
          ) : (
            <>
              {/* Active Positions */}
              {activePositions.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-3">Posições Ativas</h2>
                  {activePositions.map((position) => (
                    <div
                      key={position.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/markets/${position.outcome.market.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {position.outcome.market.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Resultado: {position.outcome.title}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span>
                              <span className="text-gray-500">Ações:</span>{' '}
                              <span className="font-medium">{position.shares}</span>
                            </span>
                            <span>
                              <span className="text-gray-500">Preço atual:</span>{' '}
                              <span className="font-medium">
                                {Math.round(position.outcome.price * 100)}¢
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Valor Atual</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            R$ {position.currentValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Potencial: R$ {position.potentialPayout.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Resolved Positions */}
              {resolvedPositions.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-3 mt-6">Posições Resolvidas</h2>
                  {resolvedPositions.map((position) => {
                    const isWinner =
                      position.outcome.market.resolvedOutcomeId === position.outcome.id;
                    return (
                      <div
                        key={position.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${
                          isWinner
                            ? 'border-green-500'
                            : 'border-red-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {position.outcome.market.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Resultado: {position.outcome.title}
                            </p>
                            <div className="flex gap-4 text-sm">
                              <span>
                                <span className="text-gray-500">Ações:</span>{' '}
                                <span className="font-medium">{position.shares}</span>
                              </span>
                              <span
                                className={`font-medium ${
                                  isWinner ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {isWinner ? '✓ Vencedor' : '✗ Perdedor'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isWinner ? 'Ganho' : 'Perdido'}
                            </p>
                            <p
                              className={`text-xl font-bold ${
                                isWinner
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              R$ {isWinner ? position.potentialPayout.toFixed(2) : '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Você ainda não realizou nenhuma transação.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mercado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {new Date(trade.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                        <div className="max-w-xs truncate">{trade.market.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                        {trade.outcomeTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trade.type === 'BUY'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {trade.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {trade.shares}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {Math.round(trade.price * 100)}¢
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                        R$ {trade.totalCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
