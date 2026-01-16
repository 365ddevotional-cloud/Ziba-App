import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  CheckCircle,
  Loader2,
  User,
  MapPin,
  Clock,
  CreditCard,
  Car,
  Calendar,
  Navigation,
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
      <div className="min-h-screen bg-ziba-dark flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-ziba-accent mx-auto" />
          <p className="text-ziba-text-secondary">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (isError || !ride || ride.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-ziba-dark flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 mx-auto bg-ziba-card rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-ziba-text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-ziba-text-primary">No completed ride</h2>
          <p className="text-ziba-text-secondary">You don't have a recently completed ride to view.</p>
          <Link href="/rider/home">
            <Button className="mt-4 ziba-btn-primary" data-testid="button-go-home">
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
    <div className="min-h-screen bg-ziba-dark flex flex-col animate-in fade-in duration-500">
      <main className="flex-1 p-5 space-y-5 pb-8">
        <div className="text-center py-6 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-ziba-accent/20">
            <CheckCircle className="w-12 h-12 text-ziba-accent" />
          </div>
          <h1 className="text-2xl font-bold text-ziba-text-primary">Ride Completed</h1>
          <p className="text-ziba-text-secondary">
            {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {ride.driver && (
          <Card className="bg-ziba-card border-ziba-border ziba-glow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-ziba-dark rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-ziba-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ziba-text-primary truncate">{ride.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-ziba-text-secondary mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{ride.driver.averageRating.toFixed(1)}</span>
                    <span className="text-ziba-border">|</span>
                    <span>{ride.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm font-medium text-ziba-accent mt-1">{ride.driver.vehiclePlate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-ziba-card border-ziba-border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-secondary uppercase tracking-wide">Pickup</p>
                <p className="text-ziba-text-primary truncate">{ride.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-ziba-accent mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-secondary uppercase tracking-wide">Drop-off</p>
                <p className="text-ziba-text-primary truncate">{ride.dropoffLocation}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-ziba-border space-y-3">
              {ride.fareEstimate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-ziba-text-secondary">
                    <CreditCard className="w-4 h-4" />
                    <span>Total Fare</span>
                  </div>
                  <span className="text-xl font-bold text-ziba-text-primary">
                    NGN {ride.fareEstimate.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-ziba-text-secondary">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment</span>
                </div>
                <span className="text-green-500 font-medium">
                  {ride.payment?.status === "PAID" ? "Paid" : "Wallet"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {!hasRated && (
          <Card className="bg-ziba-card border-ziba-border">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-ziba-text-primary font-medium mb-1">Rate your driver</p>
                <p className="text-sm text-ziba-text-secondary">How was your trip with {ride.driver?.fullName}?</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="p-2 transition-transform hover:scale-110 active:scale-95"
                    data-testid={`button-rate-${star}`}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= displayRating
                          ? "text-amber-500 fill-amber-500"
                          : "text-ziba-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {selectedRating > 0 && !showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center justify-center gap-2 w-full text-sm text-ziba-accent hover:underline"
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
                  className="bg-ziba-dark border-ziba-border text-ziba-text-primary placeholder:text-ziba-text-secondary resize-none"
                  rows={3}
                  data-testid="input-feedback"
                />
              )}

              {selectedRating > 0 && (
                <Button
                  className="w-full ziba-btn-primary"
                  onClick={() => rateMutation.mutate({ rideId: ride.id, rating: selectedRating })}
                  disabled={rateMutation.isPending}
                  data-testid="button-submit-rating"
                >
                  {rateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Rating
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {hasRated && (
          <Card className="bg-ziba-card border-ziba-border">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-ziba-text-secondary mb-2">You rated this trip</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= displayRating
                        ? "text-amber-500 fill-amber-500"
                        : "text-ziba-border"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 pt-4">
          <Link href="/rider/home">
            <Button className="w-full h-12 ziba-btn-primary" data-testid="button-book-another">
              <Car className="w-5 h-5 mr-2" />
              Book Another Ride
            </Button>
          </Link>
          <Link href="/rider/history">
            <Button variant="outline" className="w-full h-12 border-ziba-border text-ziba-text-primary hover:bg-ziba-card" data-testid="button-view-history">
              <History className="w-5 h-5 mr-2" />
              View Ride History
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
