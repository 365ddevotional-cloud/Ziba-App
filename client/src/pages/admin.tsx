import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Users, Car, MapPin, Shield, ArrowRight, CheckCircle, Clock, Activity, XCircle, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface Stats {
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  drivers: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    offline: number;
  };
  rides: {
    total: number;
    requested: number;
    accepted: number;
    completed: number;
    cancelled: number;
    active: number;
  };
  directors: {
    total: number;
  };
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
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Real-time platform statistics and management</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-users">
                    {stats?.users.total ?? 0}
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {stats?.users.active ?? 0} active
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {stats?.users.suspended ?? 0} suspended
                    </span>
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
                    {stats?.drivers.total ?? 0}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {stats?.drivers.active ?? 0} active
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {stats?.drivers.pending ?? 0} pending
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500" data-testid="text-active-rides">
                    {stats?.rides.active ?? 0}
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {stats?.rides.requested ?? 0} requested
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      {stats?.rides.accepted ?? 0} accepted
                    </span>
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
                    {stats?.rides.total ?? 0}
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {stats?.rides.completed ?? 0} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {stats?.rides.cancelled ?? 0} cancelled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Link href="/directors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCog className="h-5 w-5 text-primary" />
                        <CardTitle>Directors</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>{stats?.directors?.total ?? 0} directors overseeing operations</CardDescription>
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
