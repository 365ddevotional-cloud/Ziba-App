import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Navigation,
  Phone,
  User,
  ChevronLeft,
  Loader2,
  MapPin,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface Ride {
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
  startedAt: string | null;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    averageRating: number;
  };
}

export default function DriverActiveRide() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [gpsInterval, setGpsInterval] = useState<NodeJS.Timeout | null>(null);

  const { data: ride, isLoading, refetch } = useQuery<Ride>({
    queryKey: ["/api/driver/ride", id],
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ rideId, status }: { rideId: string; status: string }) => {
      const res = await apiRequest("POST", `/api/driver/rides/${rideId}/update-status`, { status });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/ride", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/active-ride"] });
      
      if (data.status === "COMPLETED") {
        navigate("/driver/ride-complete");
      } else {
        toast({
          title: "Status updated",
          description: `Ride status: ${data.status.replace(/_/g, " ")}`,
        });
      }
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const logGpsMutation = useMutation({
    mutationFn: async (data: { rideId: string; lat: number; lng: number; speed?: number; bearing?: number }) => {
      const res = await apiRequest("POST", "/api/driver/gps-log", data);
      return res.json();
    },
  });

  const startGpsTracking = useCallback(() => {
    if (!ride || ride.status !== "IN_PROGRESS") return;

    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            logGpsMutation.mutate({
              rideId: ride.id,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              speed: position.coords.speed || undefined,
              bearing: position.coords.heading || undefined,
            });
          },
          (error) => {
            console.warn("GPS tracking error:", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    }, 6000);

    setGpsInterval(interval);
  }, [ride, logGpsMutation]);

  useEffect(() => {
    if (ride?.status === "IN_PROGRESS" && !gpsInterval) {
      startGpsTracking();
    }

    return () => {
      if (gpsInterval) {
        clearInterval(gpsInterval);
        setGpsInterval(null);
      }
    };
  }, [ride?.status, gpsInterval, startGpsTracking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Ride not found</h1>
        <Link href="/driver/home">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const getStatusAction = () => {
    switch (ride.status) {
      case "ACCEPTED":
      case "DRIVER_EN_ROUTE":
        return {
          label: "I've Arrived",
          nextStatus: "ARRIVED",
          icon: MapPin,
        };
      case "ARRIVED":
        return {
          label: "Start Trip",
          nextStatus: "IN_PROGRESS",
          icon: Play,
        };
      case "IN_PROGRESS":
        return {
          label: "Complete Trip",
          nextStatus: "COMPLETED",
          icon: CheckCircle,
        };
      default:
        return null;
    }
  };

  const statusAction = getStatusAction();

  const handleNavigate = () => {
    const isNavigatingToPickup = ["ACCEPTED", "DRIVER_EN_ROUTE"].includes(ride.status);
    let lat: number | null;
    let lng: number | null;
    let address: string;

    if (isNavigatingToPickup) {
      lat = ride.pickupLat;
      lng = ride.pickupLng;
      address = ride.pickupLocation;
    } else {
      lat = ride.dropoffLat;
      lng = ride.dropoffLng;
      address = ride.dropoffLocation;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    let url: string;

    if (lat && lng) {
      if (isAndroid) {
        url = `google.navigation:q=${lat},${lng}&mode=d`;
      } else if (isIOS) {
        url = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      }
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
    }

    if (url.startsWith("google.navigation:") || url.startsWith("comgooglemaps://")) {
      const fallbackUrl = lat && lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;

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

  const isNavigating = ["ACCEPTED", "DRIVER_EN_ROUTE", "IN_PROGRESS"].includes(ride.status);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border bg-primary">
        <Link href="/driver/home">
          <Button size="icon" variant="ghost" className="text-primary-foreground" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-primary-foreground">Active Ride</h1>
          <p className="text-xs text-primary-foreground/80">{ride.status.replace(/_/g, " ")}</p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-32">
        <Card className="ziba-card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{ride.user.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500">★ {ride.user.averageRating.toFixed(1)}</span>
                </div>
              </div>
              {ride.user.phone && (
                <a href={`tel:${ride.user.phone}`}>
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
                <p className="text-sm font-medium text-foreground">{ride.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Drop-off</p>
                <p className="text-sm font-medium text-foreground">{ride.dropoffLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="ziba-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {ride.estimatedDistance && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{ride.estimatedDistance.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                )}
                {ride.estimatedDuration && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{Math.round(ride.estimatedDuration)}</p>
                    <p className="text-xs text-muted-foreground">min</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Locked Fare</p>
                <p className="text-2xl font-bold text-foreground">
                  NGN {(ride.lockedFare || ride.fareEstimate || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {ride.status === "IN_PROGRESS" && ride.startedAt && (
          <Card className="border-blue-400/50 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">Trip in progress</p>
                <p className="text-sm text-muted-foreground">
                  Started at {new Date(ride.startedAt).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 space-y-3">
        {isNavigating && (
          <Button
            variant="outline"
            className="w-full h-12 gap-2"
            onClick={handleNavigate}
            data-testid="button-navigate-external"
          >
            <Navigation className="w-5 h-5" />
            Open in Google Maps
          </Button>
        )}
        
        {statusAction && (
          <Button
            className="w-full h-14 text-lg gap-2"
            onClick={() => updateStatusMutation.mutate({ rideId: ride.id, status: statusAction.nextStatus })}
            disabled={updateStatusMutation.isPending}
            data-testid="button-update-status"
          >
            {updateStatusMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <statusAction.icon className="w-5 h-5" />
            )}
            {statusAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
