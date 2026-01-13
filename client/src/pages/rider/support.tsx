import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  FileQuestion,
  AlertTriangle,
  Shield,
  CreditCard,
  Wallet,
  History,
  HeadphonesIcon,
  ExternalLink,
} from "lucide-react";

const faqItems = [
  {
    icon: CreditCard,
    title: "Payment Issues",
    description: "Problems with payment, refunds, or charges",
  },
  {
    icon: Car,
    title: "Ride Issues",
    description: "Report a problem with a recent ride",
  },
  {
    icon: AlertTriangle,
    title: "Safety Concerns",
    description: "Report safety incidents or concerns",
  },
  {
    icon: Shield,
    title: "Account Security",
    description: "Help with account access or security",
  },
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Talk to a support agent",
    action: "Call Now",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    action: "Send Email",
  },
];

export default function RiderSupport() {
  const { toast } = useToast();

  const handleContactAction = (title: string) => {
    toast({
      title: "Coming soon",
      description: `${title} feature is under development`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link href="/rider">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Help & Support</h1>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-20">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How can we help?</h2>
          <div className="grid gap-3">
            {faqItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleContactAction(item.title)}
                  data-testid={`card-faq-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
          <div className="grid gap-3">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.title}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleContactAction(option.title)}
                  data-testid={`card-contact-${option.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.title}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-${option.title.toLowerCase().replace(/\s/g, "-")}`}>
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Resources</h2>
          <div className="space-y-2">
            <Link href="/support/help-center">
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileQuestion className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Help Center</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/support/safety">
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Safety Center</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/legal/terms">
              <Card className="hover-elevate cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileQuestion className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Terms of Service</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
        <div className="flex items-center justify-around p-2">
          <Link href="/rider">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-home">
              <Car className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/rider/history">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-history">
              <History className="w-5 h-5 mb-1" />
              <span className="text-xs">Rides</span>
            </Button>
          </Link>
          <Link href="/rider/wallet">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-wallet">
              <Wallet className="w-5 h-5 mb-1" />
              <span className="text-xs">Wallet</span>
            </Button>
          </Link>
          <Link href="/rider/support">
            <Button variant="ghost" className="flex-col h-auto py-2 px-4" data-testid="nav-support">
              <HeadphonesIcon className="w-5 h-5 mb-1 text-primary" />
              <span className="text-xs text-primary">Support</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
