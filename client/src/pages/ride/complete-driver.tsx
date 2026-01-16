import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  CheckCircle2,
  Loader2,
  User,
  DollarSign,
  Car,
  BarChart3,
  AlertTriangle,
  Power,
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
  user?: {
    id: string;
    fullName: string;
    averageRating: number;
  };
  userRating?: {
    rating: number;
  };
  driverEarnings?: number;
  commission?: number;
}

export default function DriverRideComplete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedRating, setSelectedRating] = useState(0);
  const [showReportIssue, setShowReportIssue] = useState(false);

  const { data: ride, isLoading, isError, error } = useQuery<CompletedRide>({
    queryKey: ["/api/driver/last-completed-ride"],
    staleTime: 1000 * 60,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      const errorMessage = (error as any)?.message || "";
      if (errorMessage.includes("401") || errorMessage.includes("Not authenticated")) {
        navigate("/signup");
      }
    }
  }, [error, navigate]);

  const rateMutation = useMutation({
    mutationFn: async ({ rideId, rating }: { rideId: string; rating: number }) => {
      const res = await apiRequest("POST", `/api/driver/rides/${rideId}/rate-rider`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/last-completed-ride"] });
      toast({ title: "Rating submitted", description: "Thanks for your feedback" });
    },
    onError: (error: any) => {
      console.error("Rating error:", error);
      toast({ title: "Unable to submit rating", description: "Please try again", variant: "destructive" });
    },
  });

  const goOnlineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/driver/go-online");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "You're online!", description: "Ready to accept new rides" });
      navigate("/driver/home");
    },
    onError: (error: any) => {
      console.error("Go online error:", error);
      toast({ title: "Unable to go online", description: "Please try again", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ziba-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-ziba-accent mx-auto" />
          <p className="text-ziba-text-secondary text-lg">Loading trip details...</p>
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
          <h2 className="text-2xl font-bold text-ziba-text-primary">No Completed Trip</h2>
          <p className="text-ziba-text-secondary">You don't have a recently completed trip to view.</p>
          <Link href="/driver/home">
            <Button className="mt-6 ziba-btn-primary px-8" data-testid="button-go-home">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasRated = !!ride.userRating;
  const displayRating = hasRated ? ride.userRating!.rating : selectedRating;
  const earnings = ride.driverEarnings ?? (ride.fareEstimate ? ride.fareEstimate * 0.85 : 0);

  return (
    <div className="min-h-screen bg-ziba-bg flex flex-col animate-in fade-in duration-500">
      <main className="flex-1 p-5 space-y-6 pb-10 max-w-lg mx-auto w-full">
        <div className="text-center py-8 space-y-5">
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center bg-ziba-success-subtle ziba-success-glow">
            <CheckCircle2 className="w-14 h-14 text-ziba-success" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-ziba-text-primary">Trip Completed</h1>
            <p className="text-ziba-text-secondary text-lg">
              {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        <Card className="bg-ziba-card border-ziba-accent ziba-success-glow" style={{ background: 'linear-gradient(to bottom right, rgba(22, 163, 74, 0.15), #111827, #111827)', borderColor: 'rgba(22, 163, 74, 0.4)' }}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-ziba-text-secondary mb-3">
              <DollarSign className="w-5 h-5 text-ziba-success" />
              <span className="text-sm font-semibold uppercase tracking-wider">Your Earnings</span>
            </div>
            <p className="text-5xl font-bold text-ziba-text-primary mb-2">
              NGN {earnings.toLocaleString()}
            </p>
            {ride.fareEstimate && ride.commission && (
              <p className="text-sm text-ziba-text-muted">
                Commission: NGN {ride.commission.toLocaleString()} (15%)
              </p>
            )}
          </CardContent>
        </Card>

        {ride.user && (
          <Card className="bg-ziba-card border-ziba">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ziba-bg rounded-full flex items-center justify-center shrink-0 border border-ziba">
                  <User className="w-8 h-8 text-ziba-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-ziba-text-primary truncate">{ride.user.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-ziba-text-secondary mt-1">
                    <Star className="w-4 h-4 text-ziba-gold fill-current" />
                    <span className="font-medium">{ride.user.averageRating.toFixed(1)} rating</span>
                  </div>
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
          </CardContent>
        </Card>

        {!hasRated && ride.user && (
          <Card className="bg-ziba-card border-ziba">
            <CardContent className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-ziba-text-primary font-semibold text-lg mb-1">Rate your rider</p>
                <p className="text-ziba-text-secondary">How was your trip with {ride.user.fullName}?</p>
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
              <p className="text-ziba-text-secondary mb-3">You rated this rider</p>
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
          <Button 
            className="w-full h-14 ziba-btn-success text-base font-semibold" 
            onClick={() => goOnlineMutation.mutate()}
            disabled={goOnlineMutation.isPending}
            data-testid="button-go-online"
          >
            {goOnlineMutation.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Power className="w-5 h-5 mr-2" />
            )}
            Go Online / Accept Next Ride
          </Button>
          <Link href="/driver/earnings">
            <Button variant="outline" className="w-full h-14 ziba-btn-secondary text-base" data-testid="button-view-earnings">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Earnings Summary
            </Button>
          </Link>
          <button
            onClick={() => setShowReportIssue(!showReportIssue)}
            className="flex items-center justify-center gap-2 w-full text-sm text-ziba-text-muted hover:text-ziba-warning py-3 transition-colors"
            data-testid="button-report-issue"
          >
            <AlertTriangle className="w-4 h-4" />
            Report an issue
          </button>
        </div>

        {showReportIssue && (
          <Card className="bg-ziba-card border-ziba animate-in fade-in slide-in-from-top-2">
            <CardContent className="p-5 text-center space-y-4">
              <p className="text-ziba-text-secondary">
                If you experienced any issues during this trip, please contact support.
              </p>
              <Link href="/support/contact">
                <Button variant="outline" className="ziba-btn-secondary">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
