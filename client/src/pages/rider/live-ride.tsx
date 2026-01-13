import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRiderAuth } from "@/lib/rider-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  MapPin,
  Phone,
  Star,
  Clock,
  Navigation,
  X,
  ChevronLeft,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";

interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fareEstimate: number | null;
  status: string;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    averageRating: number;
  };
}

export default function RiderLiveRide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: activeRide, isLoading } = useQuery<Ride | null>({
    queryKey: ["/api/rider/active-ride"],
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const res = await apiRequest("POST", `/api/rider/rides/${rideId}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/active-ride"] });
      toast({
        title: "Ride cancelled",
        description: "Your ride has been cancelled",
      });
      navigate("/rider");
    },
    onError: (error: any) => {
      toast({
        title: "Cancel failed",
        description: error.message || "Could not cancel ride",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeRide) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No Active Ride</h2>
            <p className="text-muted-foreground">You don't have any rides in progress</p>
            <Link href="/rider">
              <Button className="w-full" data-testid="button-request-new">
                Request a Ride
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          title: "Looking for driver...",
          description: "We're finding you a driver nearby",
          color: "text-yellow-500",
          icon: Loader2,
          animate: true,
        };
      case "ACCEPTED":
        return {
          title: "Driver on the way",
          description: "Your driver is heading to pick you up",
          color: "text-blue-500",
          icon: Navigation,
          animate: false,
        };
      case "IN_PROGRESS":
        return {
          title: "Trip in progress",
          description: "Enjoy your ride!",
          color: "text-green-500",
          icon: Car,
          animate: false,
        };
      default:
        return {
          title: "Status unknown",
          description: "Please wait...",
          color: "text-muted-foreground",
          icon: Clock,
          animate: false,
        };
    }
  };

  const statusInfo = getStatusInfo(activeRide.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Your Ride</h1>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              activeRide.status === "REQUESTED" ? "bg-yellow-500/10" :
              activeRide.status === "ACCEPTED" ? "bg-blue-500/10" :
              "bg-green-500/10"
            }`}>
              <StatusIcon className={`w-10 h-10 ${statusInfo.color} ${statusInfo.animate ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{statusInfo.title}</h2>
              <p className="text-muted-foreground">{statusInfo.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium text-foreground">{activeRide.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{activeRide.dropoffLocation}</p>
              </div>
            </div>
            {activeRide.fareEstimate && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Fare</span>
                <span className="font-semibold text-foreground">
                  NGN {activeRide.fareEstimate.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {activeRide.driver && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{activeRide.driver.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{activeRide.driver.averageRating.toFixed(1)}</span>
                    <span className="mx-1">-</span>
                    <span>{activeRide.driver.vehicleType}</span>
                  </div>
                  <p className="text-sm text-primary font-medium mt-1">{activeRide.driver.vehiclePlate}</p>
                </div>
                <a href={`tel:${activeRide.driver.phone}`}>
                  <Button size="icon" variant="outline" data-testid="button-call-driver">
                    <Phone className="w-5 h-5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {activeRide.status === "REQUESTED" && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => cancelMutation.mutate(activeRide.id)}
            disabled={cancelMutation.isPending}
            data-testid="button-cancel-ride"
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Ride
              </>
            )}
          </Button>
        )}
      </main>
    </div>
  );
}
