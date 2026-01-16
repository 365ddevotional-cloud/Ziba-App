import { createContext, useContext, useState, ReactNode } from "react";

export interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  available: boolean;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  phone: string;
}

interface DriverStoreContextType {
  drivers: Driver[];
  getAvailableDrivers: () => Driver[];
  assignDriver: (driverId: string) => void;
  releaseDriver: (driverId: string) => void;
  findNearestDriver: (lat: number, lng: number) => Driver | null;
}

const DriverStoreContext = createContext<DriverStoreContextType | null>(null);

// Mock driver data - in production this would come from API
const initialDrivers: Driver[] = [
  {
    id: "driver_1",
    name: "John Adebayo",
    lat: 6.5244,
    lng: 3.3792,
    available: true,
    vehicleType: "CAR",
    vehiclePlate: "LAG-123-AB",
    rating: 4.8,
    phone: "+2348012345678",
  },
  {
    id: "driver_2",
    name: "Mary Okonkwo",
    lat: 6.5344,
    lng: 3.3892,
    available: true,
    vehicleType: "BIKE",
    vehiclePlate: "LAG-456-CD",
    rating: 4.6,
    phone: "+2348012345679",
  },
  {
    id: "driver_3",
    name: "Peter Okafor",
    lat: 6.5144,
    lng: 3.3692,
    available: true,
    vehicleType: "VAN",
    vehiclePlate: "LAG-789-EF",
    rating: 4.9,
    phone: "+2348012345680",
  },
];

export function DriverStoreProvider({ children }: { children: ReactNode }) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  const getAvailableDrivers = () => {
    return drivers.filter((d) => d.available);
  };

  const assignDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, available: false } : d))
    );
  };

  const releaseDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, available: true } : d))
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestDriver = (lat: number, lng: number): Driver | null => {
    const available = getAvailableDrivers();
    if (available.length === 0) return null;

    let nearest = available[0];
    let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);

    for (const driver of available.slice(1)) {
      const distance = calculateDistance(lat, lng, driver.lat, driver.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = driver;
      }
    }

    return nearest;
  };

  return (
    <DriverStoreContext.Provider
      value={{
        drivers,
        getAvailableDrivers,
        assignDriver,
        releaseDriver,
        findNearestDriver,
      }}
    >
      {children}
    </DriverStoreContext.Provider>
  );
}

export function useDriverStore() {
  const context = useContext(DriverStoreContext);
  if (!context) {
    throw new Error("useDriverStore must be used within DriverStoreProvider");
  }
  return context;
}
