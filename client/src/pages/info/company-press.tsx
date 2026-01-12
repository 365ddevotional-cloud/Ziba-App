import { Link } from "wouter";
import { ArrowLeft, Newspaper, Download, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function CompanyPress() {
  const pressReleases = [
    { title: "Ziba Launches New City-Wide Coverage Initiative", date: "December 2024" },
    { title: "Ziba Raises Series A Funding to Expand Operations", date: "October 2024" },
    { title: "Ziba Partners with Local Transit Authorities", date: "August 2024" },
    { title: "Ziba Introduces Enhanced Safety Features", date: "June 2024" },
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
              <Newspaper className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Press</h1>
              <p className="text-muted-foreground">News and media resources</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stay updated with the latest news from Ziba. For media inquiries, please contact our press team.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Press Kit</h3>
                <p className="text-muted-foreground text-sm">Download our press kit including logos, brand guidelines, and company information.</p>
                <Button variant="outline" size="sm" data-testid="button-download-press-kit">Download Kit</Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Media Contact</h3>
                <p className="text-muted-foreground text-sm">For press inquiries, interviews, and media partnerships.</p>
                <Button variant="outline" size="sm" data-testid="button-contact-press">press@ziba.app</Button>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Press Releases</h2>
          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover-elevate cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{release.title}</h3>
                      <p className="text-muted-foreground text-sm">{release.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-read-${index}`}>Read More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
