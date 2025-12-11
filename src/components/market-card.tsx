import React from 'react';

interface MarketCardProps {
  title: string;
  outcomes: { name: string; probability: number }[];
  volume: string;
  category: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ title, outcomes, volume, category }) => {
  return (
    <div className="bg-pm-light-dark border border-pm-light-gray rounded-lg p-4 flex flex-col justify-between h-full">
      <div>
        <p className="text-xs text-pm-gray mb-1">{category}</p>
        <h3 className="text-base font-bold text-white mb-4">{title}</h3>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-semibold">{outcome.name}</span>
              <span className={`text-lg font-bold ${index === 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                {Math.round(outcome.probability * 100)}%
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-pm-gray">
          <span>Volume:</span>
          <span className="font-semibold ml-1">{volume}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
