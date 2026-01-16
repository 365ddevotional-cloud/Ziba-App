import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wallet as WalletIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CreditCard,
  TrendingUp,
  Building2,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  lockedBalance: number;
  currency: string;
  transactions: Transaction[];
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  country: string;
  verified: boolean;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return lastFour.padStart(accountNumber.length, '*');
}

export default function DriverWallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    country: "NG",
  });

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/driver/wallet"],
    staleTime: 1000 * 60,
  });

  const { data: bankAccount } = useQuery<BankAccount | null>({
    queryKey: ["/api/driver/bank-account"],
  });

  const { data: payouts } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/driver/payouts"],
  });

  const saveBankMutation = useMutation({
    mutationFn: async (data: typeof bankForm) => {
      return apiRequest("POST", "/api/driver/bank-account", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/bank-account"] });
      setShowBankDialog(false);
      toast({
        title: "Bank account saved",
        description: "Your bank details have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save bank account",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest("POST", "/api/driver/withdraw", { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/payouts"] });
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "CREDIT":
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case "DEBIT":
      case "PAYOUT":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "TIP":
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case "HOLD":
        return <Lock className="w-4 h-4 text-amber-500" />;
      case "RELEASE":
        return <WalletIcon className="w-4 h-4 text-blue-500" />;
      case "COMMISSION":
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionLabel = (type: string, description?: string | null) => {
    if (description) return description;
    switch (type) {
      case "CREDIT":
        return "Earnings credited";
      case "DEBIT":
        return "Withdrawal";
      case "PAYOUT":
        return "Payout completed";
      case "TIP":
        return "Tip received";
      case "HOLD":
        return "Funds on hold";
      case "RELEASE":
        return "Funds released";
      case "COMMISSION":
        return "Platform commission";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "CREDIT":
      case "TIP":
      case "RELEASE":
        return "text-green-500";
      case "DEBIT":
      case "PAYOUT":
      case "COMMISSION":
      case "HOLD":
        return "text-red-500";
      default:
        return "text-foreground";
    }
  };

  const getTransactionPrefix = (type: string) => {
    switch (type) {
      case "CREDIT":
      case "TIP":
      case "RELEASE":
        return "+";
      case "DEBIT":
      case "HOLD":
      case "PAYOUT":
      case "COMMISSION":
        return "-";
      default:
        return "";
    }
  };

  const getPayoutStatusBadge = (status: PayoutRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-amber-500 text-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "PAID":
        return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate(amount);
  };

  const handleSaveBank = () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountName) {
      toast({
        title: "Missing details",
        description: "Please fill in all bank account fields",
        variant: "destructive",
      });
      return;
    }
    saveBankMutation.mutate(bankForm);
  };

  const pendingPayout = payouts?.find(p => p.status === "PENDING" || p.status === "APPROVED");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/driver/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Earnings & Withdrawals</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !wallet ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <WalletIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Wallet not available</p>
          </div>
        ) : (
          <>
            <Card className="bg-gradient-to-br from-accent to-accent/80">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-accent-foreground/80 mb-2">Available Balance</p>
                <p className="text-4xl font-bold text-accent-foreground" data-testid="text-balance">
                  {wallet.currency} {wallet.balance.toLocaleString()}
                </p>
                {wallet.lockedBalance > 0 && (
                  <p className="text-sm text-accent-foreground/70 mt-2 flex items-center justify-center gap-1" data-testid="text-locked-balance">
                    <Lock className="w-3 h-3" />
                    {wallet.currency} {wallet.lockedBalance.toLocaleString()} locked
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="h-auto py-4 flex flex-col gap-2"
                    disabled={wallet.balance < 1000 || !!pendingPayout}
                    data-testid="button-withdraw"
                  >
                    <Send className="w-5 h-5" />
                    <span>Withdraw</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to withdraw. Minimum is NGN 1,000.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Amount ({wallet.currency})</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min={1000}
                        max={wallet.balance}
                        data-testid="input-withdraw-amount"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available: {wallet.currency} {wallet.balance.toLocaleString()}
                      </p>
                    </div>
                    {bankAccount ? (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">{bankAccount.bankName}</p>
                        <p className="text-sm text-muted-foreground">{maskAccountNumber(bankAccount.accountNumber)}</p>
                        <p className="text-sm text-muted-foreground">{bankAccount.accountName}</p>
                        {bankAccount.verified && (
                          <Badge variant="outline" className="mt-2 border-green-500 text-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-destructive/10 rounded-md">
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Please add a bank account first
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdraw}
                      disabled={!bankAccount || withdrawMutation.isPending}
                      data-testid="button-confirm-withdraw"
                    >
                      {withdrawMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Withdraw
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2"
                    data-testid="button-bank-account"
                  >
                    <Building2 className="w-5 h-5" />
                    <span>{bankAccount ? "Edit Bank" : "Add Bank"}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{bankAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
                    <DialogDescription>
                      Enter your bank details for withdrawals.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="e.g. Access Bank"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        data-testid="input-bank-name"
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        placeholder="10-digit account number"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        maxLength={20}
                        data-testid="input-account-number"
                      />
                    </div>
                    <div>
                      <Label>Account Name</Label>
                      <Input
                        placeholder="Name on account"
                        value={bankForm.accountName}
                        onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                        data-testid="input-account-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBankDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveBank}
                      disabled={saveBankMutation.isPending}
                      data-testid="button-save-bank"
                    >
                      {saveBankMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {pendingPayout && (
              <Card className="border-amber-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Pending Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet.currency} {pendingPayout.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getPayoutStatusBadge(pendingPayout.status)}
                  </div>
                </CardContent>
              </Card>
            )}

            {bankAccount && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bankAccount.bankName}</p>
                      <p className="text-sm text-muted-foreground">{maskAccountNumber(bankAccount.accountNumber)}</p>
                      <p className="text-sm text-muted-foreground">{bankAccount.accountName}</p>
                    </div>
                    {bankAccount.verified ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        <Clock className="w-3 h-3 mr-1" />Pending
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="hover-elevate">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-foreground" data-testid="text-total-earned">
                    {wallet.currency} {wallet.transactions
                      .filter(tx => tx.type === "CREDIT")
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-foreground" data-testid="text-tips-earned">
                    {wallet.currency} {wallet.transactions
                      .filter(tx => tx.type === "TIP")
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Tips Received</p>
                </CardContent>
              </Card>
            </div>

            {payouts && payouts.length > 0 && (
              <div>
                <h2 className="font-semibold text-foreground mb-3">Withdrawal History</h2>
                <div className="space-y-2">
                  {payouts.slice(0, 5).map((payout) => (
                    <Card key={payout.id} className="hover-elevate" data-testid={`card-payout-${payout.id}`}>
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Send className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {wallet.currency} {payout.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(payout.requestedAt)}
                            </p>
                          </div>
                        </div>
                        {getPayoutStatusBadge(payout.status)}
                      </CardContent>
                      {payout.rejectionReason && (
                        <CardContent className="pt-0 pb-3 px-3">
                          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                            Reason: {payout.rejectionReason}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-foreground mb-3">Transaction History</h2>
              {wallet.transactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete trips to start earning
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {wallet.transactions.map((tx) => (
                    <Card 
                      key={tx.id} 
                      className="hover-elevate"
                      data-testid={`card-transaction-${tx.id}`}
                    >
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {getTransactionLabel(tx.type, tx.description)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`font-semibold ${getTransactionColor(tx.type)}`}>
                            {getTransactionPrefix(tx.type)}{wallet.currency} {Math.abs(tx.amount).toLocaleString()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
