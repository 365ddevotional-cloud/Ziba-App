import { Link } from "wouter";
import { ArrowLeft, Briefcase, Code, Headphones, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function CompanyCareers() {
  const openings = [
    { title: "Senior Software Engineer", department: "Engineering", location: "Remote", icon: Code },
    { title: "Customer Success Manager", department: "Support", location: "Lagos", icon: Headphones },
    { title: "Growth Marketing Lead", department: "Marketing", location: "Remote", icon: TrendingUp },
    { title: "Operations Manager", department: "Operations", location: "Lagos", icon: Users },
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
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Careers</h1>
              <p className="text-muted-foreground">Join our growing team</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're building the future of urban mobility and we need talented people to help us get there. Join a team that's passionate about making a difference.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Why Work at Ziba?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Competitive salary and equity packages</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Flexible remote work options</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Health insurance coverage</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Learning and development budget</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Generous paid time off</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <span className="text-muted-foreground">Team building events and retreats</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <Card key={index} className="hover-elevate cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <job.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <p className="text-muted-foreground text-sm">{job.department} - {job.location}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-apply-${index}`}>Apply</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Don't see a role that fits? We're always looking for talented people.</p>
            <Button data-testid="button-general-application">Submit General Application</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
