import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, LogIn, KeyRound, User, UserCog, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/lib/auth";
import { Header } from "@/components/header";

const roleConfig = {
  user: {
    title: "User Login",
    description: "Access your rides and profile",
    icon: User,
    redirect: "/users",
  },
  director: {
    title: "Director Login",
    description: "Access director dashboard and reports",
    icon: UserCog,
    redirect: "/directors",
  },
  admin: {
    title: "Admin Login",
    description: "Full platform access and management",
    icon: Shield,
    redirect: "/admin",
  },
};

interface LoginPageProps {
  role: UserRole;
}

export default function LoginPage({ role }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const { login, setupPassword, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const config = roleConfig[role];
  const Icon = config.icon;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password, role);
      if (result.needsPasswordSetup) {
        setShowPasswordSetup(true);
        toast({
          title: "Password Setup Required",
          description: "Please set up your password to continue.",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setLocation(config.redirect);
      }
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

  async function handlePasswordSetup(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await setupPassword(newPassword);
      toast({
        title: "Password Set Successfully",
        description: "You can now log in with your new password.",
      });
      setLocation(config.redirect);
    } catch (error: any) {
      toast({
        title: "Failed to Set Password",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle data-testid="text-login-title">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {showPasswordSetup ? (
              <form onSubmit={handlePasswordSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-set-password">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  Set Password
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password (leave blank for first login)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    First time? Leave password blank to set up your account.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Log In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function UserLoginPage() {
  return <LoginPage role="user" />;
}

export function DirectorLoginPage() {
  return <LoginPage role="director" />;
}

export function AdminLoginPage() {
  return <LoginPage role="admin" />;
}
