import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import { RouteMap } from "@/components/route-map";
import {
  MapPin,
  Navigation,
  ChevronLeft,
  Loader2,
  Clock,
  Locate,
} from "lucide-react";

interface RouteData {
  distance: number;
  duration: number;
}

export default function RiderRequest() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setPickup("Current Location (GPS)");
      setIsLocating(false);
      toast({
        title: "Location detected",
        description: "Using your current location as pickup",
      });
    }, 1000);
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteData({ distance, duration });
  };

  const handleContinue = () => {
    if (!pickup || !destination) {
      toast({
        title: "Enter locations",
        description: "Please enter both pickup and destination",
        variant: "destructive",
      });
      return;
    }

    if (!routeData) {
      toast({
        title: "Calculating route",
        description: "Please wait for route calculation to complete",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams({
      pickup,
      destination,
      distance: routeData.distance.toFixed(2),
      duration: routeData.duration.toString(),
    });
    navigate(`/rider/confirm?${params.toString()}`);
  };

  const recentLocations = [
    { name: "Home", address: "123 Main Street, Lagos" },
    { name: "Work", address: "456 Business Park, Victoria Island" },
    { name: "Gym", address: "Fitness Center, Lekki Phase 1" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Request a Ride</h1>
      </header>

      <main className="flex-1 p-5 space-y-5 pb-24">
        {/* Location Inputs */}
        <Card className="ziba-card-elevated">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <Input
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 pr-12 h-12"
                  data-testid="input-pickup"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  data-testid="button-locate"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Locate className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
                <Input
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 h-12"
                  data-testid="input-destination"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <RouteMap
          pickup={pickup}
          destination={destination}
          onRouteCalculated={handleRouteCalculated}
        />

        {/* Route Info */}
        {routeData && (
          <Card className="ziba-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation className="w-4 h-4" />
                  <span>{routeData.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>~{routeData.duration} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Places */}
        <div>
          <h2 className="ziba-caption mb-3">Recent Places</h2>
          <div className="space-y-2">
            {recentLocations.map((loc, index) => (
              <Card
                key={index}
                className="ziba-card hover-elevate cursor-pointer"
                onClick={() => setDestination(loc.address)}
                data-testid={`card-recent-${index}`}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{loc.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{loc.address}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          className="w-full h-12"
          onClick={handleContinue}
          disabled={!pickup || !destination}
          data-testid="button-continue"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Continue
        </Button>
      </main>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
