import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  Car,
  Star,
  ChevronLeft,
  Loader2,
  User,
  CheckCircle,
  MapPin,
  Clock,
  Wallet,
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

  const { data: ride, isLoading } = useQuery<Ride>({
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

  if (!ride) {
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
        
        <main className="flex-1 p-4 flex flex-col items-center justify-center pb-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-muted-foreground">Trip not found</p>
              <Link href="/rider/history">
                <Button data-testid="button-view-trips">View All Trips</Button>
              </Link>
            </CardContent>
          </Card>
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

      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-green-500/10">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Trip Completed</h2>
              <p className="text-muted-foreground">
                {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            {ride.fareEstimate && (
              <div className="text-3xl font-bold text-foreground">
                NGN {ride.fareEstimate.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium text-foreground">{ride.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{ride.dropoffLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {ride.driver && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{ride.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{ride.driver.averageRating.toFixed(1)}</span>
                    <span className="mx-1">-</span>
                    <span>{ride.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm text-primary font-medium mt-1">{ride.driver.vehiclePlate}</p>
                </div>
              </div>

              {!hasRated && ride.status === "COMPLETED" && (
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Rate your driver</p>
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
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
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
                      {rateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
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
                        className={`w-6 h-6 ${
                          star <= displayRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Link href="/rider/home" className="flex-1">
            <Button className="w-full" data-testid="button-done">
              Done
            </Button>
          </Link>
        </div>
      </main>

      <RiderBottomNav activeTab="trips" />
    </div>
  );
}
