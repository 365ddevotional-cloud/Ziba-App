import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  Navigation,
  Power,
  Wallet,
  MapPin,
  Clock,
  User,
  Phone,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProtectionStatus {
  gpsIntervals: {
    idle: number;
    enRoute: number;
    inProgress: number;
  };
}

interface ActiveRide {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  lockedFare: number | null;
  fareEstimate: number | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  status: string;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    averageRating: number;
  };
}

interface DriverStats {
  todayEarnings: number;
  todayTrips: number;
  rating: number;
  totalTrips: number;
}

interface DriverProfile {
  id: string;
  fullName: string;
  email: string;
  isOnline: boolean;
  status: string;
  averageRating: number;
}

export default function DriverHome() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const idleGpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: driver, isLoading: driverLoading } = useQuery<DriverProfile>({
    queryKey: ["/api/driver/me"],
    staleTime: 1000 * 60,
  });

  const { data: activeRide, isLoading: rideLoading } = useQuery<ActiveRide | null>({
    queryKey: ["/api/driver/active-ride"],
    staleTime: 1000 * 30,
  });

  const { data: stats } = useQuery<DriverStats>({
    queryKey: ["/api/driver/stats"],
    staleTime: 1000 * 60,
  });

  const { data: protectionStatus } = useQuery<ProtectionStatus>({
    queryKey: ["/api/map-cost/protection-status"],
    staleTime: 1000 * 60 * 5,
  });

  const idleGpsInterval = protectionStatus?.gpsIntervals?.idle || 90000;

  const toggleOnlineMutation = useMutation({
    mutationFn: async (goOnline: boolean) => {
      const res = await apiRequest("POST", goOnline ? "/api/driver/go-online" : "/api/driver/go-offline");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/me"] });
      toast({
        title: data.isOnline ? "You're online" : "You're offline",
        description: data.isOnline ? "You can now receive ride requests" : "You won't receive new ride requests",
      });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const idleGpsMutation = useMutation({
    mutationFn: async (data: { lat: number; lng: number }) => {
      const res = await apiRequest("POST", "/api/driver/idle-gps", data);
      return res.json();
    },
  });

  const sendIdleGps = useCallback(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        idleGpsMutation.mutate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Idle GPS error:", error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [idleGpsMutation]);

  useEffect(() => {
    const isOnlineAndIdle = driver?.isOnline && !activeRide;

    // Always clear existing interval when dependencies change
    if (idleGpsIntervalRef.current) {
      clearInterval(idleGpsIntervalRef.current);
      idleGpsIntervalRef.current = null;
    }

    // Set new interval if conditions are met
    if (isOnlineAndIdle) {
      sendIdleGps();
      idleGpsIntervalRef.current = setInterval(sendIdleGps, idleGpsInterval);
    }

    return () => {
      if (idleGpsIntervalRef.current) {
        clearInterval(idleGpsIntervalRef.current);
        idleGpsIntervalRef.current = null;
      }
    };
  }, [driver?.isOnline, activeRide, sendIdleGps, idleGpsInterval]);

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Not Authenticated</h1>
        <p className="text-muted-foreground text-center mb-6">Please sign in to access the driver dashboard</p>
        <Link href="/signup">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (activeRide) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-primary-foreground">Active Ride</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-foreground/80">{activeRide.status.replace(/_/g, " ")}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 pb-24">
          <Card className="ziba-card-elevated">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{activeRide.user.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500">★ {activeRide.user.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                {activeRide.user.phone && (
                  <a href={`tel:${activeRide.user.phone}`}>
                    <Button size="icon" variant="outline" data-testid="button-call-rider">
                      <Phone className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="ziba-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium text-foreground">{activeRide.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Drop-off</p>
                  <p className="text-sm font-medium text-foreground">{activeRide.dropoffLocation}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {activeRide.estimatedDistance && (
                    <span>{activeRide.estimatedDistance.toFixed(1)} km</span>
                  )}
                  {activeRide.estimatedDuration && (
                    <span>{Math.round(activeRide.estimatedDuration)} min</span>
                  )}
                </div>
                <span className="font-bold text-lg text-foreground">
                  NGN {(activeRide.lockedFare || activeRide.fareEstimate || 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <NavigateButton
            status={activeRide.status}
            pickupLat={activeRide.pickupLat}
            pickupLng={activeRide.pickupLng}
            dropoffLat={activeRide.dropoffLat}
            dropoffLng={activeRide.dropoffLng}
            pickupLocation={activeRide.pickupLocation}
            dropoffLocation={activeRide.dropoffLocation}
          />

          <Link href={`/driver/ride/${activeRide.id}`}>
            <Button variant="outline" className="w-full" data-testid="button-view-ride-details">
              View Ride Details
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">Welcome back</p>
            <h1 className="text-lg font-semibold text-primary-foreground">{driver.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-foreground">
              {driver.isOnline ? "Online" : "Offline"}
            </span>
            <Switch
              checked={driver.isOnline}
              onCheckedChange={(checked) => toggleOnlineMutation.mutate(checked)}
              disabled={toggleOnlineMutation.isPending}
              data-testid="switch-online-status"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {!driver.isOnline && (
          <Card className="border-amber-400/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4 flex items-center gap-3">
              <Power className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">You're offline</p>
                <p className="text-sm text-muted-foreground">Go online to receive ride requests</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="ziba-card">
            <CardContent className="p-4 text-center">
              <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                NGN {(stats?.todayEarnings || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Today's Earnings</p>
            </CardContent>
          </Card>
          <Card className="ziba-card">
            <CardContent className="p-4 text-center">
              <Car className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.todayTrips || 0}</p>
              <p className="text-xs text-muted-foreground">Today's Trips</p>
            </CardContent>
          </Card>
        </div>

        <Card className="ziba-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Rating</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  {driver.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-xl font-bold text-foreground">{stats?.totalTrips || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {driver.isOnline && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium text-foreground">Waiting for ride requests</p>
            <p className="text-sm text-muted-foreground">New ride requests will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
}

function NavigateButton({
  status,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  pickupLocation,
  dropoffLocation,
}: {
  status: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  pickupLocation: string;
  dropoffLocation: string;
}) {
  const isNavigatingToPickup = ["ACCEPTED", "DRIVER_EN_ROUTE"].includes(status);
  const isNavigatingToDropoff = ["IN_PROGRESS"].includes(status);
  const hasArrived = status === "ARRIVED";

  const getNavigationUrl = () => {
    let lat: number | null = null;
    let lng: number | null = null;
    let address: string = "";

    if (isNavigatingToPickup) {
      lat = pickupLat;
      lng = pickupLng;
      address = pickupLocation;
    } else if (isNavigatingToDropoff) {
      lat = dropoffLat;
      lng = dropoffLng;
      address = dropoffLocation;
    }

    if (!lat || !lng) {
      const encodedAddress = encodeURIComponent(address);
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isAndroid) {
      return `google.navigation:q=${lat},${lng}&mode=d`;
    } else if (isIOS) {
      return `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    }
  };

  const handleNavigate = () => {
    const url = getNavigationUrl();
    
    if (url.startsWith("google.navigation:") || url.startsWith("comgooglemaps://")) {
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${
        isNavigatingToPickup 
          ? (pickupLat && pickupLng ? `${pickupLat},${pickupLng}` : encodeURIComponent(pickupLocation))
          : (dropoffLat && dropoffLng ? `${dropoffLat},${dropoffLng}` : encodeURIComponent(dropoffLocation))
      }&travelmode=driving`;

      const start = Date.now();
      window.location.href = url;
      
      setTimeout(() => {
        if (Date.now() - start < 2000) {
          window.open(fallbackUrl, "_blank");
        }
      }, 1500);
    } else {
      window.open(url, "_blank");
    }
  };

  if (!isNavigatingToPickup && !isNavigatingToDropoff) {
    return null;
  }

  return (
    <Button
      className="w-full h-14 text-lg gap-3"
      onClick={handleNavigate}
      data-testid="button-navigate"
    >
      <Navigation className="w-6 h-6" />
      Navigate to {isNavigatingToPickup ? "Pickup" : "Drop-off"}
    </Button>
  );
}
