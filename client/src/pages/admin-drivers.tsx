import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Car, Phone, Calendar, CheckCircle, Clock, XCircle, ArrowLeft, Bike, Truck, Mail, Wifi, WifiOff, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/star-rating";
import { AdminGuard } from "@/components/admin-guard";

type DriverStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "OFFLINE";

interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: "CAR" | "BIKE" | "VAN";
  vehiclePlate: string;
  status: DriverStatus;
  isOnline: boolean;
  currentRate: number;
  averageRating: number;
  totalRatings: number;
  avgStartTime: string | null;
  avgEndTime: string | null;
  createdAt: string;
  _count: {
    rides: number;
  };
}

const statusConfig: Record<DriverStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  PENDING: { color: "bg-yellow-600", icon: Clock, label: "Pending" },
  ACTIVE: { color: "bg-green-600", icon: CheckCircle, label: "Active" },
  SUSPENDED: { color: "bg-red-600", icon: XCircle, label: "Suspended" },
  OFFLINE: { color: "bg-gray-600", icon: WifiOff, label: "Offline" },
};

const vehicleIcons = {
  CAR: Car,
  BIKE: Bike,
  VAN: Truck,
};

export default function AdminDriversPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/drivers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({
        title: "Status updated",
        description: "Driver status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update driver status.",
        variant: "destructive",
      });
    },
  });

  const toggleOnlineMutation = useMutation({
    mutationFn: async ({ id, goOnline }: { id: string; goOnline: boolean }) => {
      const endpoint = goOnline ? `/api/drivers/${id}/online` : `/api/drivers/${id}/offline`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({
        title: "Online status updated",
        description: "Driver online status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update online status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (driverId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: driverId, status: newStatus });
  };

  const handleToggleOnline = (driverId: string, currentlyOnline: boolean) => {
    toggleOnlineMutation.mutate({ id: driverId, goOnline: !currentlyOnline });
  };

  return (
    <AdminGuard>
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
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Admin - Drivers</CardTitle>
                <CardDescription>Manage all registered drivers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : drivers && drivers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Online</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Rides</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => {
                      const VehicleIcon = vehicleIcons[driver.vehicleType];
                      return (
                        <TableRow key={driver.id} data-testid={`row-driver-${driver.id}`}>
                          <TableCell className="font-medium">{driver.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm max-w-32 truncate">{driver.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {driver.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-xs">{driver.vehiclePlate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={driver.status}
                              onValueChange={(value) => handleStatusChange(driver.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32" data-testid={`select-status-${driver.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                    Pending
                                  </div>
                                </SelectItem>
                                <SelectItem value="ACTIVE">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Active
                                  </div>
                                </SelectItem>
                                <SelectItem value="SUSPENDED">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-3 w-3 text-red-500" />
                                    Suspended
                                  </div>
                                </SelectItem>
                                <SelectItem value="OFFLINE">
                                  <div className="flex items-center gap-2">
                                    <WifiOff className="h-3 w-3 text-gray-500" />
                                    Offline
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {driver.status === "ACTIVE" ? (
                              <Button
                                size="icon"
                                variant={driver.isOnline ? "default" : "outline"}
                                onClick={() => handleToggleOnline(driver.id, driver.isOnline)}
                                disabled={toggleOnlineMutation.isPending}
                                title={driver.isOnline ? "Go Offline" : "Go Online"}
                                data-testid={`button-online-${driver.id}`}
                              >
                                {driver.isOnline ? (
                                  <Wifi className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {driver.totalRatings > 0 ? (
                              <StarRating rating={driver.averageRating} size="xs" />
                            ) : (
                              <span className="text-xs text-muted-foreground">No ratings</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{driver._count.rides}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(driver.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No drivers registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      </div>
    </AdminGuard>
  );
}
