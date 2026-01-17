import { PrismaClient } from "@prisma/client";
import * as walletService from "./wallet-service";

const prisma = new PrismaClient();

export type TripStatus = 
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const TRIP_STATUS_ORDER: TripStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const VALID_TRANSITIONS: Record<TripStatus, TripStatus | null> = {
  REQUESTED: "ACCEPTED",
  ACCEPTED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
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
  return status === "COMPLETED" || status === "CANCELLED";
}

export function isTripCompleted(status: TripStatus): boolean {
  return status === "COMPLETED";
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
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[TRIP-STATE-ERROR] tripId=${tripId} actor=${actor} attempted transition on immutable trip status=${currentStatus}`
        );
      }
      return {
        success: false,
        error: `Trip is ${currentStatus.toLowerCase()} and immutable. No changes allowed.`,
        code: 403,
      };
    }

    // Allow cancellation from any non-terminal state
    if (nextStatus === "CANCELLED") {
      // CANCELLED can be reached from REQUESTED, ACCEPTED, or IN_PROGRESS
      if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
        return {
          success: false,
          error: `Cannot cancel trip. Status is ${currentStatus}.`,
          code: 400,
        };
      }
      // Allow cancellation - will be handled by the calling endpoint with proper authorization
    }

    // CANCELLED is special - allowed from non-terminal states (handled above)
    if (nextStatus !== "CANCELLED" && !isValidTransition(currentStatus, nextStatus)) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[TRIP-STATE-ERROR] tripId=${tripId} actor=${actor} invalid transition ${currentStatus} → ${nextStatus}`
        );
      }
      return {
        success: false,
        error: `Invalid state transition: ${currentStatus} → ${nextStatus}. Expected next state: ${getNextAllowedStatus(currentStatus) || "none"}`,
        code: 400,
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

    if (nextStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[TRIP-STATE] tripId=${tripId} actor=${actor} cancelled from ${currentStatus}`
        );
      }
    }

    if (nextStatus === "COMPLETED") {
      // Settlement happens automatically on completion (if needed)
      // Keep settlement logic but don't change status to SETTLED
    }

    const updatedRide = await prisma.ride.update({
      where: { id: tripId },
      data: updateData,
      include: { user: true, driver: true },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[TRIP-STATE] tripId=${tripId} actor=${actor} transitioned ${currentStatus} → ${nextStatus}`
      );
    }

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
    ACCEPTED: ["driver", "admin"],
    IN_PROGRESS: ["driver", "admin"],
    COMPLETED: ["driver", "admin"],
    CANCELLED: ["rider", "driver", "admin"], // Owner can cancel, admin can cancel any
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
