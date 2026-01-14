import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronLeft,
  Loader2,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
} from "lucide-react";

type PaymentMethod = "card" | "bank" | "wallet";

export default function WalletAddFunds() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const addFundsMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      const res = await apiRequest("POST", "/api/rider/wallet/add-funds", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/wallet"] });
      setShowConfirmation(true);
    },
    onError: () => {
      toast({
        title: "Request failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    addFundsMutation.mutate({ amount: numAmount, method: paymentMethod });
  };

  const quickAmounts = [1000, 2000, 5000, 10000];

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/rider/wallet">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Add Funds</h1>
        </header>

        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="ziba-headline">Request Received</h2>
              <p className="ziba-subheadline">
                Thank you. Your funding request of NGN {parseFloat(amount).toLocaleString()} has been received and is being processed.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              You will be notified once the funds are added to your wallet.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/rider/wallet")}
              data-testid="button-back-to-wallet"
            >
              Back to Wallet
            </Button>
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
        <h1 className="font-semibold text-foreground">Add Funds</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <div className="space-y-3">
          <Label htmlFor="amount" className="text-sm font-medium">
            Enter Amount (NGN)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl h-14 text-center font-semibold"
            data-testid="input-amount"
          />
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((qa) => (
              <Button
                key={qa}
                variant="outline"
                size="sm"
                onClick={() => setAmount(qa.toString())}
                data-testid={`button-quick-${qa}`}
              >
                NGN {qa.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment Method</Label>
          <div className="space-y-2">
            <Card
              className={`cursor-pointer hover-elevate ${paymentMethod === "card" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setPaymentMethod("card")}
              data-testid="option-card"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Debit/Credit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Verve</p>
                </div>
                {paymentMethod === "card" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer hover-elevate ${paymentMethod === "bank" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setPaymentMethod("bank")}
              data-testid="option-bank"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">Direct bank payment</p>
                </div>
                {paymentMethod === "bank" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer hover-elevate ${paymentMethod === "wallet" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setPaymentMethod("wallet")}
              data-testid="option-wallet"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Mobile Wallet</p>
                  <p className="text-xs text-muted-foreground">OPay, PalmPay, Kuda</p>
                </div>
                {paymentMethod === "wallet" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Button
          className="w-full h-12"
          onClick={handleSubmit}
          disabled={!amount || addFundsMutation.isPending}
          data-testid="button-proceed"
        >
          {addFundsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed"
          )}
        </Button>
      </main>
    </div>
  );
}
