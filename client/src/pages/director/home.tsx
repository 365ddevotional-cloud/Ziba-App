import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function DirectorHome() {
  return (
    <div className="min-h-screen bg-ziba-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-ziba-card border-ziba-border ziba-glow">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-ziba-accent/20 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-ziba-accent" />
          </div>
          <CardTitle className="text-2xl text-ziba-text-primary">Director Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-ziba-text-secondary">
            Welcome to the Director portal. Dashboard features coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
