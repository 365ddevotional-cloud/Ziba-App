import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  CheckCircle,
  Loader2,
  User,
  MapPin,
  DollarSign,
  Car,
  Calendar,
  BarChart3,
  AlertTriangle,
  Power,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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

  const { data: ride, isLoading, isError } = useQuery<CompletedRide>({
    queryKey: ["/api/driver/last-completed-ride"],
    staleTime: 1000 * 60,
  });

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
      <div className="min-h-screen bg-ziba-dark flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-ziba-accent mx-auto" />
          <p className="text-ziba-text-secondary">Loading trip details...</p>
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
          <h2 className="text-xl font-semibold text-ziba-text-primary">No completed trip</h2>
          <p className="text-ziba-text-secondary">You don't have a recently completed trip to view.</p>
          <Link href="/driver/home">
            <Button className="mt-4 ziba-btn-primary" data-testid="button-go-home">
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
    <div className="min-h-screen bg-ziba-dark flex flex-col animate-in fade-in duration-500">
      <main className="flex-1 p-5 space-y-5 pb-8">
        <div className="text-center py-6 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-ziba-accent/20">
            <CheckCircle className="w-12 h-12 text-ziba-accent" />
          </div>
          <h1 className="text-2xl font-bold text-ziba-text-primary">Trip Finished</h1>
          <p className="text-ziba-text-secondary">
            {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <Card className="bg-gradient-to-br from-ziba-accent/20 to-ziba-card border-ziba-accent/30">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-ziba-text-secondary mb-2">
              <DollarSign className="w-5 h-5 text-ziba-accent" />
              <span className="text-sm font-medium uppercase tracking-wide">Your Earnings</span>
            </div>
            <p className="text-4xl font-bold text-ziba-text-primary">
              NGN {earnings.toLocaleString()}
            </p>
            {ride.fareEstimate && ride.commission && (
              <p className="text-sm text-ziba-text-secondary mt-2">
                Commission: NGN {ride.commission.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {ride.user && (
          <Card className="bg-ziba-card border-ziba-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-ziba-dark rounded-full flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-ziba-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ziba-text-primary truncate">{ride.user.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-ziba-text-secondary mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{ride.user.averageRating.toFixed(1)} rating</span>
                  </div>
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
          </CardContent>
        </Card>

        {!hasRated && ride.user && (
          <Card className="bg-ziba-card border-ziba-border">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-ziba-text-primary font-medium mb-1">Rate your rider</p>
                <p className="text-sm text-ziba-text-secondary">How was your trip with {ride.user.fullName}?</p>
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
              <p className="text-sm text-ziba-text-secondary mb-2">You rated this rider</p>
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
          <Button 
            className="w-full h-12 ziba-btn-primary" 
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
            <Button variant="outline" className="w-full h-12 border-ziba-border text-ziba-text-primary hover:bg-ziba-card" data-testid="button-view-earnings">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Earnings Summary
            </Button>
          </Link>
          <button
            onClick={() => setShowReportIssue(!showReportIssue)}
            className="flex items-center justify-center gap-2 w-full text-sm text-ziba-text-secondary hover:text-ziba-accent py-2"
            data-testid="button-report-issue"
          >
            <AlertTriangle className="w-4 h-4" />
            Report an issue
          </button>
        </div>

        {showReportIssue && (
          <Card className="bg-ziba-card border-ziba-border animate-in fade-in slide-in-from-top-2">
            <CardContent className="p-4 text-center space-y-3">
              <p className="text-sm text-ziba-text-secondary">
                If you experienced any issues during this trip, please contact support.
              </p>
              <Link href="/support/contact">
                <Button variant="outline" size="sm" className="border-ziba-border text-ziba-text-primary">
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
