import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, DollarSign, ArrowLeft, CheckCircle, Clock, XCircle, User, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCountry } from "@/lib/country";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  rideId: string;
  createdAt: string;
  ride: {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    user: { id: string; fullName: string };
    driver: { id: string; fullName: string } | null;
  };
}

function adminApiRequest(method: string, url: string, body?: any) {
  const options: any = { method };
  if (body !== undefined) {
    options.body = JSON.stringify({ ...body, previewAdmin: true });
    options.headers = { "Content-Type": "application/json", "X-Preview-Admin": "true" };
  } else {
    options.headers = { "X-Preview-Admin": "true" };
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCountry();
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return adminApiRequest("PATCH", `/api/payments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Payment status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPaid = payments?.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPending = payments?.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Payments</h1>
          </div>
          <p className="text-muted-foreground">Track and manage ride payments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-total-paid">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500" data-testid="text-total-pending">
                {formatCurrency(totalPending)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-payment-count">
                {payments?.length ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : payments?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No payments yet. Payments are created when rides are completed.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments?.map((payment) => (
              <Card key={payment.id} data-testid={`card-payment-${payment.id}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold" data-testid={`text-amount-${payment.id}`}>
                          {formatCurrency(payment.amount)}
                        </span>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {payment.ride.user.fullName}
                        </p>
                        {payment.ride.driver && (
                          <p className="flex items-center gap-2">
                            <Car className="h-3 w-3" />
                            {payment.ride.driver.fullName}
                          </p>
                        )}
                        <p className="text-xs">
                          {payment.ride.pickupLocation} → {payment.ride.dropoffLocation}
                        </p>
                        <p className="text-xs">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={payment.status}
                        onValueChange={(value) => updateStatusMutation.mutate({ id: payment.id, status: value })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${payment.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
