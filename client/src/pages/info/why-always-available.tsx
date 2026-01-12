import { Link } from "wouter";
import { ArrowLeft, Clock, Sun, Moon, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

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

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether it's early morning or late at night, Ziba is always ready to get you where you need to go. Our extensive network of drivers ensures minimal wait times around the clock.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Daytime Rides</h3>
                <p className="text-muted-foreground text-sm">Peak hour coverage with thousands of active drivers ready to pick you up within minutes.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Night Service</h3>
                <p className="text-muted-foreground text-sm">Late-night availability for those returning from events, work, or simply enjoying the nightlife.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Quick Response</h3>
                <p className="text-muted-foreground text-sm">Average pickup time of just 3 minutes in most areas, getting you moving faster.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Holiday Coverage</h3>
                <p className="text-muted-foreground text-sm">We never take a day off. Service available on all holidays and special occasions.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Availability Stats</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Service Hours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">3 min</div>
                <div className="text-sm text-muted-foreground">Avg. Wait Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
