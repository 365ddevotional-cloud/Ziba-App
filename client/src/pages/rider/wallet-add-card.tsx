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
  CheckCircle,
  Lock,
} from "lucide-react";

export default function WalletAddCard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const addCardMutation = useMutation({
    mutationFn: async (data: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      cardName: string;
    }) => {
      const res = await apiRequest("POST", "/api/rider/wallet/add-card", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/payment-methods"] });
      toast({
        title: "Card added successfully",
        description: "Your card has been saved securely",
      });
      navigate("/rider/wallet/payment-methods");
    },
    onError: () => {
      toast({
        title: "Failed to add card",
        description: "Please check your card details and try again",
        variant: "destructive",
      });
    },
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      toast({ title: "Invalid card number", variant: "destructive" });
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      toast({ title: "Invalid expiry date", variant: "destructive" });
      return;
    }
    if (!cvv || cvv.length < 3) {
      toast({ title: "Invalid CVV", variant: "destructive" });
      return;
    }
    if (!cardName) {
      toast({ title: "Please enter cardholder name", variant: "destructive" });
      return;
    }

    addCardMutation.mutate({ cardNumber, expiryDate, cvv, cardName });
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (cleaned.startsWith("5")) return "Mastercard";
    if (cleaned.startsWith("506")) return "Verve";
    return null;
  };

  const cardType = getCardType(cardNumber);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/wallet">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Add Card</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <CreditCard className="w-8 h-8 text-white/80" />
              {cardType && (
                <span className="text-white/80 text-sm font-medium">{cardType}</span>
              )}
            </div>
            <p className="text-xl font-mono text-white tracking-widest">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-white/60">Card Holder</p>
                <p className="text-sm text-white font-medium">
                  {cardName.toUpperCase() || "YOUR NAME"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Expires</p>
                <p className="text-sm text-white font-medium">
                  {expiryDate || "MM/YY"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              data-testid="input-card-number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                maxLength={5}
                data-testid="input-expiry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                data-testid="input-cvv"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              data-testid="input-card-name"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span>Your card details are encrypted and secure</span>
        </div>

        <Button
          className="w-full h-12"
          onClick={handleSubmit}
          disabled={addCardMutation.isPending}
          data-testid="button-save-card"
        >
          {addCardMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Card
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
