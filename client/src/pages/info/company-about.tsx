import { Link } from "wouter";
import { ArrowLeft, Building, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function CompanyAbout() {
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
              <Building className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">About Us</h1>
              <p className="text-muted-foreground">Learn more about Ziba</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ziba was founded with a simple mission: to make urban transportation accessible, affordable, and reliable for everyone. We believe that getting around your city should be as easy as tapping a button.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Our Mission</h3>
                <p className="text-muted-foreground text-sm">To revolutionize urban mobility by providing safe, reliable, and affordable transportation solutions that connect people with their destinations.</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Our Values</h3>
                <p className="text-muted-foreground text-sm">Safety first, customer focus, innovation, integrity, and community impact drive everything we do.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Founded in 2024, Ziba started as a small team with a big vision. We saw the challenges people faced with urban transportation and knew we could build something better.</p>
              <p>Today, we've grown to serve thousands of riders and drivers across multiple cities, but our commitment to quality and safety remains unchanged.</p>
              <p>Every ride on Ziba represents our promise to provide a seamless, safe, and enjoyable experience for both riders and drivers.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-card border border-card-border rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Riders</div>
            </div>
            <div className="p-6 bg-card border border-card-border rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Active Drivers</div>
            </div>
            <div className="p-6 bg-card border border-card-border rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
