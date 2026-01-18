// Demo completion helper - SINGLE source of truth for demo trip completion
// This ensures trip and receipt are persisted synchronously before navigation

import { TripData } from "./trip-context";

const TRIP_STORAGE_KEY = "ziba_demo_trip";
const RECEIPT_STORAGE_KEY = "ziba_demo_receipt";

export interface DemoReceipt {
  riderName: string;
  tripId: string;
  amount: number;
  paymentMethod: string;
  status: "SUCCESS";
  timestamp: string;
  pickupLocation: string;
  dropoffLocation: string;
}

/**
 * Complete demo trip synchronously - NO ASYNC, NO API CALLS
 * This is the SINGLE entry point for demo completion
 */
export function completeDemoTrip(trip: TripData, riderName: string = "Rider"): DemoReceipt {
  const isDemoMode = process.env.NODE_ENV === "development";
  if (!isDemoMode || typeof window === "undefined") {
    // Return receipt object even in non-demo mode (for type safety)
    return {
      riderName,
      tripId: trip.id,
      amount: trip.fare,
      paymentMethod: trip.paymentMethod || "Wallet",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      pickupLocation: trip.pickupLocation,
      dropoffLocation: trip.dropoffLocation,
    };
  }

  // 1. Set status = COMPLETED
  const completedTrip: TripData = {
    ...trip,
    status: "COMPLETED",
  };

  // 2. Generate receipt object
  const receipt: DemoReceipt = {
    riderName,
    tripId: trip.id,
    amount: trip.fare,
    paymentMethod: trip.paymentMethod || "Wallet",
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    pickupLocation: trip.pickupLocation,
    dropoffLocation: trip.dropoffLocation,
  };

  // 3. Save both to localStorage immediately (synchronous)
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(completedTrip));
    localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
    console.log("[Demo Completion] Trip and receipt persisted to localStorage");
  } catch (error) {
    console.warn("[Demo Completion] Failed to persist to localStorage:", error);
  }

  // 4. Return receipt (TripContext update happens via setCurrentTrip call)
  return receipt;
}

/**
 * Load receipt from localStorage (demo mode only)
 */
export function loadReceiptFromStorage(): DemoReceipt | null {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return null;
  }
  try {
    const stored = localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DemoReceipt;
    }
  } catch (error) {
    console.warn("[Demo Completion] Failed to load receipt from localStorage:", error);
  }
  return null;
}

/**
 * Clear receipt from localStorage (after user navigates away)
 */
export function clearReceiptFromStorage() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }
  try {
    localStorage.removeItem(RECEIPT_STORAGE_KEY);
  } catch (error) {
    console.warn("[Demo Completion] Failed to clear receipt from localStorage:", error);
  }
}
