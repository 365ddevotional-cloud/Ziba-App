// Demo Controller - SINGLE SOURCE OF TRUTH for demo data
// DEV MODE ONLY - Frontend-only orchestration
// All demo pages must READ from here, not re-create state

import { TripData } from "./trip-context";

const DEMO_RIDER_EMAIL = "demo@ziba.app";
const DEMO_RIDER_NAME = "Demo Rider";
const DEMO_RIDER_PASSWORD = "1234567";
const DEMO_DRIVER_EMAIL = "demo-driver@ziba.app";
const DEMO_DRIVER_NAME = "Demo Driver";
const DEMO_WALLET_BALANCE = 10000; // NGN
const DEMO_TRIP_STORAGE_KEY = "ziba_demo_trip";
const DEMO_RECEIPT_STORAGE_KEY = "ziba_demo_receipt";

// Demo Rider Credentials
export const DEMO_RIDER = {
  email: DEMO_RIDER_EMAIL,
  name: DEMO_RIDER_NAME,
  password: DEMO_RIDER_PASSWORD,
};

// Demo Driver Credentials
export const DEMO_DRIVER = {
  email: DEMO_DRIVER_EMAIL,
  name: DEMO_DRIVER_NAME,
};

// Wallet Balance
export const DEMO_WALLET = {
  balance: DEMO_WALLET_BALANCE,
};

/**
 * Get or create demo trip from localStorage
 */
export function getDemoTrip(): TripData | null {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return null;
  }

  try {
    const stored = localStorage.getItem(DEMO_TRIP_STORAGE_KEY);
    if (stored) {
      const trip = JSON.parse(stored) as TripData;
      // Only return non-terminal trips
      if (trip.status !== "COMPLETED" && trip.status !== "CANCELLED") {
        return trip;
      }
    }
  } catch (error) {
    console.warn("[DemoController] Failed to load demo trip:", error);
  }

  return null;
}

/**
 * Save demo trip to localStorage
 */
export function saveDemoTrip(trip: TripData | null): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    if (trip) {
      localStorage.setItem(DEMO_TRIP_STORAGE_KEY, JSON.stringify(trip));
    } else {
      localStorage.removeItem(DEMO_TRIP_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("[DemoController] Failed to save demo trip:", error);
  }
}

/**
 * Get demo receipt from localStorage
 */
export function getDemoReceipt(): {
  riderName: string;
  tripId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  timestamp: string;
  pickupLocation: string;
  dropoffLocation: string;
} | null {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return null;
  }

  try {
    const stored = localStorage.getItem(DEMO_RECEIPT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("[DemoController] Failed to load demo receipt:", error);
  }

  return null;
}

/**
 * Save demo receipt to localStorage
 */
export function saveDemoReceipt(receipt: {
  riderName: string;
  tripId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  timestamp: string;
  pickupLocation: string;
  dropoffLocation: string;
} | null): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    if (receipt) {
      localStorage.setItem(DEMO_RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
    } else {
      localStorage.removeItem(DEMO_RECEIPT_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("[DemoController] Failed to save demo receipt:", error);
  }
}

/**
 * Auto-repair: Ensure demo data exists if missing
 */
export function ensureDemoData(): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  // If no trip exists and we're in demo mode, create a default one
  const existingTrip = getDemoTrip();
  if (!existingTrip) {
    // Don't auto-create - let pages create when needed
    // This function is just for validation
  }
}

/**
 * Clear all demo data (for testing)
 */
export function clearDemoData(): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  localStorage.removeItem(DEMO_TRIP_STORAGE_KEY);
  localStorage.removeItem(DEMO_RECEIPT_STORAGE_KEY);
}
