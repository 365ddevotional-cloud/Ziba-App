import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronLeft,
  Loader2,
  CreditCard,
  Plus,
  Star,
  Trash2,
  Building2,
} from "lucide-react";

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  isDefault: boolean;
}

interface PaymentMethodsData {
  cards: PaymentCard[];
  bankAccounts: BankAccount[];
}

export default function WalletPaymentMethods() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<PaymentMethodsData>({
    queryKey: ["/api/rider/payment-methods"],
    staleTime: 1000 * 60,
  });

  const setDefaultMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "card" | "bank" }) => {
      const res = await apiRequest("POST", `/api/rider/payment-methods/${id}/default`, { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/payment-methods"] });
      toast({ title: "Default payment method updated" });
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "card" | "bank" }) => {
      const res = await apiRequest("DELETE", `/api/rider/payment-methods/${id}`, { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rider/payment-methods"] });
      toast({ title: "Payment method removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove", variant: "destructive" });
    },
  });

  const cards = data?.cards || [];
  const bankAccounts = data?.bankAccounts || [];
  const hasNoMethods = cards.length === 0 && bankAccounts.length === 0;

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider/wallet">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Payment Methods</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : hasNoMethods ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="ziba-headline">No payment methods</h2>
              <p className="ziba-subheadline">Add a card or bank account to get started</p>
            </div>
            <Link href="/rider/wallet/add-card">
              <Button className="gap-2" data-testid="button-add-first-card">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {cards.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Cards
                </h2>
                {cards.map((card) => (
                  <Card key={card.id} className="ziba-card" data-testid={`card-payment-${card.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getCardIcon(card.brand)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {card.brand} •••• {card.last4}
                            </p>
                            {card.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expires {card.expiryMonth.toString().padStart(2, "0")}/{card.expiryYear}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!card.isDefault && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDefaultMutation.mutate({ id: card.id, type: "card" })}
                              disabled={setDefaultMutation.isPending}
                              data-testid={`button-default-${card.id}`}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeMutation.mutate({ id: card.id, type: "card" })}
                            disabled={removeMutation.isPending}
                            data-testid={`button-remove-${card.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {bankAccounts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Bank Accounts
                </h2>
                {bankAccounts.map((account) => (
                  <Card key={account.id} className="ziba-card" data-testid={`card-bank-${account.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {account.bankName}
                            </p>
                            {account.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            •••• {account.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!account.isDefault && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDefaultMutation.mutate({ id: account.id, type: "bank" })}
                              disabled={setDefaultMutation.isPending}
                              data-testid={`button-default-${account.id}`}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeMutation.mutate({ id: account.id, type: "bank" })}
                            disabled={removeMutation.isPending}
                            data-testid={`button-remove-${account.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Link href="/rider/wallet/add-card">
              <Button variant="outline" className="w-full gap-2" data-testid="button-add-card">
                <Plus className="w-4 h-4" />
                Add New Card
              </Button>
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
