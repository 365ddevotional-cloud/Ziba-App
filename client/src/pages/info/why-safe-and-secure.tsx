import { Link } from "wouter";
import { ArrowLeft, Shield, CheckCircle, Lock, Eye, Bell, UserCheck, AlertTriangle, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

const features = [
  {
    icon: UserCheck,
    title: "Verified Drivers",
    description: "All drivers undergo thorough background checks, identity verification, and vehicle inspections before joining our platform."
  },
  {
    icon: Eye,
    title: "Real-Time Tracking",
    description: "Track your ride in real-time and share your trip details with friends and family for added safety."
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "All transactions are encrypted using bank-grade security and processed through secure payment gateways."
  },
  {
    icon: Bell,
    title: "Emergency Support",
    description: "24/7 emergency support with in-app emergency button for immediate assistance when needed."
  }
];

const trustIndicators = [
  "1M+ safe rides completed",
  "4.8/5 average safety rating",
  "24/7 support team",
  "Insurance on every trip"
];

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

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-500 shrink-0" />
            <p className="text-sm text-foreground">
              Every ride on Ziba is protected by our comprehensive safety features and 24/7 monitoring.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've built comprehensive safety features into every aspect of the Ziba experience. From driver verification to real-time tracking, every measure is designed to keep you safe.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover-elevate">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Our Safety Commitment</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Regular vehicle maintenance checks and inspections</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Driver training programs focused on passenger safety</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Two-way rating system for accountability</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Insurance coverage for every trip</span>
              </li>
            </ul>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">In Case of Emergency</h4>
                  <p className="text-muted-foreground text-sm">
                    Use the emergency button in the app to alert our safety team and share your location with local authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Trust Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustIndicators.map((indicator, i) => (
                <div key={i} className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">{indicator}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ride with Confidence</h2>
            <p className="text-muted-foreground mb-4">Experience the safest ride-hailing platform.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2" data-testid="button-signup-cta">
                Sign Up Now
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Link href="/how/request-ride">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-ride-cta">
                  Request a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
