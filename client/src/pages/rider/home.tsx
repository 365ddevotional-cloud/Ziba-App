import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  MapPin,
  Car,
  ChevronRight,
  Clock,
  Wallet,
} from "lucide-react";

interface WalletData {
  id: string;
  balance: number;
}

interface RideData {
  id: string;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  fareEstimate: number | null;
  createdAt: string;
}

export default function RiderHome() {
  const { user } = useRiderAuth();
  const [, navigate] = useLocation();

  const { data: activeRide } = useQuery<RideData | null>({
    queryKey: ["/api/rider/active-ride"],
    staleTime: 1000 * 60,
  });

  const { data: wallet } = useQuery<WalletData>({
    queryKey: ["/api/rider/wallet"],
    staleTime: 1000 * 60,
  });

  const { data: recentRides } = useQuery<RideData[]>({
    queryKey: ["/api/rider/rides"],
    staleTime: 1000 * 60,
  });

  // Active ride view - Clean redirect card
  if (activeRide) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-5 pb-3">
          <p className="ziba-body-muted">Hello, {user?.fullName?.split(" ")[0]}</p>
        </header>

        <main className="flex-1 px-5 flex flex-col items-center justify-center pb-24">
          <div className="w-full max-w-sm text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="ziba-headline">Ride in progress</h1>
              <p className="ziba-subheadline">You have an active trip</p>
            </div>
            <Link href="/rider/active-ride">
              <Button className="w-full h-12" data-testid="button-view-ride">
                View Ride Status
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </main>

        <RiderBottomNav activeTab="home" />
      </div>
    );
  }

  // Default home - Clean, minimal design
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Greeting Header */}
      <header className="p-5 pb-2">
        <p className="ziba-body-muted">Hello, {user?.fullName?.split(" ")[0]}</p>
      </header>

      <main className="flex-1 px-5 space-y-5 pb-24">
        {/* Primary CTA - Where are you going? */}
        <div className="pt-2">
          <h1 className="ziba-headline mb-4">Where are you going?</h1>
          <Card
            className="ziba-card-elevated hover-elevate cursor-pointer"
            onClick={() => navigate("/rider/request")}
            data-testid="card-request-ride"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Enter destination</p>
                <p className="text-sm text-muted-foreground">Request a ride</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Wallet Balance - Compact */}
        {wallet && (
          <Card 
            className="ziba-card hover-elevate cursor-pointer" 
            onClick={() => navigate("/rider/wallet")}
            data-testid="card-wallet"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                  <p className="font-semibold text-foreground" data-testid="text-wallet-balance">
                    NGN {(wallet.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Recent Trips - Clean List */}
        {recentRides && recentRides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Recent Trips</h2>
              <Link href="/rider/trip-history">
                <Button variant="ghost" size="sm" className="text-primary" data-testid="link-view-all-trips">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentRides.slice(0, 3).map((ride: any) => (
                <Card 
                  key={ride.id} 
                  className="ziba-card hover-elevate cursor-pointer"
                  onClick={() => {
                    if (ride.status === "COMPLETED") {
                      navigate(`/rider/trip-summary/${ride.id}`);
                    } else {
                      navigate("/rider/trip-history");
                    }
                  }}
                  data-testid={`card-trip-${ride.id}`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ride.dropoffLocation}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {ride.fareEstimate && (
                      <span className="text-sm font-medium text-foreground shrink-0">
                        NGN {ride.fareEstimate.toLocaleString()}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
