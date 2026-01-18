/**
 * LMSR (Logarithmic Market Scoring Rule) Pricing Functions
 *
 * LMSR is an automated market maker that guarantees:
 * - Prices always sum to 1.0 (represent true probabilities)
 * - Platform liquidity through the parameter b
 * - Fair pricing based on supply/demand
 *
 * Core formula: C(q) = b × ln(Σ exp(q_i / b))
 * where q_i is the quantity of shares for outcome i
 */

/**
 * Log-sum-exp trick for numerical stability
 * Computes log(Σ exp(x_i)) without overflow/underflow
 */
function logSumExp(values: number[]): number {
  if (values.length === 0) return -Infinity;

  const maxValue = Math.max(...values);
  if (!isFinite(maxValue)) return maxValue;

  const sum = values.reduce((acc, val) => acc + Math.exp(val - maxValue), 0);
  return maxValue + Math.log(sum);
}

/**
 * Calculate the LMSR cost function C(q)
 * C(q) = b × ln(Σ exp(q_i / b))
 *
 * @param shares - Array of share quantities for each outcome
 * @param b - Liquidity parameter (higher = more liquidity, less price volatility)
 * @returns The cost function value
 */
export function calculateCost(shares: number[], b: number): number {
  if (b <= 0) {
    throw new Error('Liquidity parameter b must be positive');
  }

  if (shares.length === 0) {
    return 0;
  }

  // Normalize by b for numerical stability
  const normalizedShares = shares.map(q => q / b);
  return b * logSumExp(normalizedShares);
}

/**
 * Calculate prices from current share quantities
 * p_i = exp(q_i / b) / Σ exp(q_j / b)
 *
 * These prices represent the current probability of each outcome
 * and are guaranteed to sum to 1.0
 *
 * @param shares - Array of share quantities for each outcome
 * @param b - Liquidity parameter
 * @returns Array of prices (probabilities) for each outcome
 */
export function calculatePrices(shares: number[], b: number): number[] {
  if (b <= 0) {
    throw new Error('Liquidity parameter b must be positive');
  }

  if (shares.length === 0) {
    return [];
  }

  // If all shares are zero, return equal probabilities
  const totalShares = shares.reduce((sum, q) => sum + q, 0);
  if (totalShares === 0) {
    const equalProb = 1.0 / shares.length;
    return shares.map(() => equalProb);
  }

  // Calculate exp(q_i / b) for all outcomes
  const normalizedShares = shares.map(q => q / b);
  const maxNormalized = Math.max(...normalizedShares);

  // Use max subtraction for numerical stability
  const expValues = normalizedShares.map(q => Math.exp(q - maxNormalized));
  const sumExp = expValues.reduce((sum, val) => sum + val, 0);

  // Calculate probabilities
  const prices = expValues.map(val => val / sumExp);

  // Normalize to ensure exact sum of 1.0 (handle floating point errors)
  const priceSum = prices.reduce((sum, p) => sum + p, 0);
  return prices.map(p => p / priceSum);
}

/**
 * Calculate the cost to buy additional shares of an outcome
 * Cost = C(q + Δq) - C(q)
 *
 * @param currentShares - Current share quantities for all outcomes
 * @param outcomeIndex - Index of the outcome being purchased
 * @param sharesToBuy - Number of shares to purchase
 * @param b - Liquidity parameter
 * @returns Cost in currency units
 */
export function calculateBuyCost(
  currentShares: number[],
  outcomeIndex: number,
  sharesToBuy: number,
  b: number
): number {
  if (outcomeIndex < 0 || outcomeIndex >= currentShares.length) {
    throw new Error('Invalid outcome index');
  }

  if (sharesToBuy <= 0) {
    throw new Error('Shares to buy must be positive');
  }

  // Current cost
  const currentCost = calculateCost(currentShares, b);

  // Cost after buying shares
  const newShares = [...currentShares];
  newShares[outcomeIndex] += sharesToBuy;
  const newCost = calculateCost(newShares, b);

  return newCost - currentCost;
}

/**
 * Calculate proceeds from selling shares of an outcome
 * Proceeds = C(q) - C(q - Δq)
 *
 * @param currentShares - Current share quantities for all outcomes
 * @param outcomeIndex - Index of the outcome being sold
 * @param sharesToSell - Number of shares to sell
 * @param b - Liquidity parameter
 * @returns Proceeds in currency units
 */
export function calculateSellProceeds(
  currentShares: number[],
  outcomeIndex: number,
  sharesToSell: number,
  b: number
): number {
  if (outcomeIndex < 0 || outcomeIndex >= currentShares.length) {
    throw new Error('Invalid outcome index');
  }

  if (sharesToSell <= 0) {
    throw new Error('Shares to sell must be positive');
  }

  if (currentShares[outcomeIndex] < sharesToSell) {
    throw new Error('Insufficient shares to sell');
  }

  // Current cost
  const currentCost = calculateCost(currentShares, b);

  // Cost after selling shares
  const newShares = [...currentShares];
  newShares[outcomeIndex] -= sharesToSell;
  const newCost = calculateCost(newShares, b);

  return currentCost - newCost;
}

/**
 * Get updated prices after a trade
 *
 * @param currentShares - Current share quantities for all outcomes
 * @param outcomeIndex - Index of the outcome being traded
 * @param sharesDelta - Change in shares (positive for buy, negative for sell)
 * @param b - Liquidity parameter
 * @returns Array of new prices after the trade
 */
export function getUpdatedPrices(
  currentShares: number[],
  outcomeIndex: number,
  sharesDelta: number,
  b: number
): number[] {
  if (outcomeIndex < 0 || outcomeIndex >= currentShares.length) {
    throw new Error('Invalid outcome index');
  }

  const newShares = [...currentShares];
  newShares[outcomeIndex] += sharesDelta;

  if (newShares[outcomeIndex] < 0) {
    throw new Error('Resulting shares cannot be negative');
  }

  return calculatePrices(newShares, b);
}
