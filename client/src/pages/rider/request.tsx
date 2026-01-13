import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  MapPin,
  Navigation,
  ChevronLeft,
  Loader2,
  Clock,
  Locate,
} from "lucide-react";

export default function RiderRequest() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isLocating, setIsLocating] = useState(false);

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

  const handleContinue = () => {
    if (!pickup || !destination) {
      toast({
        title: "Enter locations",
        description: "Please enter both pickup and destination",
        variant: "destructive",
      });
      return;
    }
    const params = new URLSearchParams({ pickup, destination });
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

      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
                <Input
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 pr-12"
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500" />
                <Input
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                  data-testid="input-destination"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center h-40">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Map Preview</p>
            <p className="text-xs">(Coming soon)</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Places</h2>
          <div className="space-y-2">
            {recentLocations.map((loc, index) => (
              <Card
                key={index}
                className="hover-elevate cursor-pointer"
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

        <Button
          className="w-full"
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
