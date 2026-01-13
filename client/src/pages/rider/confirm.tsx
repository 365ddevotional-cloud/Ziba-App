import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  
  const [selectedPayment, setSelectedPayment] = useState("wallet");
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(true);

  useEffect(() => {
    const fetchEstimate = async () => {
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
      } catch (error) {
        toast({
          title: "Estimation failed",
          description: "Could not calculate fare. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsEstimating(false);
      }
    };

    fetchEstimate();
  }, []);

  const requestRideMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/rider/request-ride", {
        pickupLocation: pickup,
        dropoffLocation: destination,
        fareEstimate: fareEstimate?.fare,
        paymentMethod: selectedPayment,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({
        title: "Ride requested!",
        description: "Looking for a driver...",
      });
      navigate("/rider/active-ride");
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Could not request ride",
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
            {isEstimating ? (
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
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance</span>
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.distanceCharge.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>{fareEstimate.currencySymbol}{fareEstimate.breakdown.timeCharge.toFixed(0)}</span>
                  </div>
                  {fareEstimate.breakdown.surgeApplied && (
                    <div className="flex justify-between text-yellow-500">
                      <span>Surge ({fareEstimate.breakdown.surgeMultiplier}x)</span>
                      <span>Applied</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Could not estimate fare
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated arrival: 3-5 minutes</span>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-card border-t border-border z-40">
        <Button
          className="w-full"
          size="lg"
          onClick={() => requestRideMutation.mutate()}
          disabled={requestRideMutation.isPending || !fareEstimate}
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
