import { Link } from "wouter";
import { ArrowLeft, Shield, AlertTriangle, Phone, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function SupportSafety() {
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Safety</h1>
              <p className="text-muted-foreground">Your safety is our priority</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've built comprehensive safety features into every aspect of the Ziba experience. Learn about our safety measures and how to stay safe while using our platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground">Emergency Button</h3>
                <p className="text-muted-foreground text-sm">In-app emergency button connects you directly to local emergency services with your location.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Share Your Trip</h3>
                <p className="text-muted-foreground text-sm">Share your trip details in real-time with friends and family so they can track your journey.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">24/7 Support</h3>
                <p className="text-muted-foreground text-sm">Our safety team is available around the clock to assist with any concerns or incidents.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Verified Drivers</h3>
                <p className="text-muted-foreground text-sm">All drivers undergo background checks and vehicle inspections before joining our platform.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Safety Tips for Riders</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Verify your driver and vehicle details before getting in</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Share your trip with a trusted contact</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Sit in the back seat when riding alone</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Trust your instincts - if something feels wrong, don't get in</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Report any concerns through the app immediately</span>
              </li>
            </ul>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">In Case of Emergency</h2>
            <p className="text-muted-foreground mb-4">If you're in immediate danger, please call local emergency services.</p>
            <Button variant="destructive" data-testid="button-emergency">Emergency: 911</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
