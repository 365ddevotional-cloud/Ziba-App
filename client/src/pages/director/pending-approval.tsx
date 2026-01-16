import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, UserCheck, Briefcase, ArrowLeft } from "lucide-react";

export default function DirectorPendingApproval() {
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
              <CardDescription className="text-ziba-text-secondary">Your director account is pending admin approval</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-ziba-dark rounded-lg p-4 space-y-4 border border-ziba-border">
              <h3 className="font-medium text-sm text-ziba-text-primary">Approval Process</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Briefcase className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Application Review</p>
                    <p className="text-xs text-ziba-text-secondary">Our admin team will review your application</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCheck className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Credentials Verification</p>
                    <p className="text-xs text-ziba-text-secondary">Your qualifications will be verified</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-ziba-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-ziba-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ziba-text-primary">Account Activation</p>
                    <p className="text-xs text-ziba-text-secondary">Access to director dashboard and tools</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-ziba-accent/10 border border-ziba-accent/20 rounded-lg p-4">
              <p className="text-sm text-center text-ziba-text-primary">
                Director accounts have elevated privileges and require manual approval by a platform administrator.
              </p>
            </div>

            <div className="text-center text-sm text-ziba-text-secondary">
              <p>We'll notify you via email once your account is approved.</p>
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
