export interface Market {
  id: number;
  title: string;
  outcomes: { name: string; probability: number }[];
  volume: string;
  category: string;
}

export const markets: Market[] = [
  {
    id: 1,
    title: 'Will the Fed raise rates in the next meeting?',
    outcomes: [
      { name: 'Yes', probability: 0.32 },
      { name: 'No', probability: 0.68 },
    ],
    volume: '$1.2M',
    category: 'Finance',
  },
  {
    id: 2,
    title: 'Who will win the 2026 World Cup?',
    outcomes: [
      { name: 'Brazil', probability: 0.25 },
      { name: 'France', probability: 0.20 },
    ],
    volume: '$500K',
    category: 'Sports',
  },
  {
    id: 3,
    title: 'Will ETH reach $5,000 by the end of the year?',
    outcomes: [
      { name: 'Yes', probability: 0.75 },
      { name: 'No', probability: 0.25 },
    ],
    volume: '$3.8M',
    category: 'Crypto',
  },
    {
    id: 4,
    title: 'Will AI achieve AGI by 2030?',
    outcomes: [
      { name: 'Yes', probability: 0.40 },
      { name: 'No', probability: 0.60 },
    ],
    volume: '$2.1M',
    category: 'Technology',
  },
  {
    id: 5,
    title: 'Will the next election have a clear winner on election night?',
    outcomes: [
      { name: 'Yes', probability: 0.15 },
      { name: 'No', probability: 0.85 },
    ],
    volume: '$10.5M',
    category: 'Politics',
  },
];
