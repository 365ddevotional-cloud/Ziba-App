import { Link } from "wouter";
import { ArrowLeft, MapPin, Building, TreePine, Plane, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

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

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              From downtown districts to suburban neighborhoods, Ziba provides comprehensive coverage across the entire metropolitan area. No destination is out of reach.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Downtown Areas</h3>
                <p className="text-muted-foreground text-sm">High driver density in business districts for quick pickups during rush hours.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Suburban Reach</h3>
                <p className="text-muted-foreground text-sm">Extended coverage to residential neighborhoods and outlying communities.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Airport Service</h3>
                <p className="text-muted-foreground text-sm">Reliable airport pickups and drop-offs with dedicated arrival monitoring.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Train className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Transit Hubs</h3>
                <p className="text-muted-foreground text-sm">First and last mile solutions connecting you to train stations and bus terminals.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Coverage Highlights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">Neighborhoods</div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground">Airports</div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">20+</div>
                <div className="text-xs text-muted-foreground">Transit Hubs</div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">100km</div>
                <div className="text-xs text-muted-foreground">Radius</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
