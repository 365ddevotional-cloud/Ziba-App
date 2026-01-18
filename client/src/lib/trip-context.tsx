import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type TripStatus = "REQUESTED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface PaymentInfo {
  fare: number;
  riderPaid: boolean;
  driverPaid: boolean;
  platformCommission: number;
  escrowHeld: boolean;
}

export interface DriverInfo {
  id: string;
  name: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  phone: string;
}

export interface TripData {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  distance: number;
  duration: number;
  fare: number;
  status: TripStatus;
  createdAt: string;
  paymentMethod?: string;
  driver?: DriverInfo;
  pickupLat?: number;
  pickupLng?: number;
  payment?: PaymentInfo;
}

interface TripContextType {
  currentTrip: TripData | null;
  setCurrentTrip: (trip: TripData | null) => void;
  updateTripStatus: (status: TripStatus) => void;
  cancelTrip: () => void;
  canCancel: () => boolean;
  assignDriver: (driver: DriverInfo) => void;
  completeTrip: () => void;
  processPayment: (fare: number) => void;
  processCancellation: () => void;
}

const TripContext = createContext<TripContextType | null>(null);

const TRIP_STORAGE_KEY = "ziba_current_trip";

// Helper to restore trip from localStorage (demo mode only)
function restoreTripFromStorage(): TripData | null {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return null;
  }
  try {
    const stored = localStorage.getItem(TRIP_STORAGE_KEY);
    if (stored) {
      const trip = JSON.parse(stored) as TripData;
      // Only restore if trip is not in terminal state
      if (trip.status !== "COMPLETED" && trip.status !== "CANCELLED") {
        return trip;
      }
    }
  } catch (error) {
    console.warn("[TripProvider] Failed to restore trip from localStorage:", error);
  }
  return null;
}

// Helper to persist trip to localStorage (demo mode only)
function persistTripToStorage(trip: TripData | null) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }
  try {
    if (trip) {
      localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
    } else {
      localStorage.removeItem(TRIP_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("[TripProvider] Failed to persist trip to localStorage:", error);
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  // Dev-only safety assertion: verify TripProvider is mounted
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    console.log("[TripProvider] TripProvider mounted");
  }
  
  // Restore trip from localStorage on mount (demo mode only)
  const [currentTrip, setCurrentTripState] = useState<TripData | null>(() => restoreTripFromStorage());
  
  // Wrapper to persist changes to localStorage
  const setCurrentTrip = (trip: TripData | null) => {
    setCurrentTripState(trip);
    persistTripToStorage(trip);
  };

  const updateTripStatus = (status: TripStatus) => {
    if (currentTrip) {
      const updated = { ...currentTrip, status };
      setCurrentTripState(updated);
      persistTripToStorage(updated);
    }
  };

  const cancelTrip = () => {
    if (currentTrip) {
      const updated = { ...currentTrip, status: "CANCELLED" as const };
      setCurrentTripState(updated);
      persistTripToStorage(updated);
    }
  };

  const canCancel = () => {
    if (!currentTrip) return false;
    return currentTrip.status === "REQUESTED" || currentTrip.status === "CONFIRMED";
  };

  const assignDriver = (driver: DriverInfo) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        driver,
        status: "IN_PROGRESS" as const,
      };
      setCurrentTripState(updated);
      persistTripToStorage(updated);
    }
  };

  const processPayment = (fare: number) => {
    // This will be called from components that have access to wallet context
    // Payment processing logic is handled in the component
  };

  const processCancellation = () => {
    // This will be called from components that have access to wallet context
    // Cancellation refund logic is handled in the component
  };

  const completeTrip = () => {
    if (currentTrip) {
      const updated = { ...currentTrip, status: "COMPLETED" as const };
      setCurrentTripState(updated);
      persistTripToStorage(updated);
      // Clear trip after a delay to allow UI to show completion
      setTimeout(() => {
        setCurrentTripState(null);
        persistTripToStorage(null);
      }, 3000);
    }
  };

  // Expose setCurrentTrip that persists to localStorage
  return (
    <TripContext.Provider
      value={{
        currentTrip,
        setCurrentTrip: (trip: TripData | null) => {
          setCurrentTripState(trip);
          persistTripToStorage(trip);
        },
        updateTripStatus,
        cancelTrip,
        canCancel,
        assignDriver,
        completeTrip,
        processPayment,
        processCancellation,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within TripProvider");
  }
  return context;
}
