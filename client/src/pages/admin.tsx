import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Users, Car, MapPin, Shield, ArrowRight, CheckCircle, Clock, Activity, XCircle, UserCog, Wifi, DollarSign, Gift, Wallet, BarChart3, Calculator, KeyRound, FlaskConical, Smartphone, Settings, Percent, Send, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { StarRating } from "@/components/star-rating";
import { CountrySelector } from "@/components/country-selector";
import { useCountry } from "@/lib/country";
import { AdminGuard } from "@/components/admin-guard";

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
    <AdminGuard>
      <div className="min-h-screen bg-ziba-dark">
        <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-ziba-accent" />
              <h1 className="text-3xl font-bold text-ziba-text-primary" data-testid="text-page-title">Admin Dashboard</h1>
            </div>
            <CountrySelector />
          </div>
          <p className="text-ziba-text-secondary">Real-time platform statistics and management</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ziba-stat" data-testid="text-total-users">
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

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Total Drivers</CardTitle>
                  <Car className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ziba-stat" data-testid="text-total-drivers">
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

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Active Rides</CardTitle>
                  <Activity className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-ziba-accent" data-testid="text-active-rides">
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

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Total Rides</CardTitle>
                  <MapPin className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ziba-stat" data-testid="text-total-rides">
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
              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-ziba-accent" data-testid="text-total-revenue">
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

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-ziba-text-primary">Driver Incentives</CardTitle>
                  <Gift className="h-4 w-4 text-ziba-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-ziba-accent" data-testid="text-total-incentives">
                    {formatCurrency(stats?.incentives?.total ?? 0)}
                  </div>
                  <p className="text-xs text-ziba-text-secondary mt-2">
                    {stats?.incentives?.count ?? 0} incentives awarded to drivers
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/users">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Users</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">View and manage all registered users</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/drivers">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Drivers</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">View and manage all registered drivers</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/directors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCog className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Directors</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Manage {stats?.directors?.total ?? 0} directors overseeing operations</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/rides">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Rides</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">View all rides on the platform</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/payments">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Payments</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Track and manage ride payments</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/incentives">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Incentives</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Award bonuses to drivers</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/wallets">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Wallets</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">View wallet balances and transactions</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/payouts">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Send className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Driver Payouts</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Approve and process driver withdrawals</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/analytics">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Analytics</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Platform metrics and director performance</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/fares">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Manage Ride Fares</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Configure pricing for each country</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/platform-settings">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Percent className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Platform Settings</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Configure commission rates (15-18%)</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/trust-safety">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Trust & Safety</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Manage reports, ratings, and user suspensions</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-ziba-border ziba-card-hover cursor-pointer">
                <Link href="/admin/announcements">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Megaphone className="h-5 w-5 text-ziba-accent" />
                        <CardTitle className="text-ziba-text-primary">Announcements</CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Send notifications to riders and drivers</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-dashed border-amber-500/50 ziba-card-hover cursor-pointer">
                <Link href="/admin/test-accounts">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-amber-500" />
                        <CardTitle className="flex items-center gap-2 text-ziba-text-primary">
                          Manage Test Accounts
                          <KeyRound className="h-4 w-4 text-amber-500" />
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Create and manage test login credentials for Users, Drivers, and Directors</CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="bg-ziba-card border-dashed border-green-500/50 ziba-card-hover cursor-pointer">
                <Link href="/admin/playstore-checklist">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <CardTitle className="flex items-center gap-2 text-ziba-text-primary">
                          Play Store Checklist
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-5 w-5 text-ziba-text-secondary" />
                    </div>
                    <CardDescription className="text-ziba-text-secondary">Verify app readiness for Google Play Store submission</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>

            <ActivityFeed />
          </>
        )}
      </main>
      </div>
    </AdminGuard>
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
  });

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "map":
        return <MapPin className="h-4 w-4 text-ziba-accent" />;
      case "dollar":
        return <DollarSign className="h-4 w-4 text-ziba-accent" />;
      case "gift":
        return <Gift className="h-4 w-4 text-ziba-accent" />;
      case "user":
        return <Users className="h-4 w-4 text-ziba-accent" />;
      case "car":
        return <Car className="h-4 w-4 text-ziba-accent" />;
      default:
        return <Activity className="h-4 w-4 text-ziba-text-secondary" />;
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
    <Card className="mt-8 bg-ziba-card border-ziba-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-ziba-accent" />
          <CardTitle className="text-ziba-text-primary">Recent Activity</CardTitle>
        </div>
        <CardDescription className="text-ziba-text-secondary">Latest platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-ziba-accent" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-ziba-border last:border-0 last:pb-0">
                <div className="mt-0.5">{getIcon(activity.icon)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-ziba-text-primary" data-testid={`text-activity-${index}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-ziba-text-secondary">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ziba-text-secondary text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
}
