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

export function TripProvider({ children }: { children: ReactNode }) {
  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null);

  const updateTripStatus = (status: TripStatus) => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status });
    }
  };

  const cancelTrip = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: "CANCELLED" });
    }
  };

  const canCancel = () => {
    if (!currentTrip) return false;
    return currentTrip.status === "REQUESTED" || currentTrip.status === "CONFIRMED";
  };

  const assignDriver = (driver: DriverInfo) => {
    if (currentTrip) {
      setCurrentTrip({
        ...currentTrip,
        driver,
        status: "IN_PROGRESS",
      });
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
      setCurrentTrip({ ...currentTrip, status: "COMPLETED" });
      // Clear trip after a delay to allow UI to show completion
      setTimeout(() => {
        setCurrentTrip(null);
      }, 3000);
    }
  };

  return (
    <TripContext.Provider
      value={{
        currentTrip,
        setCurrentTrip,
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
