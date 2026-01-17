import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  CheckCircle2,
  Loader2,
  User,
  CreditCard,
  Car,
  History,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface CompletedRide {
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
  payment?: {
    status: string;
  };
}

export default function RiderRideComplete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: ride, isLoading, isError, error } = useQuery<CompletedRide>({
    queryKey: ["/api/rider/last-completed-ride"],
    staleTime: 1000 * 60,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      const errorMessage = (error as any)?.message || "";
      if (errorMessage.includes("401") || errorMessage.includes("Not authenticated")) {
        navigate("/rider/login");
      }
    }
  }, [error, navigate]);

  const rateMutation = useMutation({
    mutationFn: async ({ rideId, rating }: { rideId: string; rating: number }) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/rate`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/last-completed-ride"] });
      toast({ title: "Thanks for your feedback!", description: "Your rating has been submitted" });
    },
    onError: (error: any) => {
      console.error("Rating error:", error);
      toast({ title: "Unable to submit rating", description: "Please try again", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ziba-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-ziba-accent mx-auto" />
          <p className="text-ziba-text-secondary text-lg">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (isError || !ride || ride.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-ziba-bg flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-20 h-20 mx-auto bg-ziba-card rounded-full flex items-center justify-center border border-ziba">
            <Car className="w-10 h-10 text-ziba-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-ziba-text-primary">No Completed Ride</h2>
          <p className="text-ziba-text-secondary">You don't have a recently completed ride to view.</p>
          <Link href="/rider/home">
            <Button className="mt-6 ziba-btn-primary px-8" data-testid="button-go-home">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasRated = !!ride.driverRating;
  const displayRating = hasRated ? ride.driverRating!.rating : selectedRating;

  return (
    <div className="min-h-screen bg-ziba-bg flex flex-col animate-in fade-in duration-500">
      <main className="flex-1 p-5 space-y-6 pb-10 max-w-lg mx-auto w-full">
        <div className="text-center py-8 space-y-5">
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center bg-ziba-success-subtle ziba-success-glow">
            <CheckCircle2 className="w-14 h-14 text-ziba-success" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-ziba-text-primary">Ride Completed</h1>
            <p className="text-ziba-text-secondary text-lg">
              {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {ride.driver && (
          <Card className="bg-ziba-card border-ziba ziba-glow-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ziba-bg rounded-full flex items-center justify-center shrink-0 border border-ziba">
                  <User className="w-8 h-8 text-ziba-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-ziba-text-primary truncate">{ride.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-ziba-text-secondary mt-1">
                    <Star className="w-4 h-4 text-ziba-gold fill-current" />
                    <span className="font-medium">{ride.driver.averageRating.toFixed(1)}</span>
                    <span className="text-ziba-text-muted">|</span>
                    <span>{ride.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm font-semibold text-ziba-accent mt-1">{ride.driver.vehiclePlate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-ziba-card border-ziba">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-ziba-success mt-1.5 shrink-0 shadow-lg shadow-green-500/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Pickup</p>
                <p className="text-ziba-text-primary font-medium">{ride.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-ziba-accent mt-1.5 shrink-0 shadow-lg shadow-teal-500/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Drop-off</p>
                <p className="text-ziba-text-primary font-medium">{ride.dropoffLocation}</p>
              </div>
            </div>
            
            <div className="pt-5 border-t border-ziba space-y-4">
              {ride.fareEstimate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-ziba-text-secondary">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Total Fare</span>
                  </div>
                  <span className="text-2xl font-bold text-ziba-text-primary">
                    NGN {ride.fareEstimate.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-ziba-text-secondary">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment</span>
                </div>
                <span className="text-ziba-success font-semibold">
                  {ride.payment?.status === "PAID" ? "Paid" : "Wallet"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {!hasRated && (
          <Card className="bg-ziba-card border-ziba">
            <CardContent className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-ziba-text-primary font-semibold text-lg mb-1">Rate your driver</p>
                <p className="text-ziba-text-secondary">How was your trip with {ride.driver?.fullName}?</p>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="p-1 transition-all duration-200 hover:scale-125 active:scale-95"
                    data-testid={`button-rate-${star}`}
                  >
                    <Star
                      className={`w-11 h-11 transition-colors ${
                        star <= displayRating
                          ? "text-ziba-gold fill-current drop-shadow-lg"
                          : "text-ziba-surface hover:text-ziba-text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {selectedRating > 0 && !showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center justify-center gap-2 w-full text-sm text-ziba-accent hover:underline font-medium py-2"
                  data-testid="button-add-feedback"
                >
                  <MessageSquare className="w-4 h-4" />
                  Add feedback (optional)
                </button>
              )}

              {showFeedback && (
                <Textarea
                  placeholder="Share your experience (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-ziba-bg border-ziba text-ziba-text-primary placeholder:text-ziba-text-muted resize-none focus:border-ziba-accent"
                  rows={3}
                  data-testid="input-feedback"
                />
              )}

              {selectedRating > 0 && (
                <Button
                  className="w-full h-12 ziba-btn-primary text-base"
                  onClick={() => rateMutation.mutate({ rideId: ride.id, rating: selectedRating })}
                  disabled={rateMutation.isPending}
                  data-testid="button-submit-rating"
                >
                  {rateMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  Submit Rating
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {hasRated && (
          <Card className="bg-ziba-card border-ziba">
            <CardContent className="p-5 text-center">
              <p className="text-ziba-text-secondary mb-3">You rated this trip</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= displayRating
                        ? "text-ziba-gold fill-current"
                        : "text-ziba-surface"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 pt-6">
          <Link href="/rider/home">
            <Button className="w-full h-14 ziba-btn-primary text-base font-semibold" data-testid="button-book-another">
              <Car className="w-5 h-5 mr-2" />
              Book Another Ride
            </Button>
          </Link>
          <Link href="/rider/history">
            <Button variant="outline" className="w-full h-14 ziba-btn-secondary text-base" data-testid="button-view-history">
              <History className="w-5 h-5 mr-2" />
              View Ride History
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
