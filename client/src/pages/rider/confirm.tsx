import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateFare } from "@/lib/pricing";
import { useTrip } from "@/lib/trip-context";
import { useDriverStore } from "@/lib/driver-store";
import { useWallet } from "@/lib/wallet-context";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { user, isLoading: authLoading } = useRiderAuth();
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
  const [rideMode, setRideMode] = useState<"PRIVATE" | "SHARE">("PRIVATE");
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerNotes, setPassengerNotes] = useState("");
  const [routeData, setRouteData] = useState<{ distance: number; duration: number } | null>(
    distanceParam && durationParam
      ? { distance: parseFloat(distanceParam), duration: parseInt(durationParam, 10) }
      : null
  );
  const [hasValidatedParams, setHasValidatedParams] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Validate required params on mount (only once)
  useEffect(() => {
    if (authLoading || hasValidatedParams) return;
    
    if (!pickup || !destination) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RiderConfirm] Missing required params:", { pickup, destination });
      }
      toast({
        title: "Missing information",
        description: "Please provide pickup and destination locations",
        variant: "destructive",
      });
      navigate("/rider/home?error=missing-locations");
      return;
    }

    // Validate distance and duration params
    if (!distanceParam || !durationParam) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RiderConfirm] Missing route data:", { distanceParam, durationParam });
      }
      toast({
        title: "Missing route information",
        description: "Please request a ride with valid route data",
        variant: "destructive",
      });
      navigate("/rider/home?error=missing-route-data");
      return;
    }

    // Validate numeric values
    const distance = parseFloat(distanceParam);
    const duration = parseInt(durationParam, 10);
    if (isNaN(distance) || isNaN(duration) || distance <= 0 || duration <= 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RiderConfirm] Invalid route data:", { distance, duration });
      }
      toast({
        title: "Invalid route information",
        description: "Please request a ride with valid route data",
        variant: "destructive",
      });
      navigate("/rider/home?error=invalid-route-data");
      return;
    }

    setRouteData({ distance, duration });
    setHasValidatedParams(true);
  }, [pickup, destination, distanceParam, durationParam, authLoading, hasValidatedParams, navigate, toast]);

  // Calculate fare locally using pricing logic
  const fareEstimate = useMemo(() => {
    if (!routeData) return null;
    return calculateFare(routeData.distance, routeData.duration);
  }, [routeData]);

  // Calculate adjusted fare based on ride mode
  const adjustedFare = useMemo(() => {
    if (!fareEstimate) return null;
    return rideMode === "SHARE" ? (fareEstimate.fare / 2) * 0.9 : fareEstimate.fare;
  }, [fareEstimate, rideMode]);

  const payRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      // DEMO MODE: Add timeout and fallback for payment
      const isDemoMode = process.env.NODE_ENV === "development";
      
      // In demo mode, add timeout protection
      const paymentPromise = fetch(`/api/rider/rides/${rideId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      // Add 3-second timeout for demo mode
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Payment timeout - demo mode fallback")), 3000)
      );

      try {
        const response = await (isDemoMode 
          ? Promise.race([paymentPromise, timeoutPromise]) as Promise<Response>
          : paymentPromise
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Payment failed" }));
          throw new Error(error.message || "Payment failed");
        }

        return response.json();
      } catch (error: any) {
        // In demo mode, if payment fails or times out, treat as success
        if (isDemoMode && (error.message?.includes("timeout") || error.message?.includes("Failed to fetch"))) {
          console.warn("[Demo Mode] Payment API not responding, treating as successful");
          return { success: true, demo: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      setIsPaid(true);
      toast({
        title: "Payment successful (mock)",
        description: "Your payment has been processed",
      });
    },
    onError: (error: any) => {
      // In demo mode, don't block on payment errors - treat as success
      const isDemoMode = process.env.NODE_ENV === "development";
      if (isDemoMode) {
        console.warn("[Demo Mode] Payment error, treating as successful:", error.message);
        setIsPaid(true);
        toast({
          title: "Payment successful (demo mode)",
          description: "Your payment has been processed",
        });
      } else {
        toast({
          title: "Payment failed",
          description: error.message || "Could not process payment",
          variant: "destructive",
        });
      }
    },
  });

  const requestRideMutation = useMutation({
    mutationFn: async () => {
      if (!routeData || !fareEstimate || !adjustedFare) {
        throw new Error("Missing route or fare data");
      }

      // Check wallet balance if paying with wallet
      if (selectedPayment === "wallet" && !canAfford(adjustedFare)) {
        throw new Error("Insufficient wallet balance");
      }

      // Mock pickup coordinates (in production, use geocoding)
      const pickupLat = 6.5244 + (Math.random() - 0.5) * 0.1;
      const pickupLng = 3.3792 + (Math.random() - 0.5) * 0.1;
      const destLat = 6.5244 + (Math.random() - 0.5) * 0.1;
      const destLng = 3.3792 + (Math.random() - 0.5) * 0.1;

      // Make API call to request ride
      const rideType = params.get("rideType") || "ZIBAX";
      
      const requestBody: any = {
        pickupLocation: pickup,
        dropoffLocation: destination,
        fareEstimate: fareEstimate.fare,
        rideMode: rideMode,
        rideType: rideType,
        pickupLat,
        pickupLng,
        destLat,
        destLng,
      };

      // Add passenger fields if coordinator
      if (user?.isTripCoordinator) {
        if (!passengerName || !passengerPhone) {
          throw new Error("Passenger name and phone are required when booking as a trip coordinator");
        }
        requestBody.passengerName = passengerName;
        requestBody.passengerPhone = passengerPhone;
        if (passengerNotes) {
          requestBody.passengerNotes = passengerNotes;
        }
      }

      const response = await fetch("/api/rider/request-ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (response.status === 401) {
        if (process.env.NODE_ENV === "development") {
          console.error("[RiderConfirm] Authentication failed, redirecting to login");
        }
        throw new Error("Authentication failed. Please log in again.");
      }

      if (response.status === 403) {
        if (process.env.NODE_ENV === "development") {
          console.error("[RiderConfirm] Forbidden: Not authorized as rider");
        }
        throw new Error("You are not authorized to request rides.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to request ride" }));
        if (process.env.NODE_ENV === "development") {
          console.error("[RiderConfirm] Request failed:", response.status, error);
        }
        throw new Error(error.message || error.error || "Failed to request ride");
      }

      const ride = await response.json();
      return ride;
    },
    onSuccess: async (ride: any) => {
      // Process mock payment immediately after ride creation
      try {
        await payRideMutation.mutateAsync(ride.id);
      } catch (error) {
        // Payment failed - show error but don't block navigation
        toast({
          title: "Payment failed",
          description: "Ride created but payment failed. Please complete payment.",
          variant: "destructive",
        });
      }

      // Set trip in TripProvider for immediate UI update (DEMO MODE: frontend controls state)
      if (routeData && fareEstimate) {
        const tripFare = adjustedFare || fareEstimate.fare;
        // In demo mode, start with CONFIRMED status (payment done, ready to progress)
        // This ensures auto-progression works immediately
        const tripData = {
          id: ride.id,
          pickupLocation: pickup,
          dropoffLocation: destination,
          distance: routeData.distance,
          duration: routeData.duration,
          fare: tripFare,
          status: "CONFIRMED" as const, // Will auto-progress to IN_PROGRESS -> COMPLETED
          createdAt: new Date().toISOString(),
          paymentMethod: selectedPayment,
          payment: {
            fare: tripFare,
            riderPaid: true, // Payment is done, trip can progress
            driverPaid: false,
            platformCommission: tripFare * 0.15,
            escrowHeld: true,
          },
        };
        setCurrentTrip(tripData);
        
        // In demo mode, immediately navigate - trip context will handle progression
        if (process.env.NODE_ENV === "development") {
          console.log("[RiderConfirm] Trip set in context, auto-progression will start");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      
      if (ride.shareStatus === "SEARCHING") {
        toast({
          title: "Finding a co-rider...",
          description: "We'll match you with another rider going the same way.",
        });
        navigate("/rider/active-ride");
      } else if (ride.shareStatus === "MATCHED_AND_ASSIGNED" || ride.driver) {
        toast({
          title: "Ride confirmed!",
          description: "Driver is being assigned...",
        });
        navigate("/rider/active-ride");
      } else {
        toast({
          title: "Ride confirmed!",
          description: "Looking for a driver...",
        });
        navigate("/rider/active-ride");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Could not confirm ride",
        variant: "destructive",
      });
    },
  });

  // Show loading state while validating or auth is loading
  if (authLoading || !hasValidatedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Loading...</h2>
            <p className="text-muted-foreground">Validating ride information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final check for missing params (shouldn't reach here after validation)
  if (!pickup || !destination || !routeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Missing Information</h2>
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

        {/* Passenger Info (if coordinator) */}
        {user?.isTripCoordinator && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-foreground mb-3">Passenger Information</h2>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Passenger Name *</Label>
                    <Input
                      id="passengerName"
                      type="text"
                      placeholder="John Doe"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengerPhone">Passenger Phone *</Label>
                    <Input
                      id="passengerPhone"
                      type="tel"
                      placeholder="+2348012345678"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengerNotes">Notes (Optional)</Label>
                    <Input
                      id="passengerNotes"
                      type="text"
                      placeholder="Prefers front seat, special needs, etc."
                      value={passengerNotes}
                      onChange={(e) => setPassengerNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-card border-t border-border z-40 space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={() => requestRideMutation.mutate()}
          disabled={requestRideMutation.isPending || payRideMutation.isPending || !fareEstimate || !routeData}
          data-testid="button-pay-now"
        >
          {requestRideMutation.isPending || payRideMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay Now (Mock)
            </>
          )}
        </Button>
        {isPaid && (
          <div className="text-center text-sm text-green-600 dark:text-green-400">
            ✓ Payment successful (mock)
          </div>
        )}
      </div>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
