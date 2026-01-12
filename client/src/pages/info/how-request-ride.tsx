import { Link } from "wouter";
import { ArrowLeft, MapPin, Navigation, Car, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function HowRequestRide() {
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
              2
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Request a Ride</h1>
              <p className="text-muted-foreground">Enter your destination and get matched</p>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Enter your destination and we'll match you with a nearby driver. See your fare estimate upfront before confirming.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Set Your Location</h3>
                  <p className="text-muted-foreground text-sm">We detect your location automatically or you can enter it manually</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enter Destination</h3>
                  <p className="text-muted-foreground text-sm">Type your destination and select from suggestions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Choose Your Ride</h3>
                  <p className="text-muted-foreground text-sm">Select from available ride options based on your needs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Track Your Driver</h3>
                  <p className="text-muted-foreground text-sm">Watch your driver approach in real-time on the map</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Fare Transparency</h2>
            <p className="text-muted-foreground text-center">See your estimated fare before you book. No hidden charges, no surprises.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
