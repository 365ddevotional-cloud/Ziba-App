import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Users, Car, MapPin, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface Stats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  platformStatus: string;
}

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Overview</h1>
          </div>
          <p className="text-muted-foreground">Platform statistics and management</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-users">
                    {stats?.totalUsers ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-drivers">
                    {stats?.totalDrivers ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-rides">
                    {stats?.totalRides ?? 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/users">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Users</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/drivers">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Drivers</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>View and manage all registered drivers</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/rides">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Rides</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>View all rides on the platform</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
