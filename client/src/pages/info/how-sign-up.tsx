import { Link } from "wouter";
import { ArrowLeft, Smartphone, Mail, UserCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function HowSignUp() {
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
              Getting started with Ziba is quick and easy. Create your account with just your email and start riding in less than a minute.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enter Your Email</h3>
                  <p className="text-muted-foreground text-sm">Provide your email address to create your account</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Verify Your Account</h3>
                  <p className="text-muted-foreground text-sm">Quick verification to keep your account secure</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm">Add your name and phone number for a personalized experience</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready to get started?</h2>
            <p className="text-muted-foreground mb-4">Join thousands of riders who trust Ziba every day.</p>
            <Button size="lg" data-testid="button-signup-cta">Create Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
