/**
 * Platform-wide constants and configuration
 */

// Trading fees
export const TRANSACTION_FEE_RATE = 0.02; // 2% fee on all trades

// Price sensitivity for automated market making (legacy linear AMM)
export const PRICE_SENSITIVITY_FACTOR = 0.005; // How much price changes per share traded

// Price bounds (legacy linear AMM)
export const MIN_PRICE = 0.01; // Minimum outcome price (1 cent)
export const MAX_PRICE = 0.99; // Maximum outcome price (99 cents)

// LMSR Configuration
export const DEFAULT_LIQUIDITY_PARAMETER = 100.0; // Parâmetro b do LMSR (liquidez da plataforma)
export const LMSR_ENABLED = false; // Feature flag para ativar LMSR (Fase 2)

// Price validation
export const PRICE_SUM_TOLERANCE = 0.001; // Tolerância para validação de soma de preços (0.1%)
