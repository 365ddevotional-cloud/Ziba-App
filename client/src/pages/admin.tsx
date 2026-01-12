import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Users, Car, MapPin, Shield, ArrowRight, CheckCircle, Clock, Activity, XCircle, UserCog, Wifi, DollarSign, Gift, Wallet, BarChart3, Calculator, KeyRound, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { StarRating } from "@/components/star-rating";
import { CountrySelector } from "@/components/country-selector";
import { useCountry } from "@/lib/country";

interface Stats {
  users: {
    total: number;
    active: number;
    suspended: number;
    avgRating: number;
  };
  drivers: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    offline: number;
    online: number;
    avgRating: number;
  };
  rides: {
    total: number;
    requested: number;
    accepted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    active: number;
  };
  directors: {
    total: number;
  };
  revenue: {
    totalPaid: number;
    pending: number;
    pendingCount: number;
    paidCount: number;
    failedCount: number;
  };
  incentives: {
    total: number;
    count: number;
  };
  platformStatus: string;
}

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });
  const { formatCurrency } = useCountry();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
            </div>
            <CountrySelector />
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
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {stats?.users.active ?? 0} active
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {stats?.users.suspended ?? 0} suspended
                      </span>
                    </div>
                    {(stats?.users.avgRating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Avg:</span>
                        <StarRating rating={stats?.users.avgRating ?? 0} size="xs" />
                      </div>
                    )}
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
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-green-500" />
                        {stats?.drivers.online ?? 0} online
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {stats?.drivers.active ?? 0} active
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-yellow-500" />
                        {stats?.drivers.pending ?? 0} pending
                      </span>
                    </div>
                    {(stats?.drivers.avgRating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Avg:</span>
                        <StarRating rating={stats?.drivers.avgRating ?? 0} size="xs" />
                      </div>
                    )}
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
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {stats?.rides.requested ?? 0} requested
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      {stats?.rides.accepted ?? 0} accepted
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-purple-500" />
                      {stats?.rides.inProgress ?? 0} in progress
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500" data-testid="text-total-revenue">
                    {formatCurrency(stats?.revenue?.totalPaid ?? 0)}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      {formatCurrency(stats?.revenue?.pending ?? 0)} pending ({stats?.revenue?.pendingCount ?? 0})
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {stats?.revenue?.paidCount ?? 0} paid
                    </span>
                    {(stats?.revenue?.failedCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {stats?.revenue?.failedCount ?? 0} failed
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Driver Incentives</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500" data-testid="text-total-incentives">
                    {formatCurrency(stats?.incentives?.total ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats?.incentives?.count ?? 0} incentives awarded to drivers
                  </p>
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
                <Link href="/admin/directors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCog className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Directors</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Manage {stats?.directors?.total ?? 0} directors overseeing operations</CardDescription>
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

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/payments">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Payments</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Track and manage ride payments</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/incentives">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Incentives</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Award bonuses to drivers</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/wallets">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Wallets</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>View and process driver payouts</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/analytics">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <CardTitle>Analytics</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Platform metrics and director performance</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer">
                <Link href="/admin/fares">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-primary" />
                        <CardTitle>Manage Ride Fares</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Configure pricing for each country</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover-elevate cursor-pointer border-dashed border-amber-500/50">
                <Link href="/admin/test-accounts">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-amber-500" />
                        <CardTitle className="flex items-center gap-2">
                          Manage Test Accounts
                          <KeyRound className="h-4 w-4 text-amber-500" />
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Create and manage test login credentials for Users, Drivers, and Directors</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>

            <ActivityFeed />
          </>
        )}
      </main>
    </div>
  );
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/admin/activity"],
    queryFn: async () => {
      const res = await fetch("/api/admin/activity", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "map":
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case "dollar":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "gift":
        return <Gift className="h-4 w-4 text-purple-500" />;
      case "user":
        return <Users className="h-4 w-4 text-cyan-500" />;
      case "car":
        return <Car className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
        <CardDescription>Latest platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="mt-0.5">{getIcon(activity.icon)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" data-testid={`text-activity-${index}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
}
