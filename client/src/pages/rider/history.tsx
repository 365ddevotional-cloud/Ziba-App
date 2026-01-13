import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  Car,
  Calendar,
  Star,
  ChevronLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
    vehicleType: string;
    vehiclePlate: string;
    averageRating: number;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
  };
}

export default function RiderHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [ratingValue, setRatingValue] = useState(5);

  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rider/rides"],
    staleTime: 1000 * 60,
  });

  const rateMutation = useMutation({
    mutationFn: async ({ rideId, rating }: { rideId: string; rating: number }) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/rate`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/rides"] });
      toast({
        title: "Rating submitted",
        description: "Thanks for your feedback!",
      });
      setSelectedRide(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rating failed",
        description: error.message || "Could not submit rating",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="flex items-center gap-1 text-blue-500 text-xs font-medium">
            <Car className="w-3 h-3" />
            In Progress
          </span>
        );
      case "DRIVER_EN_ROUTE":
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1 text-blue-500 text-xs font-medium">
            <Navigation className="w-3 h-3" />
            Driver En Route
          </span>
        );
      case "ARRIVED":
        return (
          <span className="flex items-center gap-1 text-purple-500 text-xs font-medium">
            <Car className="w-3 h-3" />
            Driver Arrived
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Trip History</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !rides || rides.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No trips yet</p>
            <Link href="/rider/home">
              <Button data-testid="button-first-ride">Request Your First Ride</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Card
                key={ride.id}
                className="hover-elevate cursor-pointer"
                onClick={() => {
                  if (ride.status === "COMPLETED") {
                    navigate(`/rider/trip-summary/${ride.id}`);
                  } else {
                    setSelectedRide(ride);
                  }
                }}
                data-testid={`card-ride-${ride.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ride.createdAt)}
                    </div>
                    {getStatusBadge(ride.status)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <p className="text-sm text-foreground line-clamp-1">{ride.pickupLocation}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-sm text-foreground line-clamp-1">{ride.dropoffLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {ride.driver && (
                        <>
                          <span className="text-sm text-muted-foreground">{ride.driver.fullName}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {ride.driver.averageRating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    {ride.fareEstimate && (
                      <span className="font-semibold text-foreground">
                        NGN {ride.fareEstimate.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <RiderBottomNav activeTab="trips" />

      <Dialog open={!!selectedRide} onOpenChange={() => setSelectedRide(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trip Details</DialogTitle>
            <DialogDescription>
              {selectedRide && formatDate(selectedRide.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm text-foreground">{selectedRide.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm text-foreground">{selectedRide.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              {selectedRide.driver && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">{selectedRide.driver.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRide.driver.vehicleType} - {selectedRide.driver.vehiclePlate}
                  </p>
                </div>
              )}

              {selectedRide.fareEstimate && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Fare</span>
                  <span className="font-semibold text-foreground">
                    NGN {selectedRide.fareEstimate.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedRide.status === "COMPLETED" && selectedRide.driver && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Rate your driver</p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className="p-1"
                        data-testid={`button-star-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= ratingValue
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => rateMutation.mutate({ rideId: selectedRide.id, rating: ratingValue })}
                    disabled={rateMutation.isPending}
                    data-testid="button-submit-rating"
                  >
                    {rateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Rating"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
