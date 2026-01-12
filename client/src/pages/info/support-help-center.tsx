import { Link } from "wouter";
import { ArrowLeft, HelpCircle, CreditCard, MapPin, User, Car, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function SupportHelpCenter() {
  const topics = [
    { title: "Account & Profile", description: "Manage your account settings and personal information", icon: User },
    { title: "Payments & Pricing", description: "Questions about fares, payment methods, and receipts", icon: CreditCard },
    { title: "Rides & Trips", description: "Help with requesting rides and trip issues", icon: MapPin },
    { title: "Driver Questions", description: "Information for drivers using the Ziba platform", icon: Car },
  ];

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
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Help Center</h1>
              <p className="text-muted-foreground">Find answers to your questions</p>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">How can we help you?</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search for help articles..."
                className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-search-help"
              />
              <Button data-testid="button-search">Search</Button>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">Popular Topics</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {topics.map((topic, index) => (
              <Card key={index} className="hover-elevate cursor-pointer">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <topic.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm">{topic.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">How do I request a ride?</h3>
                <p className="text-muted-foreground text-sm">Open the Ziba app, enter your destination, and tap "Request Ride". We'll match you with a nearby driver.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">What payment methods are accepted?</h3>
                <p className="text-muted-foreground text-sm">We accept credit/debit cards, Ziba Wallet balance, and various local payment options depending on your region.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">How do I contact my driver?</h3>
                <p className="text-muted-foreground text-sm">Once matched with a driver, you can call or message them directly through the app.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-4">Our support team is available 24/7 to assist you.</p>
            <Button data-testid="button-contact-support">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
