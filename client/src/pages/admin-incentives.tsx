import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Gift, ArrowLeft, Plus, Trash2, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useCountry } from "@/lib/country";
import { AdminGuard } from "@/components/admin-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Incentive {
  id: string;
  amount: number;
  reason: string;
  driverId: string;
  createdAt: string;
  driver: {
    id: string;
    fullName: string;
  };
}

interface Driver {
  id: string;
  fullName: string;
  status: string;
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

export default function AdminIncentivesPage() {
  const { toast } = useToast();
  const { formatCurrency, country } = useCountry();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { data: incentives, isLoading } = useQuery<Incentive[]>({
    queryKey: ["/api/incentives"],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { driverId: string; amount: number; reason: string }) => {
      return adminApiRequest("POST", "/api/incentives", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incentives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDialogOpen(false);
      setSelectedDriver("");
      setAmount("");
      setReason("");
      toast({ title: "Incentive created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiRequest("DELETE", `/api/incentives/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incentives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Incentive deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!selectedDriver || !amount || !reason) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    createMutation.mutate({ driverId: selectedDriver, amount: numericAmount, reason });
  };

  const totalIncentives = incentives?.reduce((sum, i) => sum + i.amount, 0) || 0;

  const incentivesByDriver = incentives?.reduce((acc: Record<string, { driver: string; total: number; count: number }>, i) => {
    if (!acc[i.driverId]) {
      acc[i.driverId] = { driver: i.driver.fullName, total: 0, count: 0 };
    }
    acc[i.driverId].total += i.amount;
    acc[i.driverId].count += 1;
    return acc;
  }, {}) || {};

  return (
    <AdminGuard>
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold" data-testid="text-page-title">Driver Incentives</h1>
              </div>
              <p className="text-muted-foreground">Award bonuses and incentives to drivers</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-incentive">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Incentive
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Incentive</DialogTitle>
                  <DialogDescription>Award a bonus to a driver</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver</Label>
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger data-testid="select-driver">
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.filter(d => d.status === "ACTIVE").map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({country.symbol})</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., Weekly bonus, 100 rides milestone"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      data-testid="input-reason"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500" data-testid="text-total-incentives">
                {formatCurrency(totalIncentives)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Incentives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-incentive-count">
                {incentives?.length ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drivers Rewarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-driver-count">
                {Object.keys(incentivesByDriver).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : incentives?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No incentives yet. Click "Add Incentive" to award a bonus to a driver.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incentives?.map((incentive) => (
              <Card key={incentive.id} data-testid={`card-incentive-${incentive.id}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-purple-500" data-testid={`text-amount-${incentive.id}`}>
                          {formatCurrency(incentive.amount)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <Car className="h-3 w-3" />
                          {incentive.driver.fullName}
                        </p>
                        <p>{incentive.reason}</p>
                        <p className="text-xs">
                          {new Date(incentive.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500" data-testid={`button-delete-${incentive.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Incentive</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this {formatCurrency(incentive.amount)} incentive for {incentive.driver.fullName}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(incentive.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      </div>
    </AdminGuard>
  );
}
