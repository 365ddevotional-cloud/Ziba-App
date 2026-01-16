import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function DriverWallet() {
  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/driver/wallet"],
    staleTime: 1000 * 60,
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
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "TIP":
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case "HOLD":
        return <WalletIcon className="w-4 h-4 text-amber-500" />;
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
        return "text-green-500";
      case "DEBIT":
      case "COMMISSION":
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
      case "COMMISSION":
        return "-";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/driver/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Earnings</h1>
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
                  <p className="text-sm text-accent-foreground/70 mt-2" data-testid="text-locked-balance">
                    {wallet.currency} {wallet.lockedBalance.toLocaleString()} pending settlement
                  </p>
                )}
              </CardContent>
            </Card>

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
                            {getTransactionPrefix(tx.type)}{wallet.currency} {tx.amount.toLocaleString()}
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
