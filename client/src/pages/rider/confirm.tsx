import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateFare } from "@/lib/pricing";
import { useTrip } from "@/lib/trip-context";
import { useDriverStore } from "@/lib/driver-store";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  MapPin,
  ChevronLeft,
  Loader2,
  Car,
  CreditCard,
  Wallet,
  Check,
  Clock,
  DollarSign,
} from "lucide-react";

const paymentMethods = [
  { id: "wallet", name: "Wallet Balance", icon: Wallet },
  { id: "card", name: "Debit/Credit Card", icon: CreditCard },
  { id: "cash", name: "Cash", icon: DollarSign },
];

export default function RiderConfirm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const pickup = params.get("pickup") || "";
  const destination = params.get("destination") || "";
  const distanceParam = params.get("distance");
  const durationParam = params.get("duration");
  
  const { setCurrentTrip, assignDriver: assignDriverToTrip } = useTrip();
  const { findNearestDriver, assignDriver: markDriverUnavailable } = useDriverStore();
  const { canAfford, updateRiderBalance } = useWallet();
  const [selectedPayment, setSelectedPayment] = useState("wallet");
  const [routeData, setRouteData] = useState<{ distance: number; duration: number } | null>(
    distanceParam && durationParam
      ? { distance: parseFloat(distanceParam), duration: parseInt(durationParam, 10) }
      : null
  );

  // Calculate fare locally using pricing logic
  const fareEstimate = useMemo(() => {
    if (!routeData) return null;
    return calculateFare(routeData.distance, routeData.duration);
  }, [routeData]);

  const requestRideMutation = useMutation({
    mutationFn: async () => {
      if (!routeData || !fareEstimate) {
        throw new Error("Missing route or fare data");
      }

      // Check wallet balance if paying with wallet
      if (selectedPayment === "wallet" && !canAfford(fareEstimate.fare)) {
        throw new Error("Insufficient wallet balance");
      }

      // Create trip in memory (not persisted to database)
      const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock pickup coordinates (in production, use geocoding)
      const pickupLat = 6.5244 + (Math.random() - 0.5) * 0.1;
      const pickupLng = 3.3792 + (Math.random() - 0.5) * 0.1;

      const trip = {
        id: tripId,
        pickupLocation: pickup,
        dropoffLocation: destination,
        distance: routeData.distance,
        duration: routeData.duration,
        fare: fareEstimate.fare,
        status: "CONFIRMED" as const,
        createdAt: new Date().toISOString(),
        paymentMethod: selectedPayment,
        pickupLat,
        pickupLng,
        payment: {
          fare: fareEstimate.fare,
          riderPaid: false,
          driverPaid: false,
          platformCommission: 0,
          escrowHeld: false,
        },
      };

      setCurrentTrip(trip);

      // Find and assign nearest driver
      setTimeout(() => {
        const nearestDriver = findNearestDriver(pickupLat, pickupLng);
        if (nearestDriver) {
          markDriverUnavailable(nearestDriver.id);
          assignDriverToTrip({
            id: nearestDriver.id,
            name: nearestDriver.name,
            vehicleType: nearestDriver.vehicleType,
            vehiclePlate: nearestDriver.vehiclePlate,
            rating: nearestDriver.rating,
            phone: nearestDriver.phone,
          });
        } else {
          toast({
            title: "No drivers available",
            description: "Please try again in a moment",
            variant: "destructive",
          });
        }
      }, 1000);

      // Note: Backend API call removed for this phase
      // In production, this would persist to database
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({
        title: "Ride confirmed!",
        description: "Looking for a driver...",
      });
      navigate("/rider/active-ride");
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Could not confirm ride",
        variant: "destructive",
      });
    },
  });

  if (!pickup || !destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Missing Location</h2>
            <p className="text-muted-foreground">Please enter pickup and destination</p>
            <Link href="/rider/request">
              <Button className="w-full" data-testid="button-go-back">
                Enter Locations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/request">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Confirm Ride</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-40">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium text-foreground">{pickup}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{destination}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {!routeData ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Calculating fare...</span>
              </div>
            ) : fareEstimate ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Fare</span>
                  <span className="text-2xl font-bold text-foreground" data-testid="text-fare">
                    {fareEstimate.currencySymbol}{fareEstimate.fare.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span>Base fare</span>
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.baseFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance ({routeData.distance.toFixed(1)} km)</span>
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.distanceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time (~{routeData.duration} min)</span>
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.timeCharge.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Could not calculate fare
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Payment Method</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;
              return (
                <Card
                  key={method.id}
                  className={`hover-elevate cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedPayment(method.id)}
                  data-testid={`card-payment-${method.id}`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="flex-1 font-medium text-foreground">{method.name}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {routeData && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Estimated duration: ~{routeData.duration} minutes • {routeData.distance.toFixed(1)} km
            </span>
          </div>
        )}
      </main>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-card border-t border-border z-40">
        <Button
          className="w-full"
          size="lg"
          onClick={() => requestRideMutation.mutate()}
          disabled={requestRideMutation.isPending || !fareEstimate || !routeData}
          data-testid="button-confirm-ride"
        >
          {requestRideMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <Car className="w-5 h-5 mr-2" />
              Confirm Ride
            </>
          )}
        </Button>
      </div>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
