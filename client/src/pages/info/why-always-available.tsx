import { Link } from "wouter";
import { ArrowLeft, Clock, Sun, Moon, Zap, Globe, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

const features = [
  {
    icon: Sun,
    title: "Daytime Rides",
    description: "Peak hour coverage with thousands of active drivers ready to pick you up within minutes."
  },
  {
    icon: Moon,
    title: "Night Service",
    description: "Late-night availability for those returning from events, work, or simply enjoying the nightlife."
  },
  {
    icon: Zap,
    title: "Quick Response",
    description: "Average pickup time of just 3 minutes in most areas, getting you moving faster."
  },
  {
    icon: Calendar,
    title: "Holiday Coverage",
    description: "We never take a day off. Service available on all holidays and special occasions."
  }
];

const stats = [
  { value: "24/7", label: "Service Hours" },
  { value: "3 min", label: "Avg. Wait Time" },
  { value: "99.9%", label: "Uptime" }
];

const trustIndicators = [
  "10,000+ active drivers",
  "365 days a year",
  "No surge at 3am",
  "Global availability"
];

export default function WhyAlwaysAvailable() {
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
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Always Available</h1>
              <p className="text-muted-foreground">24/7 service whenever you need it</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500 shrink-0" />
            <p className="text-sm text-foreground">
              Ziba operates round the clock, 365 days a year. Your ride is just a tap away, anytime.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether it's early morning or late at night, Ziba is always ready to get you where you need to go. Our extensive network of drivers ensures minimal wait times around the clock.
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
            <h2 className="text-xl font-semibold text-foreground mb-6">Availability Stats</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Why We're Always Ready</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustIndicators.map((indicator, i) => (
                <div key={i} className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">{indicator}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">When You Need Us Most</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Early morning flights and appointments</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Late night returns from events</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Holiday travel and celebrations</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Emergency situations anytime</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready When You Are</h2>
            <p className="text-muted-foreground mb-4">No matter the hour, Ziba has you covered.</p>
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
