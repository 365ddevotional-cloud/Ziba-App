import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function LegalTerms() {
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              Draft for testing - This document is a placeholder and will be replaced with legally reviewed terms before production launch.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <p className="text-muted-foreground text-sm">
              Please read these Terms of Service carefully before using the Ziba platform. By accessing or using our services, you agree to be bound by these terms.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Ziba platform, mobile applications, and services (collectively, the "Services"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ziba provides a technology platform that connects riders with independent driver-partners who provide transportation services. Ziba does not provide transportation services directly and is not a transportation carrier.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To use certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree not to use the Services in any way that violates any applicable laws or regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to pay all fees associated with the Services as described at the time of booking. Fees may include base fares, distance charges, time charges, and any applicable taxes or surcharges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Cancellation Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel a ride request at any time before the driver arrives. Cancellation fees may apply if you cancel after a certain period or if the driver has already begun traveling to your pickup location.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Ziba shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at legal@ziba.app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
