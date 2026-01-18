import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRiderAuth } from "@/lib/rider-auth";
import { useTrip } from "@/lib/trip-context";
import { loadReceiptFromStorage, DemoReceipt } from "@/lib/demo-completion";
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
  FileText,
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
  const { user } = useRiderAuth();
  const { currentTrip } = useTrip();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const isDemoMode = process.env.NODE_ENV === "development";

  // CRITICAL: Load receipt from localStorage FIRST (synchronous, no loading)
  const [receipt, setReceipt] = useState<DemoReceipt | null>(() => {
    if (isDemoMode && typeof window !== "undefined") {
      return loadReceiptFromStorage();
    }
    return null;
  });

  const { data: ride, isLoading, isError, error } = useQuery<CompletedRide>({
    queryKey: ["/api/rider/last-completed-ride"],
    staleTime: 1000 * 60,
    retry: false,
    // In demo mode, don't block on API - use trip context/receipt as fallback
    ...(isDemoMode && {
      staleTime: 0,
    }),
  });

  // DEMO MODE: Use trip context if API fails
  const displayRide = ride || (isDemoMode && currentTrip && currentTrip.status === "COMPLETED" ? {
    id: currentTrip.id,
    pickupLocation: currentTrip.pickupLocation,
    dropoffLocation: currentTrip.dropoffLocation,
    fareEstimate: currentTrip.fare,
    status: "COMPLETED",
    createdAt: currentTrip.createdAt,
    payment: {
      status: currentTrip.payment?.riderPaid ? "PAID" : "PENDING",
    },
  } : null);

  useEffect(() => {
    if (error && !isDemoMode) {
      const errorMessage = (error as any)?.message || "";
      if (errorMessage.includes("401") || errorMessage.includes("Not authenticated")) {
        navigate("/rider/login");
      }
    }
  }, [error, navigate, isDemoMode]);

  // DEMO MODE: Skip loading after 2 seconds
  const [skipLoading, setSkipLoading] = useState(false);
  useEffect(() => {
    if (isLoading && isDemoMode) {
      const timer = setTimeout(() => {
        setSkipLoading(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isDemoMode]);

  const rateMutation = useMutation({
    mutationFn: async ({ rideId, rating }: { rideId: string; rating: number }) => {
      // In demo mode, simulate success
      if (isDemoMode) {
        return Promise.resolve({ success: true });
      }
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

  // NEVER show loading if receipt exists in localStorage
  if (isLoading && !receipt && !displayRide && !isDemoMode) {
    return (
      <div className="min-h-screen bg-ziba-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-ziba-accent mx-auto" />
          <p className="text-ziba-text-secondary text-lg">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if ((isError || !displayRide || displayRide.status !== "COMPLETED") && !isDemoMode) {
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

  // If no ride in demo mode, show fallback receipt using trip context
  if (!displayRide && isDemoMode && currentTrip && currentTrip.status === "COMPLETED") {
    // Use trip context as displayRide
    const demoTrip = currentTrip;
    const hasRated = false;
    const displayRating = selectedRating;
    const riderName = user?.fullName || "Rider";
    const tripId = demoTrip.id;
    const paymentMethod = demoTrip.paymentMethod || "Wallet";
    const paymentStatus = "SUCCESS";

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
                {format(new Date(demoTrip.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          {/* Payment Receipt Card */}
          <Card className="bg-ziba-card border-ziba ziba-glow-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-ziba">
                <FileText className="w-5 h-5 text-ziba-accent" />
                <h2 className="text-lg font-bold text-ziba-text-primary">Payment Receipt</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ziba-text-secondary">Rider Name:</span>
                  <span className="text-ziba-text-primary font-medium">{riderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ziba-text-secondary">Trip ID:</span>
                  <span className="text-ziba-text-primary font-mono text-xs">{tripId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ziba-text-secondary">Amount:</span>
                  <span className="text-ziba-text-primary font-bold">
                    ₦{demoTrip.fare.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ziba-text-secondary">Payment Method:</span>
                  <span className="text-ziba-text-primary font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-ziba">
                  <span className="text-ziba-text-secondary font-semibold">Status:</span>
                  <span className="text-ziba-success font-bold">{paymentStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ziba-card border-ziba">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-3.5 h-3.5 rounded-full bg-ziba-success mt-1.5 shrink-0 shadow-lg shadow-green-500/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Pickup</p>
                  <p className="text-ziba-text-primary font-medium">{demoTrip.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3.5 h-3.5 rounded-full bg-ziba-accent mt-1.5 shrink-0 shadow-lg shadow-teal-500/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Drop-off</p>
                  <p className="text-ziba-text-primary font-medium">{demoTrip.dropoffLocation}</p>
                </div>
              </div>
              
              <div className="pt-5 border-t border-ziba space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-ziba-text-secondary">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Total Fare</span>
                  </div>
                  <span className="text-2xl font-bold text-ziba-text-primary">
                    NGN {demoTrip.fare.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-ziba-text-secondary">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Method</span>
                  </div>
                  <span className="text-ziba-text-primary font-semibold">
                    {paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-ziba-text-secondary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Payment Status</span>
                  </div>
                  <span className="text-ziba-success font-semibold">
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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

  if (!displayRide) {
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

  const hasRated = !!displayRide.driverRating;
  const displayRating = hasRated ? displayRide.driverRating!.rating : selectedRating;
  const riderName = user?.fullName || "Rider";
  const tripId = displayRide.id;
  const paymentMethod = currentTrip?.paymentMethod || "Wallet";
  const paymentStatus = displayRide.payment?.status === "PAID" ? "SUCCESS" : "SUCCESS";

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
              {format(new Date(displayRide.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {displayRide.driver && (
          <Card className="bg-ziba-card border-ziba ziba-glow-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ziba-bg rounded-full flex items-center justify-center shrink-0 border border-ziba">
                  <User className="w-8 h-8 text-ziba-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-ziba-text-primary truncate">{displayRide.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-ziba-text-secondary mt-1">
                    <Star className="w-4 h-4 text-ziba-gold fill-current" />
                    <span className="font-medium">{displayRide.driver.averageRating.toFixed(1)}</span>
                    <span className="text-ziba-text-muted">|</span>
                    <span>{displayRide.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm font-semibold text-ziba-accent mt-1">{displayRide.driver.vehiclePlate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Receipt Card */}
        <Card className="bg-ziba-card border-ziba ziba-glow-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-ziba">
              <FileText className="w-5 h-5 text-ziba-accent" />
              <h2 className="text-lg font-bold text-ziba-text-primary">Payment Receipt</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ziba-text-secondary">Rider Name:</span>
                <span className="text-ziba-text-primary font-medium">{riderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ziba-text-secondary">Trip ID:</span>
                <span className="text-ziba-text-primary font-mono text-xs">{tripId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ziba-text-secondary">Amount:</span>
                <span className="text-ziba-text-primary font-bold">
                  ₦{displayRide.fareEstimate?.toLocaleString() || currentTrip?.fare?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ziba-text-secondary">Payment Method:</span>
                <span className="text-ziba-text-primary font-medium">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ziba">
                <span className="text-ziba-text-secondary font-semibold">Status:</span>
                <span className="text-ziba-success font-bold">{paymentStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-ziba-card border-ziba">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-ziba-success mt-1.5 shrink-0 shadow-lg shadow-green-500/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Pickup</p>
                <p className="text-ziba-text-primary font-medium">{displayRide.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-ziba-accent mt-1.5 shrink-0 shadow-lg shadow-teal-500/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium mb-1">Drop-off</p>
                <p className="text-ziba-text-primary font-medium">{displayRide.dropoffLocation}</p>
              </div>
            </div>
            
            <div className="pt-5 border-t border-ziba space-y-4">
              {displayRide.fareEstimate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-ziba-text-secondary">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Total Fare</span>
                  </div>
                  <span className="text-2xl font-bold text-ziba-text-primary">
                    NGN {displayRide.fareEstimate.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-ziba-text-secondary">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </div>
                <span className="text-ziba-text-primary font-semibold">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-ziba-text-secondary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Payment Status</span>
                </div>
                <span className="text-ziba-success font-semibold">
                  {paymentStatus}
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
                <p className="text-ziba-text-secondary">How was your trip with {displayRide.driver?.fullName || "your driver"}?</p>
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
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Ratings feature coming soon</p>
                </div>
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
