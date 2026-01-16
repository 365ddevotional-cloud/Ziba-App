import { PrismaClient } from "@prisma/client";
import * as walletService from "./wallet-service";

const prisma = new PrismaClient();

export type TripStatus = 
  | "REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SETTLED";

export const TRIP_STATUS_ORDER: TripStatus[] = [
  "REQUESTED",
  "DRIVER_ASSIGNED",
  "DRIVER_ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "SETTLED",
];

const VALID_TRANSITIONS: Record<TripStatus, TripStatus | null> = {
  REQUESTED: "DRIVER_ASSIGNED",
  DRIVER_ASSIGNED: "DRIVER_ARRIVED",
  DRIVER_ARRIVED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "SETTLED",
  SETTLED: null,
};

interface StatusHistoryEntry {
  status: TripStatus;
  timestamp: string;
  actor: string;
}

interface TransitionResult {
  success: boolean;
  error?: string;
  code?: number;
  ride?: any;
}

export function getNextAllowedStatus(current: TripStatus): TripStatus | null {
  return VALID_TRANSITIONS[current];
}

export function isValidTransition(from: TripStatus, to: TripStatus): boolean {
  return VALID_TRANSITIONS[from] === to;
}

export function isTripImmutable(status: TripStatus): boolean {
  return status === "SETTLED";
}

export function isTripCompleted(status: TripStatus): boolean {
  return status === "COMPLETED" || status === "SETTLED";
}

export async function transitionTripStatus(
  tripId: string,
  nextStatus: TripStatus,
  actor: string
): Promise<TransitionResult> {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: tripId },
      include: { user: true, driver: true },
    });

    if (!ride) {
      return {
        success: false,
        error: "Trip not found",
        code: 404,
      };
    }

    const currentStatus = ride.status as TripStatus;

    if (isTripImmutable(currentStatus)) {
      console.error(
        `[TRIP-STATE-ERROR] tripId=${tripId} actor=${actor} attempted transition on SETTLED trip`
      );
      return {
        success: false,
        error: "Trip is settled and immutable. No changes allowed.",
        code: 403,
      };
    }

    if (currentStatus === "COMPLETED" && nextStatus !== "SETTLED") {
      console.error(
        `[TRIP-STATE-ERROR] tripId=${tripId} actor=${actor} attempted invalid transition from COMPLETED to ${nextStatus}`
      );
      return {
        success: false,
        error: "Trip is completed. Only settlement is allowed.",
        code: 403,
      };
    }

    if (!isValidTransition(currentStatus, nextStatus)) {
      console.error(
        `[TRIP-STATE-ERROR] tripId=${tripId} actor=${actor} invalid transition ${currentStatus} → ${nextStatus}`
      );
      return {
        success: false,
        error: `Invalid state transition: ${currentStatus} → ${nextStatus}. Expected next state: ${getNextAllowedStatus(currentStatus) || "none"}`,
        code: 409,
      };
    }

    const statusHistory = ((ride as any).statusHistory as StatusHistoryEntry[]) || [];
    const newHistoryEntry: StatusHistoryEntry = {
      status: nextStatus,
      timestamp: new Date().toISOString(),
      actor,
    };
    statusHistory.push(newHistoryEntry);

    const updateData: any = {
      status: nextStatus,
      statusHistory,
    };

    if (nextStatus === "IN_PROGRESS") {
      const fareToLock = ride.lockedFare || ride.fareEstimate;
      if (!ride.lockedFare && ride.fareEstimate) {
        updateData.lockedFare = ride.fareEstimate;
      }
      updateData.startedAt = new Date();

      if (fareToLock && fareToLock > 0) {
        const holdResult = await walletService.holdFareForTrip(
          tripId,
          ride.userId,
          fareToLock
        );

        if (!holdResult.success) {
          console.error(
            `[TRIP-STATE-ERROR] tripId=${tripId} failed to hold fare: ${holdResult.error}`
          );
          return {
            success: false,
            error: `Cannot start trip: ${holdResult.error}`,
            code: 400,
          };
        }

        console.log(
          `[TRIP-STATE] tripId=${tripId} fare ${fareToLock} held in rider wallet`
        );
      }
    }

    if (nextStatus === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    if (nextStatus === "SETTLED") {
      const settlementResult = await walletService.settleTrip(tripId);

      if (!settlementResult.success) {
        console.error(
          `[TRIP-STATE-ERROR] tripId=${tripId} settlement failed: ${settlementResult.error}`
        );
        return {
          success: false,
          error: `Settlement failed: ${settlementResult.error}`,
          code: 400,
        };
      }

      console.log(
        `[TRIP-STATE] tripId=${tripId} settled: driver=${settlementResult.driverPayout}, platform=${settlementResult.platformFee}`
      );

      return {
        success: true,
        ride: {
          ...ride,
          status: "SETTLED",
          settledAt: new Date(),
          settlement: {
            driverPayout: settlementResult.driverPayout,
            platformFee: settlementResult.platformFee,
          },
        },
      };
    }

    const updatedRide = await prisma.ride.update({
      where: { id: tripId },
      data: updateData,
      include: { user: true, driver: true },
    });

    console.log(
      `[TRIP-STATE] tripId=${tripId} actor=${actor} transitioned ${currentStatus} → ${nextStatus}`
    );

    return {
      success: true,
      ride: updatedRide,
    };
  } catch (error) {
    console.error(`[TRIP-STATE-ERROR] tripId=${tripId} error:`, error);
    return {
      success: false,
      error: "Internal server error during state transition",
      code: 500,
    };
  }
}

export async function getTripStatus(tripId: string): Promise<{
  status: TripStatus;
  history: StatusHistoryEntry[];
  nextAllowed: TripStatus | null;
  isImmutable: boolean;
} | null> {
  const ride = await prisma.ride.findUnique({
    where: { id: tripId },
  });

  if (!ride) return null;

  const status = ride.status as TripStatus;
  return {
    status,
    history: ((ride as any).statusHistory as StatusHistoryEntry[]) || [],
    nextAllowed: getNextAllowedStatus(status),
    isImmutable: isTripImmutable(status),
  };
}

export function validateRoleForTransition(
  nextStatus: TripStatus,
  role: "rider" | "driver" | "admin"
): { allowed: boolean; reason?: string } {
  const rolePermissions: Partial<Record<TripStatus, ("rider" | "driver" | "admin")[]>> = {
    DRIVER_ASSIGNED: ["admin", "driver"],
    DRIVER_ARRIVED: ["driver"],
    IN_PROGRESS: ["driver"],
    COMPLETED: ["driver"],
    SETTLED: ["admin"],
  };

  const allowed = rolePermissions[nextStatus];
  if (!allowed || allowed.length === 0) {
    return { allowed: false, reason: "Invalid status transition" };
  }

  if (!allowed.includes(role)) {
    return {
      allowed: false,
      reason: `Role '${role}' cannot perform transition to '${nextStatus}'`,
    };
  }

  return { allowed: true };
}
