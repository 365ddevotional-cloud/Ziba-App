// Pricing configuration
export const PRICING_CONFIG = {
  baseFare: 500, // NGN
  pricePerKm: 120, // NGN per kilometer
  pricePerMinute: 30, // NGN per minute
  currency: "NGN",
  currencySymbol: "₦",
};

export interface FareBreakdown {
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  total: number;
}

export interface FareEstimate {
  fare: number;
  currency: string;
  currencySymbol: string;
  breakdown: FareBreakdown;
}

/**
 * Calculate fare based on distance and duration
 * Deterministic calculation - same inputs always produce same output
 */
export function calculateFare(
  distance: number,
  duration: number,
  config = PRICING_CONFIG
): FareEstimate {
  // Ensure valid inputs
  const validDistance = Math.max(0, distance);
  const validDuration = Math.max(0, duration);

  // Calculate components
  const baseFare = config.baseFare;
  const distanceCharge = validDistance * config.pricePerKm;
  const timeCharge = validDuration * config.pricePerMinute;

  // Calculate total
  const total = baseFare + distanceCharge + timeCharge;

  return {
    fare: Math.round(total),
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    breakdown: {
      baseFare,
      distanceCharge: Math.round(distanceCharge),
      timeCharge: Math.round(timeCharge),
      total: Math.round(total),
    },
  };
}
