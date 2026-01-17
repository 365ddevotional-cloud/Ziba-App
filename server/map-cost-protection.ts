/**
 * Map Cost Protection System for Ziba Platform
 * 
 * Tracks daily metrics and enforces cost controls to prevent
 * map API costs from exceeding revenue thresholds.
 * 
 * Metrics Tracked:
 * - MapCost: Total cost of map API calls
 * - CompletedTrips: Number of completed rides
 * - ZibaRevenue: Platform revenue (commission earned)
 * - PaidMapRequests: Count of billable map API calls
 * - TotalMapRequests: Total map API calls (cached + paid)
 * 
 * Computed Ratios:
 * - MapCostPerTrip = MapCost / CompletedTrips
 * - PaidUsageRate = PaidMapRequests / TotalMapRequests
 * - MapCostRatio = MapCost / ZibaRevenue
 * 
 * Target Thresholds:
 * - MapCostPerTrip ≤ $0.03
 * - PaidUsageRate < 20%
 * - MapCostRatio ≤ 1.5%
 * 
 * Protection Actions (when MapCostRatio > 2%):
 * - Reduce GPS tracking frequency
 * - Disable paid address autocomplete
 * - Force cached addresses only
 */

export const MAP_COST_TARGETS = {
  MAX_COST_PER_TRIP: 0.03,
  MAX_PAID_USAGE_RATE: 0.20,
  MAX_MAP_COST_RATIO: 0.015,
  CRITICAL_MAP_COST_RATIO: 0.02
};

export interface DailyMapMetrics {
  date: string;
  mapCost: number;
  completedTrips: number;
  zibaRevenue: number;
  paidMapRequests: number;
  totalMapRequests: number;
}

export interface ComputedMapMetrics {
  mapCostPerTrip: number;
  paidUsageRate: number;
  mapCostRatio: number;
  isWithinTargets: boolean;
  isCritical: boolean;
  warnings: string[];
}

export interface ProtectionStatus {
  gpsFrequencyReduced: boolean;
  autocompleteDisabled: boolean;
  forceCachedOnly: boolean;
  reason?: string;
}

export function computeMapMetrics(daily: DailyMapMetrics): ComputedMapMetrics {
  const mapCostPerTrip = daily.completedTrips > 0 
    ? daily.mapCost / daily.completedTrips 
    : 0;
  
  const paidUsageRate = daily.totalMapRequests > 0 
    ? daily.paidMapRequests / daily.totalMapRequests 
    : 0;
  
  const mapCostRatio = daily.zibaRevenue > 0 
    ? daily.mapCost / daily.zibaRevenue 
    : 0;

  const warnings: string[] = [];

  if (mapCostPerTrip > MAP_COST_TARGETS.MAX_COST_PER_TRIP) {
    warnings.push(`MapCostPerTrip ($${mapCostPerTrip.toFixed(4)}) exceeds target ($${MAP_COST_TARGETS.MAX_COST_PER_TRIP})`);
  }

  if (paidUsageRate > MAP_COST_TARGETS.MAX_PAID_USAGE_RATE) {
    warnings.push(`PaidUsageRate (${(paidUsageRate * 100).toFixed(1)}%) exceeds target (${MAP_COST_TARGETS.MAX_PAID_USAGE_RATE * 100}%)`);
  }

  if (mapCostRatio > MAP_COST_TARGETS.MAX_MAP_COST_RATIO) {
    warnings.push(`MapCostRatio (${(mapCostRatio * 100).toFixed(2)}%) exceeds target (${MAP_COST_TARGETS.MAX_MAP_COST_RATIO * 100}%)`);
  }

  const isWithinTargets = warnings.length === 0;
  const isCritical = mapCostRatio > MAP_COST_TARGETS.CRITICAL_MAP_COST_RATIO;

  return {
    mapCostPerTrip,
    paidUsageRate,
    mapCostRatio,
    isWithinTargets,
    isCritical,
    warnings
  };
}

export function getProtectionStatus(metrics: ComputedMapMetrics): ProtectionStatus {
  if (!metrics.isCritical) {
    return {
      gpsFrequencyReduced: false,
      autocompleteDisabled: false,
      forceCachedOnly: false
    };
  }

  return {
    gpsFrequencyReduced: true,
    autocompleteDisabled: true,
    forceCachedOnly: true,
    reason: `MapCostRatio (${(metrics.mapCostRatio * 100).toFixed(2)}%) exceeds critical threshold (${MAP_COST_TARGETS.CRITICAL_MAP_COST_RATIO * 100}%)`
  };
}

export const GPS_INTERVALS = {
  NORMAL: {
    IDLE: 90000,
    EN_ROUTE: 10000,
    IN_PROGRESS: 6000
  },
  REDUCED: {
    IDLE: 180000,
    EN_ROUTE: 20000,
    IN_PROGRESS: 12000
  }
};

export function getGpsInterval(
  status: 'IDLE' | 'EN_ROUTE' | 'IN_PROGRESS',
  protectionActive: boolean
): number {
  const intervals = protectionActive ? GPS_INTERVALS.REDUCED : GPS_INTERVALS.NORMAL;
  return intervals[status];
}

export function formatMetricsReport(daily: DailyMapMetrics, computed: ComputedMapMetrics): string {
  return `
Map Cost Daily Report (${daily.date})
=====================================
Raw Metrics:
  - Map Cost: $${daily.mapCost.toFixed(2)}
  - Completed Trips: ${daily.completedTrips}
  - Ziba Revenue: $${daily.zibaRevenue.toFixed(2)}
  - Paid Map Requests: ${daily.paidMapRequests}
  - Total Map Requests: ${daily.totalMapRequests}

Computed Ratios:
  - Map Cost Per Trip: $${computed.mapCostPerTrip.toFixed(4)} (target: ≤$${MAP_COST_TARGETS.MAX_COST_PER_TRIP})
  - Paid Usage Rate: ${(computed.paidUsageRate * 100).toFixed(1)}% (target: <${MAP_COST_TARGETS.MAX_PAID_USAGE_RATE * 100}%)
  - Map Cost Ratio: ${(computed.mapCostRatio * 100).toFixed(2)}% (target: ≤${MAP_COST_TARGETS.MAX_MAP_COST_RATIO * 100}%)

Status: ${computed.isWithinTargets ? 'HEALTHY' : computed.isCritical ? 'CRITICAL' : 'WARNING'}
${computed.warnings.length > 0 ? '\nWarnings:\n  - ' + computed.warnings.join('\n  - ') : ''}
`.trim();
}
