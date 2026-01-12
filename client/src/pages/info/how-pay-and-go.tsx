import { Link } from "wouter";
import { ArrowLeft, CreditCard, Wallet, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function HowPayAndGo() {
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
              Cashless payment for a seamless, hassle-free experience. Just ride and go - your payment is processed automatically.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Card Payments</h3>
                <p className="text-muted-foreground text-sm">Link your debit or credit card for automatic payments after each ride.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Ziba Wallet</h3>
                <p className="text-muted-foreground text-sm">Top up your wallet for even faster checkout and exclusive promotions.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Rate Your Trip</h3>
                <p className="text-muted-foreground text-sm">Help us improve by rating your driver and providing feedback.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Trip History</h3>
                <p className="text-muted-foreground text-sm">Access receipts and ride history anytime from your account.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Tip Your Driver</h2>
            <p className="text-muted-foreground text-center mb-4">Show appreciation for great service with optional tips. 100% goes directly to your driver.</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm">5%</Button>
              <Button variant="outline" size="sm">10%</Button>
              <Button variant="outline" size="sm">15%</Button>
              <Button variant="outline" size="sm">20%</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
