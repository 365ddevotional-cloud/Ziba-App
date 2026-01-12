import { Link } from "wouter";
import { ArrowLeft, Shield, CheckCircle, Lock, Eye, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function WhySafeAndSecure() {
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
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Safe & Secure</h1>
              <p className="text-muted-foreground">Your safety is our top priority</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every ride is tracked and verified for your safety and peace of mind. We've built comprehensive safety features into every aspect of the Ziba experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Verified Drivers</h3>
                <p className="text-muted-foreground text-sm">All drivers undergo thorough background checks and vehicle inspections before joining our platform.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Real-Time Tracking</h3>
                <p className="text-muted-foreground text-sm">Track your ride in real-time and share your trip details with friends and family for added safety.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Secure Payments</h3>
                <p className="text-muted-foreground text-sm">All transactions are encrypted and processed through secure payment gateways.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Emergency Support</h3>
                <p className="text-muted-foreground text-sm">24/7 emergency support with in-app emergency button for immediate assistance when needed.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Our Safety Commitment</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">Regular vehicle maintenance checks and inspections</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">Driver training programs focused on passenger safety</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">Two-way rating system for accountability</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">Insurance coverage for every trip</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
