import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Smartphone, Mail, UserCheck, Key, ChevronDown, ChevronUp, Shield, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

interface StepData {
  id: string;
  icon: typeof Mail;
  title: string;
  subtitle: string;
  description: string;
  why: string;
  next: string;
}

const steps: StepData[] = [
  {
    id: "email",
    icon: Mail,
    title: "Enter Your Email",
    subtitle: "Your gateway to Ziba",
    description: "Start by entering your email address. This will be your primary login credential and how we communicate important updates about your rides.",
    why: "We use your email to send trip receipts, important safety notifications, and promotional offers. Your email is never shared with third parties.",
    next: "After entering your email, you'll receive a verification code to confirm your account."
  },
  {
    id: "verify",
    icon: Key,
    title: "Verify Your Account",
    subtitle: "Quick and secure verification",
    description: "Check your inbox for a 6-digit verification code. Enter it to confirm your email address and secure your account.",
    why: "Verification protects your account from unauthorized access and ensures only you can request rides using your payment methods.",
    next: "Once verified, you'll complete your profile with a few more details."
  },
  {
    id: "profile",
    icon: UserCheck,
    title: "Complete Your Profile",
    subtitle: "Personalize your experience",
    description: "Add your name and phone number to complete your profile. This helps drivers identify you at pickup and provides an additional contact method.",
    why: "Your phone number allows drivers to contact you directly if they can't find you, and enables SMS notifications for ride updates.",
    next: "That's it! You're ready to request your first ride with Ziba."
  }
];

export default function HowSignUp() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
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
              1
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Sign Up</h1>
              <p className="text-muted-foreground">Create your account in seconds</p>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Getting started with Ziba is quick and easy. Click on each step below to learn more about the sign-up process.
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
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.subtitle}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0 border-t border-border">
                        <div className="pt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">What This Step Does</h4>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">Why We Need This</h4>
                                <p className="text-muted-foreground text-sm">{step.why}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-1">What Happens Next</h4>
                              <p className="text-muted-foreground text-sm">{step.next}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              What You Get
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                Instant ride access
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                Secure payment options
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                Trip history & receipts
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                24/7 customer support
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready to get started?</h2>
            <p className="text-muted-foreground mb-4">Join thousands of riders who trust Ziba every day.</p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 cursor-pointer" data-testid="button-signup-cta">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
