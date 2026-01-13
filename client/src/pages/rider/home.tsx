import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRiderAuth } from "@/lib/rider-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Navigation,
  Car,
  Clock,
  DollarSign,
  User,
  Wallet,
  History,
  HeadphonesIcon,
  Menu,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface FareEstimate {
  fare: number;
  currency: string;
  currencySymbol: string;
  breakdown: {
    baseFare: number;
    distanceCharge: number;
    timeCharge: number;
    surgeApplied: boolean;
    surgeMultiplier: number;
  };
}

export default function RiderHome() {
  const { user } = useRiderAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const { data: activeRide } = useQuery({
    queryKey: ["/api/rider/active-ride"],
  });

  const { data: wallet } = useQuery({
    queryKey: ["/api/rider/wallet"],
  });

  const requestRideMutation = useMutation({
    mutationFn: async (data: { pickupLocation: string; dropoffLocation: string; fareEstimate?: number }) => {
      const res = await apiRequest("POST", "/api/rider/request-ride", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({
        title: "Ride requested!",
        description: "Looking for a driver...",
      });
      navigate("/rider/live");
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Could not request ride",
        variant: "destructive",
      });
    },
  });

  const estimateFare = async () => {
    if (!destination) {
      toast({
        title: "Enter destination",
        description: "Please enter where you want to go",
        variant: "destructive",
      });
      return;
    }

    setIsEstimating(true);
    try {
      const mockDistance = 5 + Math.random() * 15;
      const mockDuration = mockDistance * 2 + Math.random() * 10;
      
      const res = await apiRequest("POST", "/api/rider/fare-estimate", {
        distance: mockDistance,
        duration: mockDuration,
        countryCode: "NG",
      });
      const data = await res.json();
      setFareEstimate(data);
    } catch (error: any) {
      toast({
        title: "Estimation failed",
        description: error.message || "Could not calculate fare",
        variant: "destructive",
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleRequestRide = () => {
    if (!pickup || !destination) {
      toast({
        title: "Missing locations",
        description: "Please enter pickup and destination",
        variant: "destructive",
      });
      return;
    }

    requestRideMutation.mutate({
      pickupLocation: pickup,
      dropoffLocation: destination,
      fareEstimate: fareEstimate?.fare,
    });
  };

  if (activeRide) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Ride in Progress</h2>
            <p className="text-muted-foreground">You have an active ride</p>
            <Link href="/rider/live">
              <Button className="w-full" data-testid="button-view-ride">
                View Ride Status
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Ziba Rider</h1>
            <p className="text-sm text-muted-foreground">Hello, {user?.fullName?.split(" ")[0]}</p>
          </div>
        </div>
        <Link href="/rider/profile">
          <Button size="icon" variant="ghost" data-testid="button-profile">
            <User className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold text-foreground">Where to?</h2>
            
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
                <Input
                  placeholder="Current location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10"
                  data-testid="input-pickup"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500" />
                <Input
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setFareEstimate(null);
                  }}
                  className="pl-10"
                  data-testid="input-destination"
                />
              </div>
            </div>

            {!fareEstimate ? (
              <Button
                className="w-full"
                onClick={estimateFare}
                disabled={!destination || isEstimating}
                data-testid="button-estimate"
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Get Fare Estimate
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Estimated Fare</span>
                    <span className="text-2xl font-bold text-foreground">
                      {fareEstimate.currencySymbol}{fareEstimate.fare.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Base fare</span>
                      <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance</span>
                      <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.distanceCharge.toFixed(0)}</span>
                    </div>
                    {fareEstimate.breakdown.surgeApplied && (
                      <div className="flex justify-between text-yellow-500">
                        <span>Surge ({fareEstimate.breakdown.surgeMultiplier}x)</span>
                        <span>Applied</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleRequestRide}
                  disabled={requestRideMutation.isPending}
                  data-testid="button-request-ride"
                >
                  {requestRideMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4 mr-2" />
                      Request Ride
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {wallet && (
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/rider/wallet")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="font-semibold text-foreground">
                    NGN {(wallet.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </main>

      <nav className="border-t border-border bg-card">
        <div className="flex items-center justify-around p-2">
          <Link href="/rider">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-home">
              <Car className="w-5 h-5 mb-1 text-primary" />
              <span className="text-xs text-primary">Home</span>
            </Button>
          </Link>
          <Link href="/rider/history">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-history">
              <History className="w-5 h-5 mb-1" />
              <span className="text-xs">Rides</span>
            </Button>
          </Link>
          <Link href="/rider/wallet">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-wallet">
              <Wallet className="w-5 h-5 mb-1" />
              <span className="text-xs">Wallet</span>
            </Button>
          </Link>
          <Link href="/rider/support">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-support">
              <HeadphonesIcon className="w-5 h-5 mb-1" />
              <span className="text-xs">Support</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export function RiderBottomNav({ activeTab = "home" }: { activeTab?: "home" | "history" | "wallet" | "support" }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
      <div className="flex items-center justify-around p-2">
        <Link href="/rider">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-home">
            <Car className={`w-5 h-5 mb-1 ${activeTab === "home" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "home" ? "text-primary" : ""}`}>Home</span>
          </Button>
        </Link>
        <Link href="/rider/history">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-history">
            <History className={`w-5 h-5 mb-1 ${activeTab === "history" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "history" ? "text-primary" : ""}`}>Rides</span>
          </Button>
        </Link>
        <Link href="/rider/wallet">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-wallet">
            <Wallet className={`w-5 h-5 mb-1 ${activeTab === "wallet" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "wallet" ? "text-primary" : ""}`}>Wallet</span>
          </Button>
        </Link>
        <Link href="/rider/support">
          <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-support">
            <HeadphonesIcon className={`w-5 h-5 mb-1 ${activeTab === "support" ? "text-primary" : ""}`} />
            <span className={`text-xs ${activeTab === "support" ? "text-primary" : ""}`}>Support</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
