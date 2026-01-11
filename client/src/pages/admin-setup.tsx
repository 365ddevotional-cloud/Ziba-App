import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { adminSetupSchema } from "@shared/schema";

type AdminSetupFormData = z.infer<typeof adminSetupSchema>;

function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strength = metCount === 4 ? "Strong" : metCount >= 2 ? "Medium" : "Weak";
  const strengthColor = metCount === 4 ? "text-green-500" : metCount >= 2 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${
              metCount === 4 ? "bg-green-500 w-full" : metCount >= 2 ? "bg-yellow-500 w-2/3" : "bg-red-500 w-1/3"
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${strengthColor}`}>{strength}</span>
      </div>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminSetup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { adminSetup, checkAdminStatus, admin } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<AdminSetupFormData>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    if (admin) {
      setLocation("/admin/dashboard");
      return;
    }
    
    async function checkStatus() {
      try {
        const status = await checkAdminStatus();
        if (!status.needsSetup) {
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setLocation("/admin/login");
      } finally {
        setIsCheckingStatus(false);
      }
    }
    
    checkStatus();
  }, [admin, checkAdminStatus, setLocation]);

  async function onSubmit(data: AdminSetupFormData) {
    setIsLoading(true);
    try {
      await adminSetup(data.password);
      toast({
        title: "Admin account configured",
        description: "Your password has been set successfully.",
      });
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="text-admin-setup-title">
            Welcome, Administrator
          </CardTitle>
          <CardDescription className="text-center">
            This is a one-time setup. Create a secure password to protect your admin account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 pr-10"
                          data-testid="input-admin-new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-new-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <PasswordStrengthIndicator password={password} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 pr-10"
                          data-testid="input-admin-confirm-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirm-new-password"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
                data-testid="button-submit-admin-setup"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Set Password & Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
