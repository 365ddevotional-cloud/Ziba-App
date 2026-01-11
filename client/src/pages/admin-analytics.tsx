import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, BarChart3, ArrowLeft, Users, Car, MapPin, DollarSign, TrendingUp, Wallet, Star, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Progress } from "@/components/ui/progress";
import { useCountry } from "@/lib/country";

interface DirectorMetric {
  id: string;
  fullName: string;
  region: string;
  role: string;
  driversAssigned: number;
  driversOnline: number;
  performanceRating: number;
}

interface Analytics {
  users: { total: number; active: number };
  drivers: { total: number; active: number; online: number };
  directors: { total: number; metrics: DirectorMetric[] };
  rides: { total: number; completed: number };
  revenue: { total: number; commissions: number; commissionRate: number };
  wallets: { userBalance: number; driverBalance: number; totalPayouts: number };
}

function adminApiRequest(method: string, url: string) {
  return fetch(url, {
    method,
    headers: { "X-Preview-Admin": "true" },
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { formatCurrency } = useCountry();
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    queryFn: () => adminApiRequest("GET", "/api/analytics"),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

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

        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Platform Analytics</h1>
            <p className="text-muted-foreground">Comprehensive overview of platform performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">{analytics?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{analytics?.users.active || 0}</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-drivers">{analytics?.drivers.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{analytics?.drivers.online || 0}</span> online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-rides">{analytics?.rides.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{analytics?.rides.completed || 0}</span> completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                {formatCurrency(analytics?.revenue.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Commission: {formatCurrency(analytics?.revenue.commissions || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle>Wallet Overview</CardTitle>
              </div>
              <CardDescription>Platform wallet balances and payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">User Wallets Total</span>
                <span className="font-bold" data-testid="text-user-wallet-total">
                  {formatCurrency(analytics?.wallets.userBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Driver Wallets Total</span>
                <span className="font-bold text-green-500" data-testid="text-driver-wallet-total">
                  {formatCurrency(analytics?.wallets.driverBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Payouts</span>
                <span className="font-bold text-blue-500" data-testid="text-total-payouts">
                  {formatCurrency(analytics?.wallets.totalPayouts || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Commission Rate</span>
                <Badge variant="secondary">
                  {((analytics?.revenue.commissionRate || 0.15) * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Platform Metrics</CardTitle>
              </div>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>User Retention</span>
                  <span>{analytics?.users.total ? Math.round((analytics.users.active / analytics.users.total) * 100) : 0}%</span>
                </div>
                <Progress value={analytics?.users.total ? (analytics.users.active / analytics.users.total) * 100 : 0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Driver Availability</span>
                  <span>{analytics?.drivers.active ? Math.round((analytics.drivers.online / analytics.drivers.active) * 100) : 0}%</span>
                </div>
                <Progress value={analytics?.drivers.active ? (analytics.drivers.online / analytics.drivers.active) * 100 : 0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ride Completion Rate</span>
                  <span>{analytics?.rides.total ? Math.round((analytics.rides.completed / analytics.rides.total) * 100) : 0}%</span>
                </div>
                <Progress value={analytics?.rides.total ? (analytics.rides.completed / analytics.rides.total) * 100 : 0} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Director Performance</CardTitle>
            </div>
            <CardDescription>Regional director metrics based on driver online rates</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.directors.metrics && analytics.directors.metrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.directors.metrics.map((director) => (
                  <Card key={director.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{director.fullName}</h4>
                          <p className="text-xs text-muted-foreground">{director.role} - {director.region}</p>
                        </div>
                        <Badge variant="outline">{director.region}</Badge>
                      </div>
                      <div className="mt-3">
                        <StarDisplay rating={director.performanceRating} />
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Drivers Assigned</span>
                        <span className="font-medium">{director.driversAssigned}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Drivers Online</span>
                        <span className="font-medium text-green-500">{director.driversOnline}</span>
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={director.driversAssigned > 0 ? (director.driversOnline / director.driversAssigned) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active directors</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
