import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, User, Car, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

type RideStatus = "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fareEstimate: number | null;
  status: RideStatus;
  userId: string;
  driverId: string | null;
  createdAt: string;
  user: {
    fullName: string;
  };
  driver: {
    fullName: string;
  } | null;
}

const statusColors: Record<RideStatus, string> = {
  REQUESTED: "bg-yellow-600",
  ACCEPTED: "bg-blue-600",
  IN_PROGRESS: "bg-purple-600",
  COMPLETED: "bg-green-600",
  CANCELLED: "bg-red-600",
};

const statusLabels: Record<RideStatus, string> = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function RidesPage() {
  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rides"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">All Rides</CardTitle>
                <CardDescription>View all rides on the platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rides && rides.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Dropoff</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rides.map((ride) => (
                    <TableRow key={ride.id} data-testid={`row-ride-${ride.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          {ride.pickupLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          {ride.dropoffLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ride.fareEstimate !== null ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {ride.fareEstimate.toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {ride.user.fullName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ride.driver ? (
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            {ride.driver.fullName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ride.status]}>
                          {statusLabels[ride.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rides recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
