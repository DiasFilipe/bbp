/**
 * Unit tests for LMSR pricing functions
 */

import {
  calculateCost,
  calculatePrices,
  calculateBuyCost,
  calculateSellProceeds,
  getUpdatedPrices,
} from './lmsr';
import { normalizePrices, validatePriceSum, getPriceDeviation } from './normalize';

describe('LMSR Functions', () => {
  describe('calculatePrices', () => {
    test('prices sum to 1.0 for binary market', () => {
      const prices = calculatePrices([10, 20], 100);
      const sum = prices.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('prices sum to 1.0 for multi-outcome market', () => {
      const prices = calculatePrices([5, 10, 15, 20], 100);
      const sum = prices.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('equal shares give equal prices', () => {
      const prices = calculatePrices([10, 10, 10], 100);
      prices.forEach(p => expect(p).toBeCloseTo(1/3, 5));
    });

    test('higher shares give higher prices', () => {
      const prices = calculatePrices([30, 10], 100);
      expect(prices[0]).toBeGreaterThan(prices[1]);
    });

    test('zero shares give equal probabilities', () => {
      const prices = calculatePrices([0, 0], 100);
      expect(prices[0]).toBeCloseTo(0.5, 10);
      expect(prices[1]).toBeCloseTo(0.5, 10);
    });

    test('handles large share quantities', () => {
      const prices = calculatePrices([1000, 2000, 500], 100);
      const sum = prices.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    test('handles very small share quantities', () => {
      const prices = calculatePrices([0.1, 0.2, 0.3], 100);
      const sum = prices.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    test('throws error for invalid liquidity parameter', () => {
      expect(() => calculatePrices([10, 20], 0)).toThrow();
      expect(() => calculatePrices([10, 20], -10)).toThrow();
    });

    test('returns empty array for empty input', () => {
      const prices = calculatePrices([], 100);
      expect(prices).toEqual([]);
    });
  });

  describe('calculateCost', () => {
    test('cost increases with more shares', () => {
      const cost1 = calculateCost([10, 10], 100);
      const cost2 = calculateCost([20, 20], 100);
      expect(cost2).toBeGreaterThan(cost1);
    });

    test('cost is same for permutations with equal totals', () => {
      const cost1 = calculateCost([10, 20], 100);
      const cost2 = calculateCost([20, 10], 100);
      expect(cost1).toBeCloseTo(cost2, 5);
    });

    test('handles zero shares', () => {
      const cost = calculateCost([0, 0], 100);
      expect(cost).toBeGreaterThan(0);
    });

    test('throws error for invalid liquidity parameter', () => {
      expect(() => calculateCost([10, 20], 0)).toThrow();
      expect(() => calculateCost([10, 20], -10)).toThrow();
    });
  });

  describe('calculateBuyCost', () => {
    test('buying costs money', () => {
      const cost = calculateBuyCost([10, 10], 0, 5, 100);
      expect(cost).toBeGreaterThan(0);
    });

    test('buying more shares costs more', () => {
      const cost1 = calculateBuyCost([10, 10], 0, 5, 100);
      const cost2 = calculateBuyCost([10, 10], 0, 10, 100);
      expect(cost2).toBeGreaterThan(cost1);
    });

    test('cost is similar across outcomes for equal shares', () => {
      const cost1 = calculateBuyCost([10, 10], 0, 5, 100);
      const cost2 = calculateBuyCost([10, 10], 1, 5, 100);
      expect(cost1).toBeCloseTo(cost2, 5);
    });

    test('buying favored outcome costs more', () => {
      const cost1 = calculateBuyCost([30, 10], 0, 5, 100);
      const cost2 = calculateBuyCost([30, 10], 1, 5, 100);
      expect(cost1).toBeGreaterThan(cost2);
    });

    test('higher liquidity parameter reduces cost volatility', () => {
      const cost1 = calculateBuyCost([10, 10], 0, 5, 50);
      const cost2 = calculateBuyCost([10, 10], 0, 5, 200);
      // With higher liquidity, cost should be lower for same trade
      expect(cost1).toBeGreaterThan(cost2);
    });

    test('throws error for invalid outcome index', () => {
      expect(() => calculateBuyCost([10, 10], -1, 5, 100)).toThrow();
      expect(() => calculateBuyCost([10, 10], 2, 5, 100)).toThrow();
    });

    test('throws error for non-positive shares', () => {
      expect(() => calculateBuyCost([10, 10], 0, 0, 100)).toThrow();
      expect(() => calculateBuyCost([10, 10], 0, -5, 100)).toThrow();
    });
  });

  describe('calculateSellProceeds', () => {
    test('selling returns positive proceeds', () => {
      const proceeds = calculateSellProceeds([20, 10], 0, 5, 100);
      expect(proceeds).toBeGreaterThan(0);
    });

    test('selling more shares returns more', () => {
      const proceeds1 = calculateSellProceeds([20, 10], 0, 5, 100);
      const proceeds2 = calculateSellProceeds([20, 10], 0, 10, 100);
      expect(proceeds2).toBeGreaterThan(proceeds1);
    });

    test('throws error for insufficient shares', () => {
      expect(() => calculateSellProceeds([10, 10], 0, 15, 100)).toThrow();
    });

    test('throws error for invalid outcome index', () => {
      expect(() => calculateSellProceeds([10, 10], -1, 5, 100)).toThrow();
      expect(() => calculateSellProceeds([10, 10], 2, 5, 100)).toThrow();
    });

    test('throws error for non-positive shares', () => {
      expect(() => calculateSellProceeds([10, 10], 0, 0, 100)).toThrow();
      expect(() => calculateSellProceeds([10, 10], 0, -5, 100)).toThrow();
    });
  });

  describe('getUpdatedPrices', () => {
    test('buying increases price of outcome', () => {
      const currentShares = [10, 10];
      const currentPrices = calculatePrices(currentShares, 100);
      const newPrices = getUpdatedPrices(currentShares, 0, 10, 100);

      expect(newPrices[0]).toBeGreaterThan(currentPrices[0]);
      expect(newPrices[1]).toBeLessThan(currentPrices[1]);
    });

    test('selling decreases price of outcome', () => {
      const currentShares = [20, 10];
      const currentPrices = calculatePrices(currentShares, 100);
      const newPrices = getUpdatedPrices(currentShares, 0, -5, 100);

      expect(newPrices[0]).toBeLessThan(currentPrices[0]);
      expect(newPrices[1]).toBeGreaterThan(currentPrices[1]);
    });

    test('prices sum to 1.0 after update', () => {
      const newPrices = getUpdatedPrices([10, 20], 0, 5, 100);
      const sum = newPrices.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('throws error for invalid outcome index', () => {
      expect(() => getUpdatedPrices([10, 10], -1, 5, 100)).toThrow();
      expect(() => getUpdatedPrices([10, 10], 2, 5, 100)).toThrow();
    });

    test('throws error for negative resulting shares', () => {
      expect(() => getUpdatedPrices([10, 10], 0, -15, 100)).toThrow();
    });
  });

  describe('Cost function properties', () => {
    test('buy then sell returns similar value (small spread)', () => {
      const currentShares = [10, 10];
      const buyCost = calculateBuyCost(currentShares, 0, 5, 100);

      const newShares = [...currentShares];
      newShares[0] += 5;

      const sellProceeds = calculateSellProceeds(newShares, 0, 5, 100);

      // Should be close but not exactly equal (there's a small spread)
      expect(buyCost).toBeGreaterThanOrEqual(sellProceeds);
      expect(buyCost - sellProceeds).toBeLessThan(buyCost * 0.01); // Within 1%
    });

    test('total cost equals sum of individual costs', () => {
      const currentShares = [10, 10];

      // Buy 10 shares at once
      const costAtOnce = calculateBuyCost(currentShares, 0, 10, 100);

      // Buy 10 shares in two batches
      const cost1 = calculateBuyCost(currentShares, 0, 5, 100);
      const intermediateShares = [...currentShares];
      intermediateShares[0] += 5;
      const cost2 = calculateBuyCost(intermediateShares, 0, 5, 100);

      const costInBatches = cost1 + cost2;

      // Should be very close (within floating point precision)
      expect(costAtOnce).toBeCloseTo(costInBatches, 5);
    });
  });
});

describe('Normalization Functions', () => {
  describe('normalizePrices', () => {
    test('normalizes prices to sum to 1.0', () => {
      const prices = [0.3, 0.5, 0.8];
      const normalized = normalizePrices(prices);
      const sum = normalized.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('maintains relative proportions', () => {
      const prices = [0.2, 0.4, 0.6];
      const normalized = normalizePrices(prices);

      // Ratios should be maintained
      expect(normalized[1] / normalized[0]).toBeCloseTo(prices[1] / prices[0], 5);
      expect(normalized[2] / normalized[1]).toBeCloseTo(prices[2] / prices[1], 5);
    });

    test('handles already normalized prices', () => {
      const prices = [0.3, 0.3, 0.4];
      const normalized = normalizePrices(prices);
      expect(normalized[0]).toBeCloseTo(0.3, 10);
      expect(normalized[1]).toBeCloseTo(0.3, 10);
      expect(normalized[2]).toBeCloseTo(0.4, 10);
    });

    test('handles zero sum by returning equal probabilities', () => {
      const prices = [0, 0, 0];
      const normalized = normalizePrices(prices);
      normalized.forEach(p => expect(p).toBeCloseTo(1/3, 10));
    });

    test('handles single non-zero price', () => {
      const prices = [0.5, 0, 0];
      const normalized = normalizePrices(prices);
      expect(normalized[0]).toBeCloseTo(1.0, 10);
      expect(normalized[1]).toBeCloseTo(0, 10);
      expect(normalized[2]).toBeCloseTo(0, 10);
    });

    test('throws error for negative prices', () => {
      expect(() => normalizePrices([0.3, -0.1, 0.5])).toThrow();
    });

    test('returns empty array for empty input', () => {
      expect(normalizePrices([])).toEqual([]);
    });
  });

  describe('validatePriceSum', () => {
    test('returns true for valid prices', () => {
      const prices = [0.25, 0.25, 0.5];
      expect(validatePriceSum(prices)).toBe(true);
    });

    test('returns true for prices within tolerance', () => {
      const prices = [0.251, 0.249, 0.5];
      expect(validatePriceSum(prices, 0.01)).toBe(true);
    });

    test('returns false for prices outside tolerance', () => {
      const prices = [0.3, 0.3, 0.3];
      expect(validatePriceSum(prices, 0.001)).toBe(false);
    });

    test('returns false for negative prices', () => {
      const prices = [0.5, -0.1, 0.6];
      expect(validatePriceSum(prices)).toBe(false);
    });

    test('returns false for empty array', () => {
      expect(validatePriceSum([])).toBe(false);
    });

    test('uses default tolerance of 0.001', () => {
      const prices = [0.3335, 0.3335, 0.333];
      expect(validatePriceSum(prices)).toBe(true);
    });
  });

  describe('getPriceDeviation', () => {
    test('returns deviation from 1.0', () => {
      const prices = [0.3, 0.3, 0.3];
      const deviation = getPriceDeviation(prices);
      expect(deviation).toBeCloseTo(0.1, 10);
    });

    test('returns 0 for perfect prices', () => {
      const prices = [0.25, 0.25, 0.5];
      const deviation = getPriceDeviation(prices);
      expect(deviation).toBeCloseTo(0, 10);
    });

    test('returns 0 for empty array', () => {
      const deviation = getPriceDeviation([]);
      expect(deviation).toBe(0);
    });
  });
});
