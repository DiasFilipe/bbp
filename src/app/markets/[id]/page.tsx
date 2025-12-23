'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmModal from '@/components/confirm-modal';

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
  resolvedOutcomeId?: string | null;
  statistics?: {
    totalVolume: number;
    uniqueTraders: number;
    totalShares: number;
    marketCap: number;
    totalTrades: number;
  };
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeShares, setTradeShares] = useState<{ [key: string]: number }>({});
  const [tradingOutcome, setTradingOutcome] = useState<string | null>(null);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<{
    type: 'BUY' | 'SELL';
    outcomeId: string;
    shares: number;
    price: number;
    total: number;
    fee: number;
    finalAmount: number;
  } | null>(null);

  // State for resolution
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const fetchMarket = async () => {
    if (id) {
      try {
        const response = await fetch(`/api/markets/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch market details');
        }
        const data = await response.json();
        setMarket(data);
        // Set default winner for the select input
        if (data.outcomes && data.outcomes.length > 0) {
          setSelectedWinner(data.outcomes[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [id]);

  const handleTrade = async (type: 'BUY' | 'SELL', outcomeId: string) => {
    const shares = tradeShares[outcomeId];

    if (!shares || shares <= 0) {
      toast.error('Por favor, insira uma quantidade válida de ações.');
      return;
    }

    // Find the outcome to get its price
    const outcome = market?.outcomes.find(o => o.id === outcomeId);
    if (!outcome) return;

    const TRANSACTION_FEE_RATE = 0.02; // 2% fee
    const subtotal = shares * outcome.price;
    const fee = subtotal * TRANSACTION_FEE_RATE;
    const finalAmount = type === 'BUY' ? subtotal + fee : subtotal - fee;

    const CONFIRMATION_THRESHOLD = 50; // Confirm trades above R$ 50

    // Show confirmation modal for large trades
    if (subtotal >= CONFIRMATION_THRESHOLD) {
      setPendingTrade({
        type,
        outcomeId,
        shares,
        price: outcome.price,
        total: subtotal,
        fee,
        finalAmount,
      });
      setShowConfirmModal(true);
      return;
    }

    // Execute small trades directly
    await executeTrade(type, outcomeId, shares);
  };

  const executeTrade = async (type: 'BUY' | 'SELL', outcomeId: string, shares: number) => {
    setTradingOutcome(`${type}-${outcomeId}`);
    try {
      const endpoint = type === 'BUY' ? '/api/trade/buy' : '/api/trade/sell';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeId, shares }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Falha ao ${type === 'BUY' ? 'comprar' : 'vender'}.`);
      }

      // Success feedback
      const action = type === 'BUY' ? 'compradas' : 'vendidas';
      toast.success(
        `${shares} ações ${action} com sucesso! Novo saldo: R$ ${result.balance?.toFixed(2) || 'N/A'}`
      );

      // Clear the input for this outcome
      setTradeShares(prev => ({ ...prev, [outcomeId]: 0 }));

      // Refresh market data to show updated prices
      await fetchMarket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setTradingOutcome(null);
    }
  };

  const handleConfirmTrade = async () => {
    if (!pendingTrade) return;

    await executeTrade(pendingTrade.type, pendingTrade.outcomeId, pendingTrade.shares);
    setShowConfirmModal(false);
    setPendingTrade(null);
  };

  const handleSharesChange = (outcomeId: string, value: string) => {
    const numValue = parseInt(value, 10);
    setTradeShares(prev => ({
      ...prev,
      [outcomeId]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleResolveMarket = async () => {
    if (!selectedWinner) {
      toast.error('Por favor, selecione um resultado vencedor.');
      return;
    }
    setIsResolving(true);
    try {
      const response = await fetch(`/api/markets/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningOutcomeId: selectedWinner }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao resolver mercado.');
      }
      toast.success('Mercado resolvido com sucesso!');
      // Refresh market data to show resolved state
      await fetchMarket();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setIsResolving(false);
    }
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

      {/* Market Statistics */}
      {market.statistics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 mb-6 border border-blue-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> Estatísticas do Mercado
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume Total</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                R$ {market.statistics.totalVolume.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Traders</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {market.statistics.uniqueTraders}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Negociações</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {market.statistics.totalTrades}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ações em Circulação</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {market.statistics.totalShares.toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                R$ {market.statistics.marketCap.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {market.outcomes.map(outcome => (
          <div key={outcome.id} className={`bg-gray-50 dark:bg-pm-light-dark border rounded-lg p-4 ${market.isResolved && market.resolvedOutcomeId === outcome.id ? 'border-green-500 border-2' : 'border-gray-200 dark:border-pm-light-gray'}`}>
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
                  disabled={tradingOutcome !== null}
                  className="bg-pm-green text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-opacity-50 disabled:cursor-not-allowed transition"
                >
                  {tradingOutcome === `BUY-${outcome.id}` ? 'Comprando...' : 'Comprar'}
                </button>
                <button
                  onClick={() => handleTrade('SELL', outcome.id)}
                  disabled={tradingOutcome !== null}
                  className="bg-pm-red text-white font-bold py-2 px-4 rounded hover:bg-red-600 disabled:bg-opacity-50 disabled:cursor-not-allowed transition"
                >
                  {tradingOutcome === `SELL-${outcome.id}` ? 'Vendendo...' : 'Vender'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolution Section */}
      {!market.isResolved && (
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold mb-4">Resolve Market (Admin)</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedWinner}
              onChange={(e) => setSelectedWinner(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
            >
              {market.outcomes.map(o => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
            <button
              onClick={handleResolveMarket}
              disabled={isResolving}
              className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-opacity-50 transition"
            >
              {isResolving ? 'Resolvendo...' : 'Resolver Mercado'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingTrade(null);
        }}
        onConfirm={handleConfirmTrade}
        title="Confirmar Operação"
        message={
          pendingTrade
            ? `Você está prestes a ${
                pendingTrade.type === 'BUY' ? 'comprar' : 'vender'
              } ${pendingTrade.shares} ações.\n\nSubtotal: R$ ${pendingTrade.total.toFixed(2)}\nTaxa (2%): R$ ${pendingTrade.fee.toFixed(2)}\n${pendingTrade.type === 'BUY' ? 'Total a pagar' : 'Total a receber'}: R$ ${pendingTrade.finalAmount.toFixed(2)}\n\nDeseja continuar?`
            : ''
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        type={pendingTrade?.type === 'BUY' ? 'info' : 'warning'}
        isLoading={tradingOutcome !== null}
      />
    </div>
  );
}
