import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, MapPin, Calendar, User, Car, ArrowLeft, DollarSign, Play, CheckCircle, XCircle, Wifi, Search, Filter, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/star-rating";

type RideStatus = "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface Driver {
  id: string;
  fullName: string;
  isOnline: boolean;
  averageRating: number;
  totalRatings: number;
  status: string;
}

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
    averageRating?: number;
  };
  driver: {
    fullName: string;
    averageRating?: number;
    isOnline?: boolean;
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

async function adminApiRequest(method: string, url: string, data?: unknown) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Preview-Admin": "true",
    },
    credentials: "include",
  };
  
  // Only include body if we have data to send
  if (data !== undefined) {
    options.body = JSON.stringify({ ...data as object, previewAdmin: true });
  } else {
    options.body = JSON.stringify({ previewAdmin: true });
  }
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res;
}

function calculateFare(pickup: string, dropoff: string): number {
  const baseFare = 500;
  const perKmRate = 100;
  const estimatedKm = Math.floor(Math.random() * 15) + 3;
  return baseFare + (perKmRate * estimatedKm);
}

export default function AdminRidesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rides", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/rides?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rides");
      return res.json();
    },
  });

  const { data: availableDrivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers/available"],
  });

  const assignMutation = useMutation({
    mutationFn: async ({ rideId, driverId }: { rideId: string; driverId: string }) => {
      return adminApiRequest("POST", `/api/rides/${rideId}/assign`, { driverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({ title: "Driver assigned", description: "Ride status updated to ACCEPTED" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: async (rideId: string) => {
      return adminApiRequest("POST", `/api/rides/${rideId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      toast({ title: "Ride started", description: "Ride is now IN_PROGRESS" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (rideId: string) => {
      return adminApiRequest("POST", `/api/rides/${rideId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({ title: "Ride completed", description: "Ride has been completed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (rideId: string) => {
      return adminApiRequest("POST", `/api/rides/${rideId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({ title: "Ride cancelled", description: "Ride has been cancelled" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const isPending = assignMutation.isPending || startMutation.isPending || completeMutation.isPending || cancelMutation.isPending;

  const getActionButtons = (ride: Ride) => {
    switch (ride.status) {
      case "REQUESTED":
        return (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => cancelMutation.mutate(ride.id)}
            disabled={isPending}
            title="Cancel Ride"
            data-testid={`button-cancel-${ride.id}`}
          >
            <XCircle className="h-4 w-4 text-red-500" />
          </Button>
        );
      case "ACCEPTED":
        return (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => startMutation.mutate(ride.id)}
              disabled={isPending}
              title="Start Ride"
              data-testid={`button-start-${ride.id}`}
            >
              <Play className="h-4 w-4 text-purple-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => cancelMutation.mutate(ride.id)}
              disabled={isPending}
              title="Cancel Ride"
              data-testid={`button-cancel-${ride.id}`}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          </>
        );
      case "IN_PROGRESS":
        return (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => completeMutation.mutate(ride.id)}
            disabled={isPending}
            title="Complete Ride"
            data-testid={`button-complete-${ride.id}`}
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
          </Button>
        );
      case "COMPLETED":
      case "CANCELLED":
      default:
        return <span className="text-xs text-muted-foreground">-</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle data-testid="text-page-title">Admin - Rides</CardTitle>
                  <CardDescription>Manage all rides on the platform</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-48"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36" data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="REQUESTED">Requested</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rides && rides.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Dropoff</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rides.map((ride) => (
                      <TableRow key={ride.id} data-testid={`row-ride-${ride.id}`}>
                        <TableCell className="font-mono text-xs">{ride.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="max-w-24 truncate">{ride.pickupLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="max-w-24 truncate">{ride.dropoffLocation}</span>
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
                            <span className="max-w-20 truncate">{ride.user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ride.status === "REQUESTED" ? (
                            <Select
                              onValueChange={(driverId) => assignMutation.mutate({ rideId: ride.id, driverId })}
                              disabled={isPending || !availableDrivers?.length}
                            >
                              <SelectTrigger className="w-40" data-testid={`select-driver-${ride.id}`}>
                                <SelectValue placeholder="Assign driver..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDrivers?.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    <div className="flex items-center gap-2">
                                      <Wifi className="h-3 w-3 text-green-500" />
                                      <span>{driver.fullName}</span>
                                      {driver.totalRatings > 0 && (
                                        <StarRating rating={driver.averageRating} size="xs" showNumeric={false} />
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                                {(!availableDrivers || availableDrivers.length === 0) && (
                                  <SelectItem value="none" disabled>
                                    No drivers available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          ) : ride.driver ? (
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="max-w-20 truncate">{ride.driver.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[ride.status]}>
                            {statusLabels[ride.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getActionButtons(ride)}
                          </div>
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
              </div>
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
