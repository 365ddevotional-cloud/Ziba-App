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
    href: "/why/safe-and-secure",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "24/7 service whenever you need to get somewhere, day or night.",
    href: "/why/always-available",
  },
  {
    icon: MapPin,
    title: "City-Wide Coverage",
    description: "Comprehensive coverage across the entire metropolitan area.",
    href: "/why/city-wide-coverage",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Smartphone,
    title: "Sign Up",
    description: "Create your account in seconds with just your email.",
    href: "/how/sign-up",
  },
  {
    step: 2,
    icon: MapPin,
    title: "Request a Ride",
    description: "Enter your destination and we'll match you with a driver.",
    href: "/how/request-ride",
  },
  {
    step: 3,
    icon: CreditCard,
    title: "Pay & Go",
    description: "Cashless payment for a seamless, hassle-free experience.",
    href: "/how/pay-and-go",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ziba-bg">
      <Header />
      
      <section className="min-h-screen pt-16 flex items-center relative overflow-hidden ziba-hero-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
                data-testid="text-hero-title"
              >
                <span className="text-ziba-text-primary">Your City,</span><br />
                <span className="ziba-gradient-text">On Demand</span>
              </h1>
              <p className="text-lg sm:text-xl text-ziba-text-secondary max-w-md leading-relaxed">
                Get where you need to go with Ziba. Fast, reliable, and always available at your fingertips.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/users">
                <Button size="lg" className="w-full sm:w-auto gap-2 ziba-btn-primary" data-testid="button-hero-view-users">
                  <Users className="h-5 w-5" />
                  View Users
                </Button>
              </Link>
              <Link href="/drivers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 ziba-btn-secondary" data-testid="button-hero-view-drivers">
                  <Car className="h-5 w-5" />
                  View Drivers
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 ziba-btn-secondary" data-testid="button-hero-admin">
                  <Shield className="h-5 w-5" />
                  Admin
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-ziba-accent">10K+</div>
                <div className="text-sm text-ziba-text-secondary mt-1">Active Users</div>
              </div>
              <div className="w-px h-12 bg-ziba-border-light"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ziba-accent">500+</div>
                <div className="text-sm text-ziba-text-secondary mt-1">Drivers</div>
              </div>
              <div className="w-px h-12 bg-ziba-border-light"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ziba-accent">4.9</div>
                <div className="text-sm text-ziba-text-secondary mt-1">Rating</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="aspect-square rounded-3xl ziba-glow-border flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgba(26, 188, 156, 0.15), rgba(10, 37, 64, 0.2))' }}>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center ziba-glow" style={{ background: 'rgba(26, 188, 156, 0.2)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(26, 188, 156, 0.4)' }}>
                  <MapPin className="w-12 h-12 text-ziba-accent" />
                </div>
                <p className="text-ziba-text-secondary text-sm px-8">
                  Your next ride is just a tap away
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-36 h-36 rounded-2xl bg-ziba-card border border-ziba p-4 flex flex-col justify-center ziba-glow shadow-xl">
              <div className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium">Average wait</div>
              <div className="text-3xl font-bold text-ziba-accent mt-1">3 min</div>
            </div>
            <div className="absolute -top-4 -right-4 w-36 h-36 rounded-2xl bg-ziba-card border border-ziba p-4 flex flex-col justify-center ziba-glow shadow-xl">
              <div className="text-xs text-ziba-text-muted uppercase tracking-wider font-medium">Rides today</div>
              <div className="text-3xl font-bold text-ziba-accent mt-1">1,234</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ziba-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-ziba-text-primary mb-4" data-testid="text-features-title">
              Why Choose Ziba?
            </h2>
            <p className="text-ziba-text-secondary max-w-2xl mx-auto text-lg">
              We're building the future of urban mobility, one ride at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="ziba-card-hover cursor-pointer h-full bg-ziba-bg border-ziba hover:border-ziba-accent/30" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-8 space-y-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26, 188, 156, 0.15)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(26, 188, 156, 0.3)' }}>
                      <feature.icon className="w-7 h-7 text-ziba-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-ziba-text-primary">{feature.title}</h3>
                    <p className="text-ziba-text-secondary leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-ziba-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-ziba-text-primary mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-ziba-text-secondary max-w-2xl mx-auto text-lg">
              Getting started with Ziba takes less than a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-ziba-accent/50 via-ziba-accent to-ziba-accent/50"></div>
            {howItWorks.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="relative text-center space-y-5 cursor-pointer ziba-card-hover p-6 rounded-2xl bg-ziba-card/50 border border-transparent hover:border-ziba-accent/20" data-testid={`card-how-${index}`}>
                  <div className="w-14 h-14 rounded-full bg-ziba-accent text-ziba-primary font-bold text-xl flex items-center justify-center mx-auto relative z-10 shadow-lg shadow-teal-500/30">
                    {item.step}
                  </div>
                  <div className="w-18 h-18 rounded-2xl bg-ziba-surface border border-ziba flex items-center justify-center mx-auto">
                    <item.icon className="w-9 h-9 text-ziba-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-ziba-text-primary">{item.title}</h3>
                  <p className="text-ziba-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-ziba-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-ziba-text-primary">Explore the Platform</h2>
          <p className="text-ziba-text-secondary mb-10 max-w-xl mx-auto text-lg">
            Browse users, drivers, and rides on the Ziba platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rides">
              <Button 
                size="lg" 
                className="gap-2 ziba-btn-primary px-8"
                data-testid="button-cta-rides"
              >
                <MapPin className="h-5 w-5" />
                View Rides
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 ziba-btn-secondary px-8"
                data-testid="button-cta-admin"
              >
                <Shield className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-ziba bg-ziba-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ziba-accent flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <span className="text-ziba-primary font-bold text-xl">Z</span>
                </div>
                <span className="text-2xl font-bold text-ziba-text-primary">Ziba</span>
              </div>
              <p className="text-ziba-text-secondary text-sm leading-relaxed">
                Your city, on demand. Fast, reliable, and always available.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-ziba-text-primary">Company</h4>
              <ul className="space-y-3 text-ziba-text-secondary text-sm">
                <li><Link href="/company/about" className="hover:text-ziba-accent transition-colors" data-testid="link-about">About Us</Link></li>
                <li><Link href="/company/careers" className="hover:text-ziba-accent transition-colors" data-testid="link-careers">Careers</Link></li>
                <li><Link href="/company/press" className="hover:text-ziba-accent transition-colors" data-testid="link-press">Press</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-ziba-text-primary">Support</h4>
              <ul className="space-y-3 text-ziba-text-secondary text-sm">
                <li><Link href="/support/help-center" className="hover:text-ziba-accent transition-colors" data-testid="link-help">Help Center</Link></li>
                <li><Link href="/support/safety" className="hover:text-ziba-accent transition-colors" data-testid="link-safety">Safety</Link></li>
                <li><Link href="/support/contact" className="hover:text-ziba-accent transition-colors" data-testid="link-contact">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-ziba-text-primary">Legal</h4>
              <ul className="space-y-3 text-ziba-text-secondary text-sm">
                <li><Link href="/legal/terms" className="hover:text-ziba-accent transition-colors" data-testid="link-terms">Terms</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-ziba-accent transition-colors" data-testid="link-privacy">Privacy</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-ziba-accent transition-colors" data-testid="link-cookies">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-ziba flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-ziba-text-muted text-sm">
              2024 Ziba. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Users className="w-5 h-5 text-ziba-text-muted hover:text-ziba-accent cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
