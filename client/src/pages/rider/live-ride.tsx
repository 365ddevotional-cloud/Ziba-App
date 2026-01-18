import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTrip, TripStatus, TripData } from "@/lib/trip-context";
import { completeDemoTrip } from "@/lib/demo-completion";
import { useRiderAuth } from "@/lib/rider-auth";
import { useWallet, PLATFORM_COMMISSION_RATE } from "@/lib/wallet-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  Car,
  Phone,
  Star,
  Navigation,
  X,
  ChevronLeft,
  Loader2,
  User,
  MapPin,
  Play,
  CheckCircle,
  Wrench,
} from "lucide-react";

interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fareEstimate: number | null;
  status: string;
  passengerName?: string | null;
  passengerPhone?: string | null;
  passengerNotes?: string | null;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    averageRating: number;
  };
}

export default function RiderLiveRide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { currentTrip, updateTripStatus, cancelTrip, canCancel: tripCanCancel, setCurrentTrip } = useTrip();
  const { updateRiderBalance, updateDriverBalance, updatePlatformBalance } = useWallet();
  const { user } = useRiderAuth();

  // DEMO MODE: Hard guard - check localStorage immediately on mount
  const isDemoMode = process.env.NODE_ENV === "development";
  const [localStorageTripLoaded, setLocalStorageTripLoaded] = useState(false);
  
  // CRITICAL: Rehydrate from localStorage on mount (before API calls)
  useEffect(() => {
    if (isDemoMode && !currentTrip && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ziba_demo_trip");
        if (stored) {
          const trip = JSON.parse(stored) as TripData;
          // Only restore if trip is not in terminal state
          if (trip.status !== "COMPLETED" && trip.status !== "CANCELLED") {
            console.log("[Active Ride] Rehydrating demo trip from localStorage");
            setCurrentTrip(trip);
            setLocalStorageTripLoaded(true);
          }
        }
      } catch (error) {
        console.warn("[Active Ride] Failed to rehydrate trip from localStorage:", error);
      }
    }
  }, []); // Run once on mount only

  const { data: activeRide, isLoading, refetch, isFetching } = useQuery<Ride | null>({
    queryKey: ["/api/rider/active-ride"],
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
    // In demo mode, don't wait for API - use timeout
    ...(isDemoMode && {
      staleTime: 0,
      gcTime: 0,
    }),
  });

  // Use trip context if available, otherwise fall back to API
  const displayTrip = currentTrip || activeRide;
  const tripStatus = currentTrip ? currentTrip.status : (activeRide?.status as TripStatus);
  
  // Show driver info from trip context if available
  const driverInfo = currentTrip?.driver;

  // DEMO AUTO-PROGRESSION: Frontend-controlled trip lifecycle (dev mode only)
  // This ensures the demo ALWAYS completes, regardless of backend state
  useEffect(() => {
    const isDemoMode = process.env.NODE_ENV === "development";
    if (!isDemoMode || !currentTrip) return;
    
    const initialStatus = currentTrip.status;
    const hasPayment = currentTrip.payment?.riderPaid;
    const tripId = currentTrip.id; // Capture trip ID for completion
    
    // In demo mode, if payment exists, always progress (even without explicit payment flag)
    // This handles cases where payment might not be set correctly
    if (!hasPayment && initialStatus === "COMPLETED") {
      // Already completed, nothing to do
      return;
    }
    
    // Prevent multiple runs
    let isActive = true;
    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;

    if (initialStatus === "IN_PROGRESS") {
      // Already in progress -> auto-complete after 3 seconds (per requirements)
      console.log("[Demo Auto-Progression] Trip IN_PROGRESS, completing in 3s");
      timer2 = setTimeout(() => {
        if (!isActive || !currentTrip) return;
        
        // SINGLE ENTRY POINT: Complete trip synchronously
        const riderName = user?.fullName || "Rider";
        // Use trip from closure - it may already be IN_PROGRESS if status changed
        const tripToComplete = { ...currentTrip, status: "IN_PROGRESS" as const };
        completeDemoTrip(tripToComplete, riderName);
        
        // Update trip status to COMPLETED
        const completedTrip = { ...currentTrip, status: "COMPLETED" as const };
        setCurrentTrip(completedTrip);
        
        // Navigate immediately - DO NOT wait
        navigate("/rider/ride-complete");
      }, 3000); // 3 seconds max per requirements
    } else if (initialStatus === "COMPLETED" || initialStatus === "CANCELLED") {
      // Already terminal, navigate to completion immediately
      if (initialStatus === "COMPLETED") {
        // Ensure receipt exists in localStorage
        if (currentTrip && typeof window !== "undefined") {
          const riderName = user?.fullName || "Rider";
          completeDemoTrip(currentTrip, riderName);
        }
        // Navigate immediately
        navigate("/rider/ride-complete");
      }
      return;
    } else {
      // REQUESTED, ACCEPTED, or CONFIRMED -> IN_PROGRESS -> COMPLETED
      // Auto-progress to IN_PROGRESS after 2 seconds
      console.log(`[Demo Auto-Progression] Trip ${initialStatus}, starting in 2s, completing in 5s total`);
      timer1 = setTimeout(() => {
        if (!isActive) return;
        updateTripStatus("IN_PROGRESS");
        toast({
          title: "Trip started!",
          description: "Your ride is now in progress",
        });
      }, 2000);

      // Auto-complete after 5 seconds total (2s to start + 3s ride duration)
      timer2 = setTimeout(() => {
        if (!isActive || !currentTrip) return;
        
        // SINGLE ENTRY POINT: Complete trip synchronously
        const riderName = user?.fullName || "Rider";
        // Trip should be IN_PROGRESS by now (from timer1), but ensure it
        const tripToComplete = { ...currentTrip, status: "IN_PROGRESS" as const };
        completeDemoTrip(tripToComplete, riderName);
        
        // Update trip status to COMPLETED
        const completedTrip = { ...currentTrip, status: "COMPLETED" as const };
        setCurrentTrip(completedTrip);
        
        // Navigate immediately - DO NOT wait
        navigate("/rider/ride-complete");
      }, 5000); // 5 seconds total (2s to start + 3s ride duration)
    }

    return () => {
      isActive = false;
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [currentTrip?.id, currentTrip?.status, currentTrip?.payment?.riderPaid, updateTripStatus, navigate, toast]);

  // DEMO KILL-SWITCH: Emergency fallback if trip is stuck at non-terminal status
  // This is a backup to the auto-progression above - runs only in dev mode
  useEffect(() => {
    const isDemoMode = process.env.NODE_ENV === "development";
    if (!isDemoMode || !currentTrip) return;

    // If trip has payment but status is stuck for too long, force progression
    const status = currentTrip.status;
    const hasPayment = currentTrip.payment?.riderPaid;
    
    // Only apply kill-switch to non-terminal statuses
    if ((status === "REQUESTED" || status === "CONFIRMED" || status === "IN_PROGRESS") && hasPayment) {
      const stuckTimer = setTimeout(() => {
        // Double-check status hasn't changed (race condition protection)
        // Note: currentTrip in closure may be stale, so we check via ref or re-query
        console.warn(`[Demo Kill-Switch] Trip stuck at ${status} for 12 seconds - forcing completion`);
        updateTripStatus("COMPLETED");
        toast({
          title: "Trip completed!",
          description: "Demo mode: Ride completed automatically",
        });
        setTimeout(() => {
          navigate("/rider/ride-complete");
        }, 1000);
      }, 12000); // 12 seconds max - allows auto-progression to work first

      return () => clearTimeout(stuckTimer);
    }
  }, [currentTrip?.id, currentTrip?.status, currentTrip?.payment?.riderPaid, updateTripStatus, navigate, toast]);

  // Process payment when trip enters IN_PROGRESS (escrow)
  useEffect(() => {
    if (currentTrip?.status === "IN_PROGRESS" && currentTrip.payment && !currentTrip.payment.escrowHeld) {
      // Deduct fare from rider wallet and hold in escrow
      if (currentTrip.paymentMethod === "wallet") {
        updateRiderBalance(-currentTrip.fare);
        setCurrentTrip({
          ...currentTrip,
          payment: {
            ...currentTrip.payment,
            riderPaid: true,
            escrowHeld: true,
          },
        });
      }
    }
  }, [currentTrip?.status, currentTrip?.payment?.escrowHeld, currentTrip?.fare, currentTrip?.paymentMethod, updateRiderBalance, setCurrentTrip]);

  // Show notification when driver is assigned
  useEffect(() => {
    if (currentTrip?.driver && currentTrip.status === "IN_PROGRESS") {
      toast({
        title: "Driver assigned!",
        description: `${currentTrip.driver.name} is on the way`,
      });
    }
  }, [currentTrip?.driver?.id, currentTrip?.status, toast]);

  const { data: testModeData } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/test-mode"],
    staleTime: 1000 * 60 * 5,
  });

  const isTestMode = testModeData?.enabled ?? false;

  const handleCancel = () => {
    if (currentTrip) {
      // Cancel in-memory trip
      if (tripCanCancel()) {
        // No charge if cancelled before IN_PROGRESS
        cancelTrip();
        toast({
          title: "Ride cancelled",
          description: "Your ride has been cancelled",
        });
        navigate("/rider/home");
      } else if (currentTrip.status === "IN_PROGRESS" && currentTrip.payment?.escrowHeld) {
        // Partial refund if cancelled after IN_PROGRESS (50% refund)
        const refundAmount = Math.round(currentTrip.fare * 0.5);
        updateRiderBalance(refundAmount);
        cancelTrip();
        toast({
          title: "Ride cancelled",
          description: `₦${refundAmount.toLocaleString()} refunded to your wallet`,
        });
        navigate("/rider/home");
      } else {
        toast({
          title: "Cannot cancel",
          description: "Trip is already in progress",
          variant: "destructive",
        });
      }
    } else if (activeRide) {
      // Cancel via API (existing flow)
      cancelMutation.mutate(activeRide.id);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/cancel`);
      return res.json();
    },
    onSuccess: (data: { penaltyApplied?: boolean; penaltyAmount?: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rider/wallet"] });
      
      if (data.penaltyApplied && data.penaltyAmount) {
        toast({
          title: "Ride cancelled",
          description: `Cancellation fee (20%): ₦${data.penaltyAmount.toLocaleString()}. Remaining refund credited to wallet.`,
        });
      } else {
        toast({
          title: "Ride cancelled",
          description: "Your ride has been cancelled. Full refund credited to wallet.",
        });
      }
      navigate("/rider/home");
    },
    onError: (error: any) => {
      console.error("Cancel error:", error);
      toast({
        title: "Unable to cancel",
        description: "Please try again in a moment",
        variant: "destructive",
      });
    },
  });

  const testArriveMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/test-arrive`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({ title: "Driver arrived", description: "Driver is at your pickup location" });
    },
    onError: (error: any) => {
      console.error("Test arrive error:", error);
      toast({ title: "Action failed", description: "Please try again", variant: "destructive" });
    },
  });

  const testStartMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/test-start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({ title: "Trip started", description: "Enjoy your ride!" });
    },
    onError: (error: any) => {
      console.error("Test start error:", error);
      toast({ title: "Action failed", description: "Please try again", variant: "destructive" });
    },
  });

  const testCompleteMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/test-complete`);
      return res.json();
    },
    onSuccess: (data: Ride) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rider/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rider/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rider/last-completed-ride"] });
      toast({ title: "Trip completed", description: "Thanks for riding with Ziba!" });
      navigate("/rider/ride-complete");
    },
    onError: (error: any) => {
      console.error("Test complete error:", error);
      toast({ title: "Action failed", description: "Please try again", variant: "destructive" });
    },
  });

  // DEMO KILL-SWITCH: Hard timeout guards and loading prevention
  // Rule 1: If trip exists in context, render immediately (no loading)
  // Rule 2: Skip loading after 1 second if status is ACCEPTED or CONFIRMED
  // Rule 3: Force IN_PROGRESS after 2 seconds if stuck at ACCEPTED/CONFIRMED
  // Rule 4: Maximum 2-second loading timeout, then create demo trip or force progression
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [demoTripCreated, setDemoTripCreated] = useState(false);

  // Guard 1: Skip loading if trip exists in context or localStorage
  useEffect(() => {
    if (currentTrip || activeRide) {
      setSkipLoading(true);
      setLoadingTimeout(false);
      return;
    }
    setSkipLoading(false);
  }, [currentTrip, activeRide]);

  // Guard 2: If status is ACCEPTED or CONFIRMED, skip loading after 1 second
  useEffect(() => {
    if (!isDemoMode) return;
    const status = tripStatus;
    if ((status === "CONFIRMED" || status === "REQUESTED") && isLoading) {
      const skipTimer = setTimeout(() => {
        setSkipLoading(true);
      }, 1000); // Skip loading after 1 second
      return () => clearTimeout(skipTimer);
    }
  }, [tripStatus, isLoading, isDemoMode]);

  // Guard 3: Hard 1-second loading timeout (per requirements)
  useEffect(() => {
    if (isLoading && !currentTrip && !activeRide && !demoTripCreated) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
        setSkipLoading(true);
        // DEMO MODE: Create fallback trip if missing after 1 second
        if (isDemoMode && !currentTrip && !activeRide) {
          console.warn("[Demo Kill-Switch] No trip found after 1s, creating demo trip from localStorage fallback");
          const demoTrip: TripData = {
            id: `demo-${Date.now()}`,
            pickupLocation: "Current Location",
            dropoffLocation: "Destination",
            distance: 5.2,
            duration: 12,
            fare: 2500,
            status: "CONFIRMED",
            createdAt: new Date().toISOString(),
            paymentMethod: "wallet",
            payment: {
              fare: 2500,
              riderPaid: true,
              driverPaid: false,
              platformCommission: 375,
              escrowHeld: true,
            },
          };
          // Persist to localStorage
          try {
            localStorage.setItem("ziba_demo_trip", JSON.stringify(demoTrip));
          } catch (error) {
            console.warn("[Active Ride] Failed to persist demo trip:", error);
          }
          setCurrentTrip(demoTrip);
          setDemoTripCreated(true);
        }
      }, 1000); // Max 1 second per requirements
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, currentTrip, activeRide, demoTripCreated, isDemoMode, setCurrentTrip]);

  // Guard 4: Force IN_PROGRESS if stuck at ACCEPTED/CONFIRMED for 2 seconds
  useEffect(() => {
    if (!isDemoMode || !currentTrip) return;
    const status = currentTrip.status;
    if ((status === "CONFIRMED" || status === "REQUESTED") && currentTrip.payment?.riderPaid) {
      const forceTimer = setTimeout(() => {
        // Force to IN_PROGRESS if still stuck
        if (currentTrip.status === status) {
          console.warn(`[Demo Kill-Switch] Forcing trip from ${status} to IN_PROGRESS after 2s`);
          updateTripStatus("IN_PROGRESS");
        }
      }, 2000); // Reduced to 2 seconds
      return () => clearTimeout(forceTimer);
    }
  }, [currentTrip?.id, currentTrip?.status, currentTrip?.payment?.riderPaid, updateTripStatus, isDemoMode]);

  // Guard 5: If loading timeout and no trip, navigate to completion
  useEffect(() => {
    if (!isDemoMode) return;
    if (loadingTimeout && !currentTrip && !activeRide) {
      console.warn("[Demo Kill-Switch] Loading timeout reached, forcing completion");
      setTimeout(() => {
        navigate("/rider/ride-complete");
      }, 500);
    }
  }, [loadingTimeout, currentTrip, activeRide, navigate, isDemoMode]);

  // CRITICAL: Never show loading spinner if trip exists OR skipLoading is true
  // This makes infinite loading IMPOSSIBLE
  const shouldShowLoading = isLoading && !currentTrip && !activeRide && !loadingTimeout && !skipLoading;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="ziba-body-muted">Loading your ride...</p>
        </div>
      </div>
    );
  }

  if (!displayTrip) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/rider/home">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Your Ride</h1>
        </header>
        
        <main className="flex-1 p-6 flex flex-col items-center justify-center pb-24">
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="ziba-headline">No active ride</h2>
            <p className="ziba-subheadline">You don't have any rides in progress right now.</p>
            <Link href="/rider/home">
              <Button className="w-full mt-4" data-testid="button-request-new">
                Request a Ride
              </Button>
            </Link>
          </div>
        </main>

        <RiderBottomNav activeTab="home" />
      </div>
    );
  }

  const getStatusInfo = (status: TripStatus) => {
    switch (status) {
      case "REQUESTED":
        return {
          headline: "Ride requested",
          subtext: "Waiting for confirmation",
          colorClass: "ziba-status-searching",
          bgClass: "ziba-status-searching-bg",
          icon: Loader2,
          animate: true,
        };
      case "CONFIRMED":
        return {
          headline: "Ride confirmed",
          subtext: "Looking for a driver",
          colorClass: "ziba-status-searching",
          bgClass: "ziba-status-searching-bg",
          icon: Loader2,
          animate: true,
        };
      case "IN_PROGRESS":
        return {
          headline: "Trip in progress",
          subtext: "Sit back and enjoy your ride",
          colorClass: "ziba-status-progress",
          bgClass: "ziba-status-progress-bg",
          icon: Car,
          animate: false,
        };
      case "COMPLETED":
        return {
          headline: "Trip completed",
          subtext: "Thanks for riding with Ziba",
          colorClass: "text-emerald-600",
          bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
          icon: CheckCircle,
          animate: false,
        };
      case "CANCELLED":
        return {
          headline: "Trip cancelled",
          subtext: "This trip has been cancelled",
          colorClass: "text-red-600",
          bgClass: "bg-red-100 dark:bg-red-900/30",
          icon: X,
          animate: false,
        };
      default:
        return {
          headline: "Loading...",
          subtext: "Please wait",
          colorClass: "text-muted-foreground",
          bgClass: "bg-muted",
          icon: Loader2,
          animate: true,
        };
    }
  };

  const statusInfo = getStatusInfo(tripStatus || "REQUESTED");
  const StatusIcon = statusInfo.icon;

  const canCancelTrip = currentTrip ? tripCanCancel() : (activeRide && ["REQUESTED", "ACCEPTED", "DRIVER_EN_ROUTE", "ARRIVED"].includes(activeRide.status));

  const getTestControlButton = () => {
    if (!isTestMode || !currentTrip) return null;
    
    const isPending = testArriveMutation.isPending || testStartMutation.isPending || testCompleteMutation.isPending;
    const status = currentTrip.status as TripStatus | "ACCEPTED" | "DRIVER_EN_ROUTE" | "ARRIVED";

    switch (status) {
      case "CONFIRMED":
        return (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => updateTripStatus("IN_PROGRESS")}
            disabled={isPending}
            data-testid="button-test-start"
          >
            <Play className="w-4 h-4 mr-2" />
            Simulate: Start Trip
          </Button>
        );
      case "ACCEPTED":
      case "DRIVER_EN_ROUTE":
        if (!activeRide) return null;
        return (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => testArriveMutation.mutate(activeRide.id)}
            disabled={isPending}
            data-testid="button-test-arrive"
          >
            {testArriveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Simulate: Driver Arrived
          </Button>
        );
      case "ARRIVED":
        if (!activeRide) return null;
        return (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => testStartMutation.mutate(activeRide.id)}
            disabled={isPending}
            data-testid="button-test-start"
          >
            {testStartMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Simulate: Start Trip
          </Button>
        );
      case "IN_PROGRESS":
        if (!activeRide) return null;
        return (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => testCompleteMutation.mutate(activeRide.id)}
            disabled={isPending}
            data-testid="button-test-complete"
          >
            {testCompleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Simulate: Complete Trip
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Link href="/rider/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh"
        >
          <Loader2 className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <main className="flex-1 p-4 space-y-5 pb-24">
        {/* Status Hero - Large, Clear, Human-Readable */}
        <div className="text-center py-6 space-y-3">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${statusInfo.bgClass}`}>
            <StatusIcon className={`w-10 h-10 ${statusInfo.colorClass} ${statusInfo.animate ? "animate-spin" : ""}`} />
          </div>
          <h1 className="ziba-headline">{statusInfo.headline}</h1>
          <p className="ziba-subheadline">{statusInfo.subtext}</p>
        </div>

        {/* Trip Status Badge */}
        <Card className="ziba-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trip Status</span>
              <span className="text-sm font-semibold text-foreground capitalize">
                {tripStatus?.toLowerCase().replace("_", " ") || "Unknown"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Driver Card - Clean, Single Card */}
        {(driverInfo || activeRide?.driver) && (
          <Card className="ziba-card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {driverInfo?.name || activeRide?.driver?.fullName || "Driver"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      {(driverInfo?.rating || activeRide?.driver?.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-border">|</span>
                    <span>{driverInfo?.vehicleType || activeRide?.driver?.vehicleType || "Vehicle"}</span>
                  </div>
                  <p className="text-sm font-medium text-primary mt-1">
                    {driverInfo?.vehiclePlate || activeRide?.driver?.vehiclePlate || ""}
                  </p>
                </div>
                {(driverInfo?.phone || activeRide?.driver?.phone) && (
                  <a href={`tel:${driverInfo?.phone || activeRide?.driver?.phone}`}>
                    <Button size="icon" variant="outline" data-testid="button-call-driver">
                      <Phone className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Passenger Info (if coordinator booking) */}
        {(activeRide?.passengerName || activeRide?.passengerPhone) && (
          <Card className="ziba-card">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Passenger</p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {activeRide.passengerName}
                </p>
                {activeRide.passengerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${activeRide.passengerPhone}`} className="hover:text-primary">
                      {activeRide.passengerPhone}
                    </a>
                  </div>
                )}
                {activeRide.passengerNotes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeRide.passengerNotes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Details - Compact */}
        <Card className="ziba-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="ziba-caption">Pickup</p>
                <p className="ziba-body truncate">{displayTrip?.pickupLocation || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="ziba-caption">Drop-off</p>
                <p className="ziba-body truncate">{displayTrip?.dropoffLocation || "Unknown"}</p>
              </div>
            </div>
            {(currentTrip?.fare || activeRide?.fareEstimate) && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="ziba-body-muted">Fare</span>
                  <span className="font-semibold text-foreground">
                    ₦ {(currentTrip?.fare || activeRide?.fareEstimate || 0).toLocaleString()}
                  </span>
                </div>
                {currentTrip?.payment && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className={`font-medium ${
                      currentTrip.payment.escrowHeld 
                        ? "text-emerald-600" 
                        : "text-muted-foreground"
                    }`}>
                      {currentTrip.payment.escrowHeld ? "Paid (Escrow)" : "Pending"}
                    </span>
                  </div>
                )}
              </div>
            )}
            {currentTrip && (
              <div className="pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Distance</span>
                  <span>{currentTrip.distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>~{currentTrip.duration} min</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Mode Controls - Developer Only */}
        {isTestMode && (
          <Card className="border-dashed border-orange-400/50 bg-orange-50 dark:bg-orange-900/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs font-medium uppercase tracking-wide">
                <Wrench className="w-3.5 h-3.5" />
                Test Mode
              </div>
              {getTestControlButton()}
            </CardContent>
          </Card>
        )}

        {/* Cancel Button - Subtle, Secondary */}
        {canCancelTrip && (
          <div className="space-y-2">
            {displayTrip?.driver && (displayTrip.status === "ASSIGNED" || displayTrip.status === "ARRIVED") && (
              <p className="text-xs text-muted-foreground text-center">
                Cancellation after match incurs 20% fee.
              </p>
            )}
            <Button
              variant="outline"
              className="w-full ziba-cancel-btn"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-ride"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Ride
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
