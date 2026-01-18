import React from 'react';

interface MarketCardProps {
  title: string;
  outcomes: { title: string; price: number }[];
  category: string;
  resolveAt?: string;
  isResolved?: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({
  title,
  outcomes,
  category,
  resolveAt,
  isResolved = false,
}) => {
  const formattedResolveAt = resolveAt
    ? new Date(resolveAt).toLocaleDateString('pt-BR')
    : 'Sem data';

  return (
    <div className="bg-gray-50 dark:bg-pm-light-dark border border-gray-200 dark:border-pm-light-gray rounded-lg p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-pm-gray mb-2">
        <span className="uppercase tracking-wide">{category}</span>
        <span
          className={`px-2 py-0.5 rounded-full font-semibold ${
            isResolved
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {isResolved ? 'Resolvido' : 'Aberto'}
        </span>
      </div>
      <h3 className="text-base font-bold mb-4">{title}</h3>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-pm-gray mb-3">
        <span>Resolução</span>
        <span className="font-medium text-gray-700 dark:text-gray-200">{formattedResolveAt}</span>
      </div>
      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-semibold">{outcome.title}</span>
            <span className={`text-sm font-bold ${index === 0 ? 'text-pm-green' : 'text-pm-red'}`}>
              {Math.round(outcome.price * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketCard;
