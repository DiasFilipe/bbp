/**
 * Platform-wide constants and configuration
 */

// Trading fees
export const TRANSACTION_FEE_RATE = 0.02; // 2% fee on all trades

// Price sensitivity for automated market making
export const PRICE_SENSITIVITY_FACTOR = 0.005; // How much price changes per share traded

// Price bounds
export const MIN_PRICE = 0.01; // Minimum outcome price (1 cent)
export const MAX_PRICE = 0.99; // Maximum outcome price (99 cents)
