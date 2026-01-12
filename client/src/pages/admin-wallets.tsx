import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Wallet, ArrowLeft, User, Car, ArrowUpRight, ArrowDownRight, DollarSign, Percent, TrendingUp, Download, Heart, FlaskConical, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useCountry } from "@/lib/country";
import { AdminGuard } from "@/components/admin-guard";

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT" | "COMMISSION" | "PAYOUT" | "TIP" | "RIDE_PAYMENT" | "ADMIN_ADJUSTMENT";
  amount: number;
  reference: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  ownerId: string;
  ownerType: "USER" | "DRIVER";
  balance: number;
  createdAt: string;
  transactions: Transaction[];
  owner: { fullName: string; email: string } | null;
}

interface PlatformConfig {
  id: string;
  commissionRate: number;
  testModeEnabled: boolean;
  paymentGateway: "STRIPE" | "PAYSTACK" | "FLUTTERWAVE";
  paymentGatewayMode: "SANDBOX" | "LIVE";
}

interface Tip {
  id: string;
  amount: number;
  rideId: string;
  userId: string;
  driverId: string;
  createdAt: string;
  user: { fullName: string; email: string };
  driver: { fullName: string; email: string };
}

function adminApiRequest(method: string, url: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: { "X-Preview-Admin": "true", "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    options.body = JSON.stringify({ ...body, previewAdmin: true });
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

export default function AdminWalletsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { formatCurrency } = useCountry();
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [newCommissionRate, setNewCommissionRate] = useState("");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const { data: wallets, isLoading } = useQuery<WalletData[]>({
    queryKey: ["/api/wallets"],
    queryFn: () => adminApiRequest("GET", "/api/wallets"),
  });

  const { data: config } = useQuery<PlatformConfig>({
    queryKey: ["/api/config"],
  });

  const { data: tips } = useQuery<Tip[]>({
    queryKey: ["/api/tips"],
    queryFn: () => adminApiRequest("GET", "/api/tips"),
  });

  const toggleTestModeMutation = useMutation({
    mutationFn: async () => {
      return adminApiRequest("POST", "/api/config/toggle-test-mode");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Test mode toggled" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async ({ walletId, amount }: { walletId: string; amount: number }) => {
      return adminApiRequest("POST", `/api/wallets/${walletId}/payout`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      toast({ title: "Payout processed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (commissionRate: number) => {
      return adminApiRequest("PATCH", "/api/config", { commissionRate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      setConfigDialogOpen(false);
      setNewCommissionRate("");
      toast({ title: "Commission rate updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handlePayout = () => {
    if (!selectedWallet || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    payoutMutation.mutate({ walletId: selectedWallet.id, amount });
  };

  const handleUpdateConfig = () => {
    const rate = parseFloat(newCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({ title: "Error", description: "Enter a valid percentage (0-100)", variant: "destructive" });
      return;
    }
    updateConfigMutation.mutate(rate / 100);
  };

  const userWallets = wallets?.filter(w => w.ownerType === "USER") || [];
  const driverWallets = wallets?.filter(w => w.ownerType === "DRIVER") || [];
  const totalUserBalance = userWallets.reduce((sum, w) => sum + w.balance, 0);
  const totalDriverBalance = driverWallets.reduce((sum, w) => sum + w.balance, 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "CREDIT":
      case "RIDE_PAYMENT":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case "DEBIT":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "COMMISSION":
        return <Percent className="h-4 w-4 text-yellow-500" />;
      case "PAYOUT":
        return <Download className="h-4 w-4 text-blue-500" />;
      case "TIP":
        return <DollarSign className="h-4 w-4 text-green-400" />;
      case "ADMIN_ADJUSTMENT":
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "CREDIT":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Credit</Badge>;
      case "DEBIT":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Debit</Badge>;
      case "COMMISSION":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Commission</Badge>;
      case "PAYOUT":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Payout</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>

          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-config">
                <Percent className="h-4 w-4 mr-2" />
                Commission: {config ? `${(config.commissionRate * 100).toFixed(0)}%` : "..."}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Commission Rate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">New Commission Rate (%)</label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(e.target.value)}
                    data-testid="input-commission-rate"
                  />
                </div>
                <Button onClick={handleUpdateConfig} disabled={updateConfigMutation.isPending} data-testid="button-update-config">
                  {updateConfigMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Wallets</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-user-balance">{formatCurrency(totalUserBalance)}</div>
              <p className="text-xs text-muted-foreground">{userWallets.length} wallets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Driver Wallets</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-driver-balance">{formatCurrency(totalDriverBalance)}</div>
              <p className="text-xs text-muted-foreground">{driverWallets.length} wallets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-commission-rate">
                {config ? `${(config.commissionRate * 100).toFixed(0)}%` : "..."}
              </div>
              <p className="text-xs text-muted-foreground">Platform fee</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Admin - Wallets</CardTitle>
                <CardDescription>Manage all user and driver wallets</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : wallets && wallets.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Recent Transactions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id} data-testid={`row-wallet-${wallet.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {wallet.ownerType === "USER" ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Car className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-medium">{wallet.owner?.fullName || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{wallet.owner?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={wallet.ownerType === "USER" ? "default" : "secondary"}>
                            {wallet.ownerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${wallet.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {formatCurrency(wallet.balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 max-w-xs">
                            {wallet.transactions.slice(0, 3).map((tx) => (
                              <div key={tx.id} className="flex items-center gap-2 text-xs">
                                {getTransactionIcon(tx.type)}
                                <span className={tx.amount >= 0 ? "text-green-500" : "text-red-500"}>
                                  {tx.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                                </span>
                                <span className="text-muted-foreground truncate">{tx.reference?.slice(0, 20)}...</span>
                              </div>
                            ))}
                            {wallet.transactions.length === 0 && (
                              <span className="text-muted-foreground text-xs">No transactions</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {wallet.ownerType === "DRIVER" && wallet.balance > 0 && (
                            <Dialog open={payoutDialogOpen && selectedWallet?.id === wallet.id} onOpenChange={(open) => {
                              setPayoutDialogOpen(open);
                              if (open) setSelectedWallet(wallet);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" data-testid={`button-payout-${wallet.id}`}>
                                  <Download className="h-4 w-4 mr-1" />
                                  Payout
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Process Payout</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Driver: {wallet.owner?.fullName}
                                  </p>
                                  <p className="text-sm">
                                    Available Balance: <span className="font-bold text-green-500">{formatCurrency(wallet.balance)}</span>
                                  </p>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Payout Amount</label>
                                    <Input
                                      type="number"
                                      placeholder="Enter amount"
                                      value={payoutAmount}
                                      onChange={(e) => setPayoutAmount(e.target.value)}
                                      max={wallet.balance}
                                      data-testid="input-payout-amount"
                                    />
                                  </div>
                                  <Button onClick={handlePayout} disabled={payoutMutation.isPending} data-testid="button-confirm-payout">
                                    {payoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Process Payout
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No wallets found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Tips</CardTitle>
                <CardDescription>All tips given by riders to drivers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tips && tips.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rider</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tips.map((tip) => (
                      <TableRow key={tip.id} data-testid={`row-tip-${tip.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tip.user?.fullName}</div>
                            <div className="text-xs text-muted-foreground">{tip.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tip.driver?.fullName}</div>
                            <div className="text-xs text-muted-foreground">{tip.driver?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-500">{formatCurrency(tip.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {new Date(tip.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No tips yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Mode & Payment Gateway Settings */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Test mode and payment gateway configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Test Mode</h4>
                    <p className="text-xs text-muted-foreground">Enable sandbox testing environment</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleTestModeMutation.mutate()}
                    disabled={toggleTestModeMutation.isPending}
                    data-testid="button-toggle-test-mode"
                  >
                    {config?.testModeEnabled ? (
                      <>
                        <ToggleRight className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-green-500">ON</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">OFF</span>
                      </>
                    )}
                  </Button>
                </div>
                <Badge variant={config?.testModeEnabled ? "default" : "secondary"}>
                  {config?.testModeEnabled ? "Test Mode Active" : "Live Mode"}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Payment Gateway</h4>
                    <p className="text-xs text-muted-foreground">Current payment provider</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{config?.paymentGateway || "STRIPE"}</Badge>
                  <Badge variant={config?.paymentGatewayMode === "LIVE" ? "destructive" : "secondary"}>
                    {config?.paymentGatewayMode || "SANDBOX"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      </div>
    </AdminGuard>
  );
}
