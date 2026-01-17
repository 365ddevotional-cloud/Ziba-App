import { useEffect, useState, useRef } from "react";
import { Loader2, MapPin } from "lucide-react";

interface RouteMapProps {
  pickup: string;
  destination: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

export function RouteMap({ pickup, destination, onRouteCalculated }: RouteMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onRouteCalculated);
  const lastPickupRef = useRef<string>("");
  const lastDestinationRef = useRef<string>("");

  // Update callback ref when it changes (without triggering effect)
  useEffect(() => {
    callbackRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  useEffect(() => {
    if (!pickup || !destination) {
      setIsLoading(false);
      return;
    }

    // Prevent recalculation if inputs haven't changed
    if (pickup === lastPickupRef.current && destination === lastDestinationRef.current) {
      return;
    }

    lastPickupRef.current = pickup;
    lastDestinationRef.current = destination;

    setIsLoading(true);
    setError(null);

    // Calculate route using Haversine formula (simple distance calculation)
    const calculateRoute = async () => {
      try {
        // For now, use simple geocoding simulation
        // In production, this would use a real geocoding service
        const pickupCoords = await geocodeAddress(pickup);
        const destCoords = await geocodeAddress(destination);

        if (!pickupCoords || !destCoords) {
          setError("Could not find locations");
          setIsLoading(false);
          return;
        }

        const distance = calculateDistance(
          pickupCoords.lat,
          pickupCoords.lng,
          destCoords.lat,
          destCoords.lng
        );

        // Estimate duration: ~30 km/h average speed in city
        const duration = Math.round((distance / 30) * 60); // minutes

        if (callbackRef.current) {
          callbackRef.current(distance, duration);
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to calculate route");
        setIsLoading(false);
      }
    };

    calculateRoute();
  }, [pickup, destination]);

  // Simple geocoding simulation (returns mock coordinates)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // In production, use a real geocoding API
    // For now, return mock coordinates based on address hash
    if (!address || address.trim() === "") return null;

    // Simple hash to generate consistent coordinates
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Lagos, Nigeria approximate bounds
    const lat = 6.5244 + (hash % 100) / 1000;
    const lng = 3.3792 + ((hash >> 8) % 100) / 1000;

    return { lat, lng };
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
    return R * c; // Distance in km
  };

  if (!pickup || !destination) {
    return (
      <div className="bg-muted/30 rounded-xl h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Enter locations to see map</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-muted/30 rounded-xl h-64 flex items-center justify-center border border-destructive/20">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-xl h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-xs">Calculating route...</p>
        </div>
      </div>
    );
  }

  // Simple map visualization - using static map as fallback
  // In production, integrate with Google Maps, Mapbox, or similar service
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-muted/20" style={{ height: "256px" }}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{pickup}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="border-l-2 border-dashed border-primary/30 h-16"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{destination}</span>
        </div>
      </div>
    </div>
  );
}
