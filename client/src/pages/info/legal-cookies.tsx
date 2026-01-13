import { Link } from "wouter";
import { ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function LegalCookies() {
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
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Cookie Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              Draft for testing - This document is a placeholder and will be replaced with a legally reviewed cookie policy before production launch.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
            <p className="text-muted-foreground text-sm">
              This Cookie Policy explains how Ziba uses cookies and similar technologies to recognize you when you visit our platform.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground text-sm">Required for the operation of our platform. They enable basic functions like page navigation and access to secure areas.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Performance Cookies</h3>
                    <p className="text-muted-foreground text-sm">Help us understand how visitors interact with our platform by collecting and reporting information anonymously.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Functional Cookies</h3>
                    <p className="text-muted-foreground text-sm">Enable enhanced functionality and personalization, such as remembering your preferences and settings.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">Targeting Cookies</h3>
                    <p className="text-muted-foreground text-sm">Used to deliver advertisements more relevant to you and your interests. They also help limit the number of times you see an ad.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">How Long Do Cookies Last?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device until they expire or you delete them. Our cookies have varying lifespans depending on their purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Block all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Delete cookies when you close your browser</li>
                <li>Browse in "private" or "incognito" mode</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that blocking cookies may impact your experience on our platform and limit certain functionalities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party services that place cookies on your device, including analytics providers and advertising partners. These third parties have their own privacy policies governing the use of their cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies, please contact us at privacy@ziba.app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
