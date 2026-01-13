import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  Star,
  ChevronLeft,
  Loader2,
  User,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fareEstimate: number | null;
  status: string;
  createdAt: string;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    averageRating: number;
  };
  driverRating?: {
    rating: number;
  };
}

export default function RiderTripSummary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const rideId = params.id;
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: ride, isLoading, isError } = useQuery<Ride>({
    queryKey: ["/api/rider/rides", rideId],
    queryFn: async () => {
      const res = await fetch(`/api/rider/rides/${rideId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ride");
      return res.json();
    },
    enabled: !!rideId,
    staleTime: 1000 * 60,
  });

  const rateMutation = useMutation({
    mutationFn: async ({ rideId, rating }: { rideId: string; rating: number }) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/rate`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/rides", rideId] });
      toast({ title: "Thanks for your feedback!", description: "Your rating has been submitted" });
    },
    onError: (error: any) => {
      console.error("Rating error:", error);
      toast({ title: "Unable to submit rating", description: "Please try again", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="ziba-body-muted">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (isError || !ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/rider/history">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Trip Summary</h1>
        </header>
        
        <main className="flex-1 p-6 flex flex-col items-center justify-center pb-24">
          <div className="text-center space-y-4 max-w-xs">
            <h2 className="ziba-headline">Unable to load trip</h2>
            <p className="ziba-subheadline">We couldn't find this trip. It may have been removed or there was a connection issue.</p>
            <Link href="/rider/history">
              <Button className="mt-4" data-testid="button-view-trips">View All Trips</Button>
            </Link>
          </div>
        </main>

        <RiderBottomNav activeTab="trips" />
      </div>
    );
  }

  const hasRated = !!ride.driverRating;
  const displayRating = hasRated ? ride.driverRating!.rating : selectedRating;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/history">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Trip Summary</h1>
      </header>

      <main className="flex-1 p-5 space-y-5 pb-24">
        {/* Trip Completed Hero */}
        <div className="text-center py-4 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center ziba-status-complete-bg">
            <CheckCircle className="w-10 h-10 ziba-status-complete" />
          </div>
          <h1 className="ziba-headline">Trip completed</h1>
          <p className="ziba-subheadline">
            {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
          {ride.fareEstimate && (
            <div className="text-3xl font-bold text-foreground pt-2">
              NGN {ride.fareEstimate.toLocaleString()}
            </div>
          )}
        </div>

        {/* Trip Route */}
        <Card className="ziba-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="ziba-caption">Pickup</p>
                <p className="ziba-body truncate">{ride.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="ziba-caption">Drop-off</p>
                <p className="ziba-body truncate">{ride.dropoffLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Card with Rating */}
        {ride.driver && (
          <Card className="ziba-card-elevated">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{ride.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{ride.driver.averageRating.toFixed(1)}</span>
                    <span className="text-border">|</span>
                    <span>{ride.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm font-medium text-primary mt-1">{ride.driver.vehiclePlate}</p>
                </div>
              </div>

              {/* Rating Section */}
              {!hasRated && ride.status === "COMPLETED" && (
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground text-center">How was your trip?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                        data-testid={`button-rate-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= displayRating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {selectedRating > 0 && (
                    <Button
                      className="w-full"
                      onClick={() => rateMutation.mutate({ rideId: ride.id, rating: selectedRating })}
                      disabled={rateMutation.isPending}
                      data-testid="button-submit-rating"
                    >
                      {rateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit Rating
                    </Button>
                  )}
                </div>
              )}

              {hasRated && (
                <div className="pt-4 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">Your rating</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= displayRating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Done Button */}
        <Link href="/rider/home">
          <Button className="w-full h-12" data-testid="button-done">
            Done
          </Button>
        </Link>
      </main>

      <RiderBottomNav activeTab="trips" />
    </div>
  );
}
