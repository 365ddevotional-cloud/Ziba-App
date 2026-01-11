import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Car, Phone, Calendar, CheckCircle, Clock, XCircle, ArrowLeft, Bike, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface Driver {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: "CAR" | "BIKE" | "VAN";
  vehiclePlate: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  createdAt: string;
  _count: {
    rides: number;
  };
}

const statusConfig = {
  PENDING: { color: "bg-yellow-600", icon: Clock, label: "Pending" },
  APPROVED: { color: "bg-green-600", icon: CheckCircle, label: "Approved" },
  SUSPENDED: { color: "bg-red-600", icon: XCircle, label: "Suspended" },
};

const vehicleIcons = {
  CAR: Car,
  BIKE: Bike,
  VAN: Truck,
};

export default function AdminDriversPage() {
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rides</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => {
                    const StatusIcon = statusConfig[driver.status].icon;
                    const VehicleIcon = vehicleIcons[driver.vehicleType];
                    return (
                      <TableRow key={driver.id} data-testid={`row-driver-${driver.id}`}>
                        <TableCell className="font-mono text-xs">{driver.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{driver.fullName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {driver.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                            {driver.vehicleType}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{driver.vehiclePlate}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[driver.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[driver.status].label}
                          </Badge>
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
  );
}
