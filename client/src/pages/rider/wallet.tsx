import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  Wallet as WalletIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reference: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  transactions: Transaction[];
}

export default function RiderWallet() {
  const [, navigate] = useLocation();

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/rider/wallet"],
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
      case "RIDE_PAYMENT":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "TIP":
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "CREDIT":
        return "Added to wallet";
      case "DEBIT":
        return "Withdrawal";
      case "RIDE_PAYMENT":
        return "Ride payment";
      case "TIP":
        return "Tip to driver";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/home">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Wallet</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-20">
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
            <Card className="bg-gradient-to-br from-primary to-primary/80">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-primary-foreground/80 mb-2">Available Balance</p>
                <p className="text-4xl font-bold text-primary-foreground" data-testid="text-balance">
                  NGN {wallet.balance.toLocaleString()}
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <Link href="/rider/wallet/add-funds">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      data-testid="button-add-funds"
                    >
                      <Plus className="w-4 h-4" />
                      Add Funds
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card 
                className="hover-elevate cursor-pointer" 
                onClick={() => navigate("/rider/wallet/add-card")}
                data-testid="card-add-card"
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Add Card</p>
                </CardContent>
              </Card>
              <Card 
                className="hover-elevate cursor-pointer" 
                onClick={() => navigate("/rider/wallet/payment-methods")}
                data-testid="card-payment-methods"
              >
                <CardContent className="p-4 text-center">
                  <WalletIcon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Payment Methods</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="font-semibold text-foreground mb-3">Recent Transactions</h2>
              {wallet.transactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {wallet.transactions.map((tx) => (
                    <Card 
                      key={tx.id} 
                      className="hover-elevate cursor-pointer"
                      onClick={() => navigate(`/rider/wallet/transaction/${tx.id}`)}
                      data-testid={`card-transaction-${tx.id}`}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {getTransactionLabel(tx.type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            tx.type === "CREDIT" ? "text-green-500" : "text-foreground"
                          }`}>
                            {tx.type === "CREDIT" ? "+" : "-"}NGN {tx.amount.toLocaleString()}
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

      <RiderBottomNav activeTab="wallet" />
    </div>
  );
}
