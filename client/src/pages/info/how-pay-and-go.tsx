import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Wallet, Star, CheckCircle, ChevronDown, ChevronUp, Shield, Lock, History, ArrowRight, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

interface PaymentMethod {
  id: string;
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  description: string;
  howItWorks: string[];
  security: string;
  action: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    icon: CreditCard,
    title: "Card Payments",
    subtitle: "Debit or Credit",
    description: "Link your Visa, Mastercard, or Verve card for seamless automatic payments after each ride.",
    howItWorks: [
      "Add your card details securely in the app",
      "Your card is charged automatically after each trip",
      "Receive instant receipts via email"
    ],
    security: "Your card details are encrypted and stored securely. We never see or store your full card number.",
    action: "Add Card"
  },
  {
    id: "wallet",
    icon: Wallet,
    title: "Ziba Wallet",
    subtitle: "Prepaid balance",
    description: "Top up your Ziba Wallet for faster checkout and exclusive promotions. Perfect for budgeting your transport expenses.",
    howItWorks: [
      "Add funds via bank transfer, card, or USSD",
      "Wallet balance is used first for all rides",
      "Track spending and top-up history in the app"
    ],
    security: "Your wallet balance is protected by your account security. Withdrawals require verification.",
    action: "Top Up Wallet"
  },
  {
    id: "rate",
    icon: Star,
    title: "Rate Your Trip",
    subtitle: "Help improve service",
    description: "After each ride, you can rate your driver and provide feedback. This helps maintain quality and rewards excellent drivers.",
    howItWorks: [
      "Rate from 1-5 stars after your trip ends",
      "Add optional comments about your experience",
      "Drivers with high ratings get priority matching"
    ],
    security: "Your ratings are anonymous to drivers. Only the score is visible, not your comments.",
    action: "View Rating History"
  },
  {
    id: "history",
    icon: History,
    title: "Trip History",
    subtitle: "All your rides",
    description: "Access your complete ride history, receipts, and route details anytime. Perfect for expense tracking and reimbursements.",
    howItWorks: [
      "View all past trips with dates and fares",
      "Download PDF receipts for any ride",
      "Export trip data for expense reports"
    ],
    security: "Your trip data is private and only accessible to you. We retain history for up to 2 years.",
    action: "View Trips"
  }
];

const tipPresets = [
  { percent: 5, amount: "$0.63" },
  { percent: 10, amount: "$1.25" },
  { percent: 15, amount: "$1.88" },
  { percent: 20, amount: "$2.50" }
];

export default function HowPayAndGo() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const toggleMethod = (id: string) => {
    setExpandedMethod(expandedMethod === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex items-center justify-center">
              3
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Pay & Go</h1>
              <p className="text-muted-foreground">Cashless, seamless payments</p>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Click on each payment option below to learn how it works and discover the best option for you.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isExpanded = expandedMethod === method.id;
              
              return (
                <Card 
                  key={method.id} 
                  className={`hover-elevate cursor-pointer transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary md:col-span-2' : ''}`}
                  onClick={() => toggleMethod(method.id)}
                  data-testid={`card-payment-${method.id}`}
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{method.title}</h3>
                          <p className="text-muted-foreground text-sm">{method.subtitle}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      {!isExpanded && (
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{method.description}</p>
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-4 space-y-4">
                          <p className="text-muted-foreground text-sm">{method.description}</p>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">How It Works</h4>
                            <div className="space-y-2">
                              {method.howItWorks.map((step, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs text-primary font-medium">{i + 1}</span>
                                  </div>
                                  <span className="text-muted-foreground">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Lock className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">Security & Control</h4>
                                <p className="text-muted-foreground text-sm">{method.security}</p>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full gap-2" data-testid={`button-${method.id}-action`}>
                            {method.id === "card" && <Plus className="w-4 h-4" />}
                            {method.id === "wallet" && <Plus className="w-4 h-4" />}
                            {method.id === "rate" && <Star className="w-4 h-4" />}
                            {method.id === "history" && <Receipt className="w-4 h-4" />}
                            {method.action}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Tip Your Driver
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Show appreciation for great service. 100% of tips go directly to your driver.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="text-sm text-muted-foreground text-center mb-3">
                Based on example fare: $12.50
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {tipPresets.map((tip) => (
                  <Button
                    key={tip.percent}
                    variant={selectedTip === tip.percent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTip(tip.percent)}
                    className="flex-col h-auto py-2"
                    data-testid={`button-tip-${tip.percent}`}
                  >
                    <span className="font-semibold">{tip.percent}%</span>
                    <span className="text-xs opacity-70">{tip.amount}</span>
                  </Button>
                ))}
                <Button
                  variant={selectedTip === -1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTip(-1)}
                  className="h-auto py-2"
                  data-testid="button-tip-custom"
                >
                  Custom
                </Button>
              </div>
              {selectedTip !== null && (
                <div className="text-center text-sm text-green-500">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {selectedTip === -1 ? "Enter custom amount" : `${selectedTip}% tip selected`}
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Simple, Secure Payments</h2>
            <p className="text-muted-foreground mb-4">No cash needed. Just ride and go.</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                Secure
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-green-500" />
                Encrypted
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Instant
              </div>
            </div>
            <Button size="lg" className="gap-2" data-testid="button-pay-cta">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
