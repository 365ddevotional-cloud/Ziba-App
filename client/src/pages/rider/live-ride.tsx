import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

  const { data: activeRide, isLoading, refetch, isFetching } = useQuery<Ride | null>({
    queryKey: ["/api/rider/active-ride"],
    staleTime: 1000 * 60,
  });

  const { data: testModeData } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/test-mode"],
    staleTime: 1000 * 60 * 5,
  });

  const isTestMode = testModeData?.enabled ?? false;

  const cancelMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({
        title: "Ride cancelled",
        description: "Your ride has been cancelled",
      });
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
      toast({ title: "Trip completed", description: "Thanks for riding with Ziba!" });
      navigate(`/rider/trip-summary/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Test complete error:", error);
      toast({ title: "Action failed", description: "Please try again", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="ziba-body-muted">Loading your ride...</p>
        </div>
      </div>
    );
  }

  if (!activeRide) {
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          headline: "Finding your driver",
          subtext: "This usually takes less than a minute",
          colorClass: "ziba-status-searching",
          bgClass: "ziba-status-searching-bg",
          icon: Loader2,
          animate: true,
        };
      case "ACCEPTED":
      case "DRIVER_EN_ROUTE":
        return {
          headline: "Driver on the way",
          subtext: "Your driver is heading to pick you up",
          colorClass: "ziba-status-enroute",
          bgClass: "ziba-status-enroute-bg",
          icon: Navigation,
          animate: false,
        };
      case "ARRIVED":
        return {
          headline: "Driver has arrived",
          subtext: "Your driver is waiting at the pickup location",
          colorClass: "ziba-status-arrived",
          bgClass: "ziba-status-arrived-bg",
          icon: MapPin,
          animate: false,
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

  const statusInfo = getStatusInfo(activeRide.status);
  const StatusIcon = statusInfo.icon;

  const canCancel = ["REQUESTED", "ACCEPTED", "DRIVER_EN_ROUTE", "ARRIVED"].includes(activeRide.status);

  const getTestControlButton = () => {
    if (!isTestMode) return null;
    
    const isPending = testArriveMutation.isPending || testStartMutation.isPending || testCompleteMutation.isPending;

    switch (activeRide.status) {
      case "ACCEPTED":
      case "DRIVER_EN_ROUTE":
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

        {/* Driver Card - Clean, Single Card */}
        {activeRide.driver && (
          <Card className="ziba-card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{activeRide.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{activeRide.driver.averageRating.toFixed(1)}</span>
                    <span className="text-border">|</span>
                    <span>{activeRide.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm font-medium text-primary mt-1">{activeRide.driver.vehiclePlate}</p>
                </div>
                <a href={`tel:${activeRide.driver.phone}`}>
                  <Button size="icon" variant="outline" data-testid="button-call-driver">
                    <Phone className="w-5 h-5" />
                  </Button>
                </a>
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
                <p className="ziba-body truncate">{activeRide.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="ziba-caption">Drop-off</p>
                <p className="ziba-body truncate">{activeRide.dropoffLocation}</p>
              </div>
            </div>
            {activeRide.fareEstimate && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="ziba-body-muted">Estimated fare</span>
                <span className="font-semibold text-foreground">
                  NGN {activeRide.fareEstimate.toLocaleString()}
                </span>
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
        {canCancel && (
          <Button
            variant="outline"
            className="w-full ziba-cancel-btn"
            onClick={() => cancelMutation.mutate(activeRide.id)}
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
        )}
      </main>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
