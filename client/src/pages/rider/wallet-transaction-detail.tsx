import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  Receipt,
} from "lucide-react";

interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  reference: string | null;
  status: string;
  createdAt: string;
  rideId?: string;
  description?: string;
}

export default function WalletTransactionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: transaction, isLoading } = useQuery<TransactionDetail>({
    queryKey: ["/api/rider/wallet/transaction", id],
    staleTime: 1000 * 60,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "CREDIT":
        return <ArrowDownLeft className="w-6 h-6 text-white" />;
      case "DEBIT":
      case "RIDE_PAYMENT":
        return <ArrowUpRight className="w-6 h-6 text-white" />;
      case "TIP":
        return <DollarSign className="w-6 h-6 text-white" />;
      default:
        return <CreditCard className="w-6 h-6 text-white" />;
    }
  };

  const getTransactionIconBg = (type: string) => {
    switch (type) {
      case "CREDIT":
        return "bg-emerald-500";
      case "DEBIT":
      case "RIDE_PAYMENT":
        return "bg-red-500";
      case "TIP":
        return "bg-amber-500";
      default:
        return "bg-muted-foreground";
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "CREDIT":
        return "Wallet Funding";
      case "DEBIT":
        return "Withdrawal";
      case "RIDE_PAYMENT":
        return "Ride Payment";
      case "TIP":
        return "Driver Tip";
      case "PENDING_FUNDING":
        return "Pending Funding";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-600 dark:text-emerald-400";
      case "PENDING":
        return "text-amber-600 dark:text-amber-400";
      case "FAILED":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/rider/wallet">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Transaction</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Transaction not found</p>
            <Link href="/rider/wallet">
              <Button>Back to Wallet</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/wallet">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Transaction Details</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <div className="text-center py-6 space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getTransactionIconBg(transaction.type)}`}>
            {getTransactionIcon(transaction.type)}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {getTransactionLabel(transaction.type)}
            </p>
            <p className={`text-3xl font-bold ${transaction.type === "CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`} data-testid="text-amount">
              {transaction.type === "CREDIT" ? "+" : "-"}NGN {transaction.amount.toLocaleString()}
            </p>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
            transaction.status === "COMPLETED" 
              ? "bg-emerald-100 dark:bg-emerald-900/30" 
              : transaction.status === "PENDING"
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}>
            {transaction.status === "COMPLETED" ? (
              <CheckCircle className={`w-4 h-4 ${getStatusColor(transaction.status)}`} />
            ) : (
              <Clock className={`w-4 h-4 ${getStatusColor(transaction.status)}`} />
            )}
            <span className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>

        <Card className="ziba-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(transaction.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="text-sm font-medium text-foreground">
                {formatTime(transaction.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-medium text-foreground">
                {getTransactionLabel(transaction.type)}
              </span>
            </div>
            {transaction.reference && (
              <div className="flex justify-between items-start py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Reference ID</span>
                <span className="text-sm font-mono text-foreground text-right max-w-[180px] break-all">
                  {transaction.reference}
                </span>
              </div>
            )}
            {transaction.rideId && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Ride ID</span>
                <span className="text-sm font-mono text-foreground">
                  {transaction.rideId.slice(0, 8)}...
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-foreground">
              Thank you for using Ziba. We appreciate your trust.
            </p>
          </CardContent>
        </Card>

        <Link href="/rider/wallet">
          <Button variant="outline" className="w-full" data-testid="button-back-to-wallet">
            Back to Wallet
          </Button>
        </Link>
      </main>
    </div>
  );
}
