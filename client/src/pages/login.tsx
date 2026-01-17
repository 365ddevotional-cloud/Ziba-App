import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, Loader2, Mail, Lock, User, Truck, Briefcase } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Role = "rider" | "driver" | "director";

export default function Login() {
  const { login: loginRider } = useRiderAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeRole, setActiveRole] = useState<Role>("rider");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [riderForm, setRiderForm] = useState({
    email: "",
    password: "",
  });

  const [driverForm, setDriverForm] = useState({
    email: "",
    password: "",
  });

  const [directorForm, setDirectorForm] = useState({
    email: "",
    password: "",
  });

  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginRider(riderForm.email, riderForm.password);
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
      if (process.env.NODE_ENV === "development") {
        console.log("[Login] Redirecting rider to /rider/home");
      }
      navigate("/rider/home");
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/driver/login", {
        email: driverForm.email,
        password: driverForm.password,
      });
      
      const data = await response.json();
      const role = data.user?.role || "driver";
      
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[Login] Redirecting ${role} to /driver`);
      }
      navigate("/driver");
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/director/login", {
        email: directorForm.email,
        password: directorForm.password,
      });
      
      const data = await response.json();
      // Director response has accountRole: "director" or role field
      const role = data.user?.accountRole || data.user?.role || "director";
      
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[Login] Redirecting ${role} to /director`);
      }
      navigate("/director");
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    rider: "Sign in to book rides",
    driver: "Sign in to accept rides",
    director: "Sign in to manage operations",
  };

  return (
    <div className="min-h-screen bg-ziba-dark flex flex-col pt-2">
      <div className="flex-1 flex items-center justify-center p-4 pb-8">
        <Card className="w-full max-w-md bg-ziba-card border-ziba-border ziba-glow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-ziba-accent rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-ziba-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-ziba-text-primary">Welcome Back</CardTitle>
              <CardDescription className="text-ziba-text-secondary">Sign in to your account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRole} onValueChange={(v) => { setActiveRole(v as Role); setError(""); }}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-ziba-dark">
                <TabsTrigger value="rider" data-testid="tab-rider" className="flex items-center gap-1 data-[state=active]:bg-ziba-accent data-[state=active]:text-ziba-primary">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Rider</span>
                </TabsTrigger>
                <TabsTrigger value="driver" data-testid="tab-driver" className="flex items-center gap-1 data-[state=active]:bg-ziba-accent data-[state=active]:text-ziba-primary">
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Driver</span>
                </TabsTrigger>
                <TabsTrigger value="director" data-testid="tab-director" className="flex items-center gap-1 data-[state=active]:bg-ziba-accent data-[state=active]:text-ziba-primary">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Director</span>
                </TabsTrigger>
              </TabsList>

              <p className="text-sm text-center text-ziba-text-secondary mb-4">{roleDescriptions[activeRole]}</p>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                  <p className="text-sm text-destructive" data-testid="text-error">{error}</p>
                </div>
              )}

              <TabsContent value="rider">
                <form onSubmit={handleRiderLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rider-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="rider-email"
                        type="email"
                        placeholder="you@example.com"
                        value={riderForm.email}
                        onChange={(e) => setRiderForm({ ...riderForm, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-rider-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rider-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="rider-password"
                        type="password"
                        placeholder="Enter your password"
                        value={riderForm.password}
                        onChange={(e) => setRiderForm({ ...riderForm, password: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-rider-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-rider-login">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In as Rider"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="driver">
                <form onSubmit={handleDriverLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="driver-email"
                        type="email"
                        placeholder="you@example.com"
                        value={driverForm.email}
                        onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-driver-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="driver-password"
                        type="password"
                        placeholder="Enter your password"
                        value={driverForm.password}
                        onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-driver-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-driver-login">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In as Driver"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="director">
                <form onSubmit={handleDirectorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="director-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="director-email"
                        type="email"
                        placeholder="you@example.com"
                        value={directorForm.email}
                        onChange={(e) => setDirectorForm({ ...directorForm, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-director-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="director-password"
                        type="password"
                        placeholder="Enter your password"
                        value={directorForm.password}
                        onChange={(e) => setDirectorForm({ ...directorForm, password: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-director-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-director-login">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In as Director"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-ziba-text-secondary">
              Don't have an account?{" "}
              <Link href="/signup" className="text-ziba-accent hover:underline" data-testid="link-signup">Sign up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
