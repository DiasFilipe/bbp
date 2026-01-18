import { normalizePricesWithBounds, validatePriceSum } from './normalize';

describe('normalizePricesWithBounds', () => {
  it('clamps values to bounds and keeps sum at 1.0', () => {
    const result = normalizePricesWithBounds([0.9, 0.1], 0.2, 0.8);
    expect(result).toEqual([0.8, 0.2]);
    expect(validatePriceSum(result)).toBe(true);
  });

  it('keeps values within bounds when already valid', () => {
    const result = normalizePricesWithBounds([0.5, 0.5, 0.5], 0.1, 0.7);
    expect(validatePriceSum(result)).toBe(true);
    result.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0.1);
      expect(value).toBeLessThanOrEqual(0.7);
    });
  });

  it('throws when bounds are infeasible for the outcome count', () => {
    expect(() => normalizePricesWithBounds([0.5, 0.5], 0.6, 0.7)).toThrow(
      'Price bounds are infeasible for outcome count'
    );
  });
});
