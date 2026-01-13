import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  MapPin,
  Car,
  User,
  Wallet,
  ChevronRight,
  Navigation,
  Clock,
  Star,
} from "lucide-react";

export default function RiderHome() {
  const { user } = useRiderAuth();
  const [, navigate] = useLocation();

  const { data: activeRide } = useQuery({
    queryKey: ["/api/rider/active-ride"],
    staleTime: 1000 * 60,
  });

  const { data: wallet } = useQuery({
    queryKey: ["/api/rider/wallet"],
    staleTime: 1000 * 60,
  });

  const { data: recentRides } = useQuery<any[]>({
    queryKey: ["/api/rider/rides"],
    staleTime: 1000 * 60,
  });

  if (activeRide) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Ziba Rider</h1>
              <p className="text-sm text-muted-foreground">Hello, {user?.fullName?.split(" ")[0]}</p>
            </div>
          </div>
          <Link href="/rider/profile">
            <Button size="icon" variant="ghost" data-testid="button-profile">
              <User className="w-5 h-5" />
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-4 flex flex-col items-center justify-center pb-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Ride in Progress</h2>
              <p className="text-muted-foreground">You have an active ride</p>
              <Link href="/rider/active-ride">
                <Button className="w-full" data-testid="button-view-ride">
                  View Ride Status
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        <RiderBottomNav activeTab="home" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Ziba Rider</h1>
            <p className="text-sm text-muted-foreground">Hello, {user?.fullName?.split(" ")[0]}</p>
          </div>
        </div>
        <Link href="/rider/profile">
          <Button size="icon" variant="ghost" data-testid="button-profile">
            <User className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-20">
        <Card
          className="hover-elevate cursor-pointer"
          onClick={() => navigate("/rider/request")}
          data-testid="card-request-ride"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-lg">Where to?</p>
              <p className="text-sm text-muted-foreground">Request a ride now</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {wallet && (
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/rider/wallet")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="font-semibold text-foreground" data-testid="text-wallet-balance">
                    NGN {(wallet.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {recentRides && recentRides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Recent Trips</h2>
              <Link href="/rider/trip-history">
                <Button variant="ghost" size="sm" data-testid="link-view-all-trips">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentRides.slice(0, 3).map((ride: any) => (
                <Card key={ride.id} className="hover-elevate cursor-pointer" onClick={() => navigate("/rider/trip-history")}>
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
                      <span className="text-sm font-medium text-foreground">
                        NGN {ride.fareEstimate.toLocaleString()}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/rider/support")}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Help</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/rider/wallet")}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Rewards</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <RiderBottomNav activeTab="home" />
    </div>
  );
}
