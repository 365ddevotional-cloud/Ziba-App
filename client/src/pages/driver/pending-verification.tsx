import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Car, Shield, FileText, ArrowLeft } from "lucide-react";

export default function DriverPendingVerification() {
  return (
    <div className="min-h-screen bg-ziba-dark flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-ziba-card border-ziba-border ziba-glow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-ziba-accent/20 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-ziba-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl text-ziba-text-primary">Application Submitted</CardTitle>
              <CardDescription className="text-ziba-text-secondary">Your driver account is pending verification</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-ziba-dark rounded-lg p-4 space-y-4 border border-ziba-border">
              <h3 className="font-medium text-sm text-ziba-text-primary">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Document Review</p>
                    <p className="text-xs text-ziba-text-secondary">Our team will verify your information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Background Check</p>
                    <p className="text-xs text-ziba-text-secondary">Standard safety verification process</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Car className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Vehicle Inspection</p>
                    <p className="text-xs text-ziba-text-secondary">Ensure your vehicle meets our standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Account Activation</p>
                    <p className="text-xs text-ziba-text-secondary">Start accepting rides and earning</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-ziba-text-secondary">
              <p>This process typically takes 1-3 business days.</p>
              <p className="mt-1">We'll notify you via email once verified.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/support/contact">
                <Button variant="outline" className="w-full ziba-btn-secondary" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full text-ziba-text-secondary hover:text-ziba-accent" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
