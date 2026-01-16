import { Link } from "wouter";
import { useDriverAuth } from "@/lib/driver-auth";
import { useTrip } from "@/lib/trip-context";
import { useDriverStore } from "@/lib/driver-store";
import { useWallet, PLATFORM_COMMISSION_RATE } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Clock, LogOut, CheckCircle, Navigation, Wallet } from "lucide-react";

export default function DriverHome() {
  const { user, logout } = useDriverAuth();
  const { currentTrip, completeTrip, setCurrentTrip } = useTrip();
  const { releaseDriver } = useDriverStore();
  const { getDriverWallet, updateDriverBalance, updatePlatformBalance } = useWallet();
  const { toast } = useToast();
  const firstName = user?.fullName?.trim().split(" ")[0] || "Driver";

  // Check if current driver has an assigned trip
  // For in-memory matching, check if trip exists and has a driver assigned
  // In production, this would match driver.id with trip.driver.id
  const assignedTrip = currentTrip?.driver && currentTrip.status !== "COMPLETED" && currentTrip.status !== "CANCELLED" 
    ? currentTrip 
    : null;
  
  // Get driver wallet balance
  const driverWallet = getDriverWallet(assignedTrip?.driver?.id || "driver_1");

  // Check if current driver has an assigned trip
  // For in-memory matching, check if trip exists and has a driver assigned
  // In production, this would match driver.id with trip.driver.id
  const assignedTrip = currentTrip?.driver && currentTrip.status !== "COMPLETED" && currentTrip.status !== "CANCELLED" 
    ? currentTrip 
    : null;

  const handleCompleteTrip = () => {
    if (assignedTrip && assignedTrip.driver && assignedTrip.payment?.escrowHeld) {
      // Calculate payment distribution
      const fare = assignedTrip.fare;
      const commission = Math.round(fare * PLATFORM_COMMISSION_RATE);
      const driverEarnings = fare - commission;

      // Release escrow and distribute payments
      updateDriverBalance(assignedTrip.driver.id, driverEarnings);
      updatePlatformBalance(commission);

      // Update trip payment status
      if (currentTrip) {
        setCurrentTrip({
          ...currentTrip,
          payment: {
            ...currentTrip.payment!,
            driverPaid: true,
            platformCommission: commission,
          },
        });
      }

      completeTrip();
      releaseDriver(assignedTrip.driver.id);
      
      toast({
        title: "Trip completed",
        description: `₦${driverEarnings.toLocaleString()} added to your wallet`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-5 pb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello, {firstName}</p>
            <h1 className="text-xl font-semibold text-foreground">Driver Dashboard</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-5">
        {assignedTrip ? (
          <>
            <Card className="ziba-card-elevated border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">Active Trip</h2>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {assignedTrip.status.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {assignedTrip.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {assignedTrip.dropoffLocation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium text-foreground">{assignedTrip.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Duration</span>
                    <span className="font-medium text-foreground">~{assignedTrip.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fare</span>
                    <span className="font-semibold text-foreground">
                      ₦ {assignedTrip.fare.toLocaleString()}
                    </span>
                  </div>
                </div>

                {assignedTrip.status === "IN_PROGRESS" && (
                  <Button
                    className="w-full mt-4"
                    onClick={handleCompleteTrip}
                    data-testid="button-complete-trip"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Trip
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="ziba-card">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">No Active Trip</h2>
                <p className="text-sm text-muted-foreground">
                  Waiting for ride requests...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Balance */}
        <Card className="ziba-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-semibold text-foreground">
                  ₦ {driverWallet.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user && (
          <Card className="ziba-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <span className="text-sm font-medium text-foreground">
                  {user.vehicleType} • {user.vehiclePlate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-foreground">{user.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="text-sm font-medium text-foreground">
                  {user.averageRating.toFixed(1)} ⭐
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
