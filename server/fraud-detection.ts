interface GpsPoint {
  lat: number;
  lng: number;
  createdAt: Date;
}

interface FraudResult {
  fraudScore: number;
  isFlagged: boolean;
  payoutHeld: boolean;
  reasons: string[];
  actualDistance: number;
  actualDuration: number;
}

const DISTANCE_MULTIPLIER = 1.25;
const TIME_MULTIPLIER = 1.4;
const GPS_JUMP_THRESHOLD_METERS = 500;
const GPS_JUMP_TIME_SECONDS = 5;
const LOOP_DETECTION_RADIUS_METERS = 50;
const LOOP_COUNT_THRESHOLD = 3;
const IDLE_THRESHOLD_MINUTES = 10;
const FRAUD_SCORE_PAYOUT_HOLD = 4;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalDistance(gpsPoints: GpsPoint[]): number {
  if (gpsPoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < gpsPoints.length; i++) {
    totalDistance += haversineDistance(
      gpsPoints[i - 1].lat,
      gpsPoints[i - 1].lng,
      gpsPoints[i].lat,
      gpsPoints[i].lng
    );
  }
  return totalDistance;
}

function detectGpsJumps(gpsPoints: GpsPoint[]): number {
  let jumpCount = 0;

  for (let i = 1; i < gpsPoints.length; i++) {
    const distance = haversineDistance(
      gpsPoints[i - 1].lat,
      gpsPoints[i - 1].lng,
      gpsPoints[i].lat,
      gpsPoints[i].lng
    ) * 1000;

    const timeDiff = (new Date(gpsPoints[i].createdAt).getTime() -
      new Date(gpsPoints[i - 1].createdAt).getTime()) / 1000;

    if (distance > GPS_JUMP_THRESHOLD_METERS && timeDiff < GPS_JUMP_TIME_SECONDS) {
      jumpCount++;
    }
  }

  return jumpCount;
}

function detectLooping(gpsPoints: GpsPoint[]): number {
  const pointCounts = new Map<string, number>();

  for (const point of gpsPoints) {
    const roundedLat = Math.round(point.lat * 1000) / 1000;
    const roundedLng = Math.round(point.lng * 1000) / 1000;
    const key = `${roundedLat},${roundedLng}`;

    pointCounts.set(key, (pointCounts.get(key) || 0) + 1);
  }

  let loopingPoints = 0;
  pointCounts.forEach((count) => {
    if (count >= LOOP_COUNT_THRESHOLD) {
      loopingPoints++;
    }
  });

  return loopingPoints;
}

function detectIdlePeriods(gpsPoints: GpsPoint[]): number {
  let idlePeriods = 0;

  for (let i = 1; i < gpsPoints.length; i++) {
    const distance = haversineDistance(
      gpsPoints[i - 1].lat,
      gpsPoints[i - 1].lng,
      gpsPoints[i].lat,
      gpsPoints[i].lng
    ) * 1000;

    const timeDiff = (new Date(gpsPoints[i].createdAt).getTime() -
      new Date(gpsPoints[i - 1].createdAt).getTime()) / 1000 / 60;

    if (distance < LOOP_DETECTION_RADIUS_METERS && timeDiff >= IDLE_THRESHOLD_MINUTES) {
      idlePeriods++;
    }
  }

  return idlePeriods;
}

export function analyzeFraud(
  gpsPoints: GpsPoint[],
  estimatedDistance: number | null,
  estimatedDuration: number | null,
  startedAt: Date | null,
  completedAt: Date | null
): FraudResult {
  const reasons: string[] = [];
  let fraudScore = 0;

  const actualDistance = calculateTotalDistance(gpsPoints);

  let actualDuration = 0;
  if (startedAt && completedAt) {
    actualDuration = (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000 / 60;
  }

  if (estimatedDistance && estimatedDistance > 0) {
    const allowedDistance = estimatedDistance * DISTANCE_MULTIPLIER;
    if (actualDistance > allowedDistance) {
      fraudScore += 2;
      reasons.push(`Distance overage: ${actualDistance.toFixed(2)}km vs allowed ${allowedDistance.toFixed(2)}km`);
    }
  }

  if (estimatedDuration && estimatedDuration > 0) {
    const allowedTime = estimatedDuration * TIME_MULTIPLIER;
    if (actualDuration > allowedTime) {
      fraudScore += 1;
      reasons.push(`Time overage: ${actualDuration.toFixed(0)}min vs allowed ${allowedTime.toFixed(0)}min`);
    }
  }

  const gpsJumps = detectGpsJumps(gpsPoints);
  if (gpsJumps > 0) {
    fraudScore += 4;
    reasons.push(`GPS jump detected: ${gpsJumps} suspicious teleportation(s) (>500m in <5s)`);
  }

  const loopingPoints = detectLooping(gpsPoints);
  if (loopingPoints > 0) {
    fraudScore += 3;
    reasons.push(`Looping detected: ${loopingPoints} location(s) visited 3+ times`);
  }

  const idlePeriods = detectIdlePeriods(gpsPoints);
  if (idlePeriods > 0) {
    fraudScore += 2;
    reasons.push(`Idle periods: ${idlePeriods} period(s) of >10min stationary mid-trip`);
  }

  const isFlagged = reasons.length > 0;
  const payoutHeld = fraudScore >= FRAUD_SCORE_PAYOUT_HOLD;

  return {
    fraudScore,
    isFlagged,
    payoutHeld,
    reasons,
    actualDistance,
    actualDuration
  };
}
