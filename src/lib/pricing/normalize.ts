/**
 * Price Normalization Utilities
 *
 * These functions ensure that outcome prices always sum to 1.0,
 * representing valid probabilities in a prediction market.
 */

/**
 * Normalize an array of prices to sum to exactly 1.0
 *
 * This is used during the transition period (Phase 1) where we keep
 * the linear pricing logic but ensure prices represent valid probabilities.
 *
 * @param prices - Array of prices to normalize
 * @returns Normalized prices that sum to 1.0
 */
export function normalizePrices(prices: number[]): number[] {
  if (prices.length === 0) {
    return [];
  }

  // Check for invalid prices
  if (prices.some(p => p < 0)) {
    throw new Error('Prices cannot be negative');
  }

  const sum = prices.reduce((total, price) => total + price, 0);

  // If sum is zero or very close to zero, return equal probabilities
  if (sum < 0.0001) {
    const equalProb = 1.0 / prices.length;
    return prices.map(() => equalProb);
  }

  // Normalize by dividing each price by the sum
  const normalized = prices.map(price => price / sum);

  // Verify normalization worked (handle floating point precision)
  const normalizedSum = normalized.reduce((total, price) => total + price, 0);

  // If there's still a small rounding error, adjust the largest value
  if (Math.abs(normalizedSum - 1.0) > 0.0000001) {
    const maxIndex = normalized.indexOf(Math.max(...normalized));
    normalized[maxIndex] += (1.0 - normalizedSum);
  }

  return normalized;
}

/**
 * Validate that prices sum to approximately 1.0
 *
 * @param prices - Array of prices to validate
 * @param tolerance - Maximum allowed deviation from 1.0 (default: 0.001 = 0.1%)
 * @returns true if prices are valid, false otherwise
 */
export function validatePriceSum(prices: number[], tolerance: number = 0.001): boolean {
  if (prices.length === 0) {
    return false;
  }

  // Check for negative prices
  if (prices.some(p => p < 0)) {
    return false;
  }

  // Check sum
  const sum = prices.reduce((total, price) => total + price, 0);
  const deviation = Math.abs(sum - 1.0);

  return deviation <= tolerance;
}

/**
 * Normalize prices and enforce min/max bounds while keeping sum = 1.0
 *
 * @param prices - Array of prices to normalize
 * @param minPrice - Minimum allowed price
 * @param maxPrice - Maximum allowed price
 * @returns Normalized prices within bounds
 */
export function normalizePricesWithBounds(
  prices: number[],
  minPrice: number,
  maxPrice: number
): number[] {
  if (prices.length === 0) {
    return [];
  }

  if (minPrice < 0 || maxPrice <= 0 || minPrice > maxPrice) {
    throw new Error('Invalid price bounds');
  }

  const count = prices.length;
  if (minPrice * count > 1.0 || maxPrice * count < 1.0) {
    throw new Error('Price bounds are infeasible for outcome count');
  }

  let normalized = normalizePrices(prices);
  const fixed: Array<number | null> = Array(count).fill(null);
  let remainingIndices = Array.from({ length: count }, (_, i) => i);
  let remainingTotal = 1.0;

  while (true) {
    let changed = false;
    const nextRemaining: number[] = [];

    for (const i of remainingIndices) {
      if (normalized[i] < minPrice) {
        fixed[i] = minPrice;
        remainingTotal -= minPrice;
        changed = true;
      } else if (normalized[i] > maxPrice) {
        fixed[i] = maxPrice;
        remainingTotal -= maxPrice;
        changed = true;
      } else {
        nextRemaining.push(i);
      }
    }

    remainingIndices = nextRemaining;
    if (!changed) {
      break;
    }

    if (remainingTotal < -1e-9) {
      throw new Error('Price bounds cannot be satisfied');
    }
    if (remainingTotal < 0) {
      remainingTotal = 0;
    }

    if (remainingIndices.length === 0) {
      break;
    }

    const remainingSum = remainingIndices.reduce((sum, i) => sum + normalized[i], 0);
    if (remainingSum === 0) {
      const equalShare = remainingTotal / remainingIndices.length;
      for (const i of remainingIndices) {
        normalized[i] = equalShare;
      }
    } else {
      for (const i of remainingIndices) {
        normalized[i] = (normalized[i] / remainingSum) * remainingTotal;
      }
    }
  }

  const result = normalized.map((value, i) => (fixed[i] === null ? value : fixed[i] as number));
  const sum = result.reduce((total, price) => total + price, 0);
  const delta = 1.0 - sum;

  if (Math.abs(delta) > 1e-9) {
    let bestIndex = -1;
    let bestSlack = 0;

    if (delta > 0) {
      for (let i = 0; i < result.length; i++) {
        const slack = maxPrice - result[i];
        if (slack > bestSlack) {
          bestSlack = slack;
          bestIndex = i;
        }
      }
    } else {
      for (let i = 0; i < result.length; i++) {
        const slack = result[i] - minPrice;
        if (slack > bestSlack) {
          bestSlack = slack;
          bestIndex = i;
        }
      }
    }

    if (bestIndex === -1 || bestSlack <= 0) {
      throw new Error('Price adjustment exceeds bounds');
    }

    result[bestIndex] += delta;
  }

  return result;
}

/**
 * Calculate the deviation of price sum from 1.0
 *
 * Useful for monitoring and diagnostics
 *
 * @param prices - Array of prices
 * @returns Absolute deviation from 1.0
 */
export function getPriceDeviation(prices: number[]): number {
  if (prices.length === 0) {
    return 0;
  }

  const sum = prices.reduce((total, price) => total + price, 0);
  return Math.abs(sum - 1.0);
}
