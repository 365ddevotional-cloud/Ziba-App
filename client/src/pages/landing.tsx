import { Link } from "wouter";
import { ArrowRight, Shield, Clock, MapPin, Smartphone, CreditCard, Users, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Every ride is tracked and verified for your safety and peace of mind.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "24/7 service whenever you need to get somewhere, day or night.",
  },
  {
    icon: MapPin,
    title: "City-Wide Coverage",
    description: "Comprehensive coverage across the entire metropolitan area.",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Smartphone,
    title: "Sign Up",
    description: "Create your account in seconds with just your email.",
  },
  {
    step: 2,
    icon: MapPin,
    title: "Request a Ride",
    description: "Enter your destination and we'll match you with a driver.",
  },
  {
    step: 3,
    icon: CreditCard,
    title: "Pay & Go",
    description: "Cashless payment for a seamless, hassle-free experience.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="min-h-screen pt-16 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
                data-testid="text-hero-title"
              >
                Your City,<br />
                <span className="text-primary">On Demand</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-md">
                Get where you need to go with Ziba. Fast, reliable, and always available at your fingertips.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/users">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-view-users">
                  <Users className="h-4 w-4" />
                  View Users
                </Button>
              </Link>
              <Link href="/drivers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-hero-view-drivers">
                  <Car className="h-4 w-4" />
                  View Drivers
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-hero-admin">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Drivers</div>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm px-8">
                  Your next ride is just a tap away
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-2xl bg-card border border-card-border p-4 flex flex-col justify-center">
              <div className="text-xs text-muted-foreground">Average wait</div>
              <div className="text-2xl font-bold text-foreground">3 min</div>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-2xl bg-card border border-card-border p-4 flex flex-col justify-center">
              <div className="text-xs text-muted-foreground">Rides today</div>
              <div className="text-2xl font-bold text-foreground">1,234</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
              Why Choose Ziba?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building the future of urban mobility, one ride at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started with Ziba takes less than a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-border"></div>
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto relative z-10">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore the Platform</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse users, drivers, and rides on the Ziba platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rides">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 bg-white text-primary hover:bg-white/90 border-white"
                data-testid="button-cta-rides"
              >
                <MapPin className="h-4 w-4" />
                View Rides
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-white/50 text-white hover:bg-white/10"
                data-testid="button-cta-admin"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">Z</span>
                </div>
                <span className="text-xl font-bold text-foreground">Ziba</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Your city, on demand. Fast, reliable, and always available.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              2024 Ziba. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Users className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
