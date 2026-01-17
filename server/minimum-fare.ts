/**
 * Minimum Fare Logic for Ziba Platform
 * 
 * Ensures the platform never operates at a loss on any trip.
 * 
 * Formula:
 * - CostPerTrip = $0.10 (platform's operational cost per trip)
 * - SafetyFactor = 3 (buffer for profitability)
 * - MinimumZibaTake = CostPerTrip * SafetyFactor = $0.30
 * - MinimumFare = MinimumZibaTake / CommissionRate
 * 
 * At 15% commission: MinimumFare = $0.30 / 0.15 = $2.00
 * At 18% commission: MinimumFare = $0.30 / 0.18 = $1.67
 */

export const COST_PER_TRIP = 0.10;
export const SAFETY_FACTOR = 3;
export const MINIMUM_ZIBA_TAKE = COST_PER_TRIP * SAFETY_FACTOR;

export interface MinimumFareResult {
  originalFare: number;
  adjustedFare: number;
  wasAdjusted: boolean;
  minimumFare: number;
  commissionRate: number;
  zibaTake: number;
  reason?: string;
}

/**
 * Calculate the minimum fare required for a given commission rate
 */
export function calculateMinimumFare(commissionRate: number): number {
  if (commissionRate <= 0 || commissionRate > 1) {
    throw new Error("Commission rate must be between 0 and 1");
  }
  return MINIMUM_ZIBA_TAKE / commissionRate;
}

/**
 * Enforce minimum fare on a calculated fare amount
 * Returns the adjusted fare and metadata about the adjustment
 */
export function enforceMinimumFare(
  calculatedFare: number,
  commissionRate: number = 0.15
): MinimumFareResult {
  const minimumFare = calculateMinimumFare(commissionRate);
  const wasAdjusted = calculatedFare < minimumFare;
  const adjustedFare = wasAdjusted ? minimumFare : calculatedFare;
  const zibaTake = adjustedFare * commissionRate;

  return {
    originalFare: calculatedFare,
    adjustedFare,
    wasAdjusted,
    minimumFare,
    commissionRate,
    zibaTake,
    reason: wasAdjusted 
      ? `Fare adjusted from ${calculatedFare.toFixed(2)} to minimum ${minimumFare.toFixed(2)} to ensure platform profitability`
      : undefined
  };
}

/**
 * Validate if a fare meets the minimum requirement
 * Returns validation result with details
 */
export function validateFare(
  fare: number,
  commissionRate: number = 0.15
): { isValid: boolean; minimumFare: number; shortfall: number } {
  const minimumFare = calculateMinimumFare(commissionRate);
  const isValid = fare >= minimumFare;
  const shortfall = isValid ? 0 : minimumFare - fare;

  return {
    isValid,
    minimumFare,
    shortfall
  };
}

/**
 * Calculate Ziba's take (commission) from a fare
 */
export function calculateZibaTake(fare: number, commissionRate: number = 0.15): number {
  return fare * commissionRate;
}

/**
 * Check if a fare would generate negative margin for Ziba
 */
export function wouldGenerateNegativeMargin(fare: number, commissionRate: number = 0.15): boolean {
  const zibaTake = calculateZibaTake(fare, commissionRate);
  return zibaTake < MINIMUM_ZIBA_TAKE;
}
