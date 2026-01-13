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
  Clock,
  Navigation,
  X,
  ChevronLeft,
  Loader2,
  User,
  RefreshCw,
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
      toast({
        title: "Cancel failed",
        description: error.message || "Could not cancel ride",
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testStartMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/test-start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({ title: "Ride started", description: "You're on your way!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Ride completed", description: "Thanks for riding with us!" });
      navigate(`/rider/trip-summary/${data.id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        
        <main className="flex-1 p-4 flex flex-col items-center justify-center pb-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No Active Ride</h2>
              <p className="text-muted-foreground">You don't have any rides in progress</p>
              <Link href="/rider/home">
                <Button className="w-full" data-testid="button-request-new">
                  Request a Ride
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        <RiderBottomNav activeTab="home" />
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          title: "Looking for driver...",
          description: "We're finding you a driver nearby",
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          icon: Loader2,
          animate: true,
        };
      case "ACCEPTED":
      case "DRIVER_EN_ROUTE":
        return {
          title: "Driver on the way",
          description: "Your driver is heading to pick you up",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          icon: Navigation,
          animate: false,
        };
      case "ARRIVED":
        return {
          title: "Driver has arrived",
          description: "Your driver is waiting at the pickup point",
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          icon: MapPin,
          animate: false,
        };
      case "IN_PROGRESS":
        return {
          title: "Trip in progress",
          description: "Enjoy your ride!",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          icon: Car,
          animate: false,
        };
      default:
        return {
          title: "Status unknown",
          description: "Please wait...",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          icon: Clock,
          animate: false,
        };
    }
  };

  const statusInfo = getStatusInfo(activeRide.status);
  const StatusIcon = statusInfo.icon;

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
            Driver Arrived
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
            Start Ride
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
            Complete Ride
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/rider/home">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Your Ride</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-10 h-10 ${statusInfo.color} ${statusInfo.animate ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{statusInfo.title}</h2>
              <p className="text-muted-foreground">{statusInfo.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium text-foreground">{activeRide.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{activeRide.dropoffLocation}</p>
              </div>
            </div>
            {activeRide.fareEstimate && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Fare</span>
                <span className="font-semibold text-foreground">
                  NGN {activeRide.fareEstimate.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {activeRide.driver && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{activeRide.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{activeRide.driver.averageRating.toFixed(1)}</span>
                    <span className="mx-1">-</span>
                    <span>{activeRide.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm text-primary font-medium mt-1">{activeRide.driver.vehiclePlate}</p>
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

        {/* Test Mode Controls */}
        {isTestMode && (
          <Card className="border-dashed border-orange-500/50 bg-orange-500/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-orange-500 text-sm font-medium">
                <Wrench className="w-4 h-4" />
                Test Mode Controls
              </div>
              {getTestControlButton()}
            </CardContent>
          </Card>
        )}

        {["REQUESTED", "ACCEPTED", "ARRIVED"].includes(activeRide.status) && (
          <Button
            variant="destructive"
            className="w-full"
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
