import { Link } from "wouter";
import { ArrowLeft, MapPin, Building, TreePine, Plane, Train, CheckCircle, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

const features = [
  {
    icon: Building,
    title: "Downtown Areas",
    description: "High driver density in business districts for quick pickups during rush hours."
  },
  {
    icon: TreePine,
    title: "Suburban Reach",
    description: "Extended coverage to residential neighborhoods and outlying communities."
  },
  {
    icon: Plane,
    title: "Airport Service",
    description: "Reliable airport pickups and drop-offs with dedicated arrival monitoring."
  },
  {
    icon: Train,
    title: "Transit Hubs",
    description: "First and last mile solutions connecting you to train stations and bus terminals."
  }
];

const stats = [
  { value: "50+", label: "Neighborhoods" },
  { value: "3", label: "Airports" },
  { value: "20+", label: "Transit Hubs" },
  { value: "100km", label: "Radius" }
];

const cities = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Kaduna"
];

export default function WhyCityWideCoverage() {
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
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">City-Wide Coverage</h1>
              <p className="text-muted-foreground">We go where you go</p>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Globe className="w-6 h-6 text-purple-500 shrink-0" />
            <p className="text-sm text-foreground">
              Ziba covers the entire metropolitan area and beyond. No destination is out of reach.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              From downtown districts to suburban neighborhoods, Ziba provides comprehensive coverage across the entire metropolitan area. No destination is out of reach.
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
            <h2 className="text-xl font-semibold text-foreground mb-4">Coverage Highlights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Available Cities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {cities.map((city) => (
                <div key={city} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{city}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              More cities coming soon. Stay tuned for expansion updates.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Coverage Benefits</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["No boundary restrictions", "Cross-city rides", "Airport coverage", "Rural reach"].map((benefit, i) => (
                <div key={i} className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Go Anywhere with Ziba</h2>
            <p className="text-muted-foreground mb-4">From downtown to the suburbs, we've got you covered.</p>
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
