import React from 'react';

interface MarketCardProps {
  title: string;
  outcomes: { title: string; price: number }[];
  category: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ title, outcomes, category }) => {
  return (
    <div className="bg-gray-50 dark:bg-pm-light-dark border border-gray-200 dark:border-pm-light-gray rounded-lg p-4 flex flex-col justify-between h-full">
      <div>
        <p className="text-xs text-gray-500 dark:text-pm-gray mb-1">{category}</p>
        <h3 className="text-base font-bold mb-4">{title}</h3>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-semibold">{outcome.title}</span>
              <span className={`text-lg font-bold ${index === 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                {Math.round(outcome.price * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
