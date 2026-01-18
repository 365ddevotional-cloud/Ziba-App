import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, LogIn, Shield, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, "admin");
      toast({
        title: "Login Successful",
        description: "Welcome to the Ziba Admin Dashboard.",
      });
      if (process.env.NODE_ENV === "development") {
        console.log("[Login] Redirecting admin to /admin");
      }
      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ziba-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-ziba-accent/20 flex items-center justify-center">
              <Car className="h-6 w-6 text-ziba-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-ziba-text-primary">Ziba</h1>
          <p className="text-ziba-text-secondary mt-1">Admin Portal</p>
        </div>

        <Card className="border-ziba-border bg-ziba-card ziba-glow">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-ziba-accent/10 flex items-center justify-center mb-3">
              <Shield className="h-7 w-7 text-ziba-accent" />
            </div>
            <CardTitle className="text-ziba-text-primary" data-testid="text-admin-login-title">
              Admin Login
            </CardTitle>
            <CardDescription className="text-ziba-text-secondary">
              Access the platform management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-ziba-text-primary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founder@ziba.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-ziba-dark border-ziba-border text-ziba-text-primary placeholder:text-ziba-text-secondary focus:border-ziba-accent"
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-ziba-text-primary">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-ziba-dark border-ziba-border text-ziba-text-primary placeholder:text-ziba-text-secondary focus:border-ziba-accent"
                  style={{
                    color: "#F9FAFB", // --ziba-text-primary - explicit text color for password dots
                    caretColor: "#14B8A6", // --ziba-accent - explicit caret/cursor color
                    WebkitTextFillColor: "#F9FAFB", // Safari/Chrome password field fix - ensures dots are visible
                  }}
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 ziba-btn-primary" 
                disabled={isLoading} 
                data-testid="button-admin-login"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-ziba-text-secondary text-sm mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
