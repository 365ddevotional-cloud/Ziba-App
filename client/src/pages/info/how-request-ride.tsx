import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Navigation, Car, Clock, ChevronDown, ChevronUp, DollarSign, Users, Zap, ArrowRight, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Progress } from "@/components/ui/progress";

interface StepData {
  id: string;
  icon: typeof MapPin;
  title: string;
  subtitle: string;
  description: string;
  demo?: boolean;
}

const steps: StepData[] = [
  {
    id: "location",
    icon: Navigation,
    title: "Set Your Location",
    subtitle: "We find you automatically",
    description: "Ziba uses your device's GPS to detect your current location. You can also enter or adjust your pickup point manually for precision."
  },
  {
    id: "destination",
    icon: MapPin,
    title: "Enter Destination",
    subtitle: "Where are you going?",
    description: "Type your destination and select from smart suggestions. We'll calculate the optimal route and show you the estimated fare upfront.",
    demo: true
  },
  {
    id: "ride-type",
    icon: Car,
    title: "Choose Your Ride",
    subtitle: "Options for every need",
    description: "Select from available ride types based on your preferences - economy for everyday rides, comfort for extra space, or premium for a luxury experience."
  },
  {
    id: "match",
    icon: Users,
    title: "Get Matched",
    subtitle: "Your driver is on the way",
    description: "We instantly match you with the nearest available driver. See their name, photo, rating, and vehicle details before they arrive."
  },
  {
    id: "eta",
    icon: Clock,
    title: "Track in Real-Time",
    subtitle: "Watch your driver approach",
    description: "Follow your driver's progress on the live map. Get accurate ETA updates and be notified when they're arriving."
  }
];

const rideTypes = [
  { name: "Economy", price: "Lowest fare", time: "3 min", icon: Car },
  { name: "Comfort", price: "+20%", time: "5 min", icon: Users },
  { name: "Premium", price: "+50%", time: "8 min", icon: Zap }
];

export default function HowRequestRide() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [demoDestination, setDemoDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
    if (id === "destination") {
      setDemoProgress(0);
    }
  };

  const simulateSearch = () => {
    if (demoDestination.length > 0) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setDemoProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

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
              Click on each step below to see how requesting a ride works. Try the interactive demo!
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isExpanded = expandedStep === step.id;
              
              return (
                <Card 
                  key={step.id} 
                  className={`hover-elevate cursor-pointer transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => toggleStep(step.id)}
                  data-testid={`card-step-${step.id}`}
                >
                  <CardContent className="p-0">
                    <div className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {step.title}
                          {step.demo && (
                            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Interactive</span>
                          )}
                        </h3>
                        <p className="text-muted-foreground text-sm">{step.subtitle}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-4 space-y-4">
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                          
                          {step.id === "destination" && (
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                              <h4 className="text-sm font-semibold text-foreground">Try It: Enter a Destination</h4>
                              <div className="flex gap-2">
                                <div className="flex-1 relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <input
                                    type="text"
                                    placeholder="e.g., Victoria Island, Lagos"
                                    value={demoDestination}
                                    onChange={(e) => setDemoDestination(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    data-testid="input-demo-destination"
                                  />
                                </div>
                                <Button size="sm" onClick={simulateSearch} data-testid="button-demo-search">
                                  Search
                                </Button>
                              </div>
                              {demoProgress > 0 && (
                                <div className="space-y-2">
                                  <Progress value={demoProgress} className="h-2" />
                                  {demoProgress >= 100 && (
                                    <div className="text-sm text-green-500 flex items-center gap-2">
                                      <Check className="w-4 h-4" />
                                      Found! Estimated fare: $12.50
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.id === "ride-type" && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground">Select a Ride Type</h4>
                              <div className="grid gap-2">
                                {rideTypes.map((ride) => {
                                  const RideIcon = ride.icon;
                                  const isSelected = selectedRide === ride.name;
                                  return (
                                    <div
                                      key={ride.name}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                                        isSelected
                                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                      }`}
                                      onClick={() => setSelectedRide(ride.name)}
                                      data-testid={`card-ride-${ride.name.toLowerCase()}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          {isSelected ? (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                              <Check className="w-3 h-3 text-primary-foreground" />
                                            </div>
                                          ) : (
                                            <RideIcon className="w-5 h-5 text-primary" />
                                          )}
                                          <span className="font-medium text-foreground">{ride.name}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium text-foreground">{ride.price}</div>
                                          <div className="text-xs text-muted-foreground">{ride.time} away</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {selectedRide && (
                                <div className="text-sm text-green-500 flex items-center gap-2">
                                  <Check className="w-4 h-4" />
                                  {selectedRide} selected - Ready to confirm!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Fare Transparency
            </h2>
            <p className="text-muted-foreground mb-4">
              See your estimated fare before you book. No hidden charges, no surprises. The price you see is the price you pay.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="font-semibold text-foreground">Base Fare</div>
                <div className="text-muted-foreground">Starting price</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="font-semibold text-foreground">Per KM</div>
                <div className="text-muted-foreground">Distance rate</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="font-semibold text-foreground">Per Minute</div>
                <div className="text-muted-foreground">Time rate</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready to ride?</h2>
            <p className="text-muted-foreground mb-4">Download the app and request your first ride.</p>
            <Button size="lg" className="gap-2" data-testid="button-request-cta">
              Request a Ride
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
