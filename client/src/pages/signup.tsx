import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, Loader2, Mail, Lock, User, Phone, MapPin, Truck, Briefcase, Hash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Role = "rider" | "driver" | "director";

export default function Signup() {
  const { register: registerRider } = useRiderAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeRole, setActiveRole] = useState<Role>("rider");
  const [isLoading, setIsLoading] = useState(false);

  const [riderForm, setRiderForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  });

  const [driverForm, setDriverForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleType: "",
    vehiclePlate: "",
  });

  const [directorForm, setDirectorForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
    region: "",
  });

  const handleRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (riderForm.password !== riderForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (riderForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await registerRider({
        fullName: riderForm.fullName,
        email: riderForm.email,
        password: riderForm.password,
        phone: riderForm.phone || undefined,
        city: riderForm.city || undefined,
      });
      toast({ title: "Welcome to Ziba!", description: "Your account has been created" });
      navigate("/rider/home");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Could not create account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (driverForm.password !== driverForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (driverForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (!driverForm.vehicleType) {
      toast({ title: "Please select a vehicle type", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/driver/register", {
        fullName: driverForm.fullName,
        email: driverForm.email,
        password: driverForm.password,
        phone: driverForm.phone,
        vehicleType: driverForm.vehicleType,
        vehiclePlate: driverForm.vehiclePlate,
      });
      toast({ title: "Application submitted!", description: "Your driver account is pending verification" });
      navigate("/driver/pending-verification");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Could not create account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (directorForm.password !== directorForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (directorForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/director/register", {
        fullName: directorForm.fullName,
        email: directorForm.email,
        password: directorForm.password,
        phone: directorForm.phone || undefined,
        role: directorForm.role || "OPERATIONS",
        region: directorForm.region || "Default",
      });
      toast({ title: "Application submitted!", description: "Your director account is pending admin approval" });
      navigate("/director/pending-approval");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Could not create account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    rider: "Book rides and travel with ease",
    driver: "Earn money by driving with Ziba",
    director: "Manage operations and teams",
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
              <CardTitle className="text-2xl text-ziba-text-primary">Join Ziba</CardTitle>
              <CardDescription className="text-ziba-text-secondary">Choose your role to get started</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as Role)}>
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

              <TabsContent value="rider">
                <form onSubmit={handleRiderSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rider-fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="rider-fullName" placeholder="John Doe" value={riderForm.fullName} onChange={(e) => setRiderForm({...riderForm, fullName: e.target.value})} className="pl-10" required data-testid="input-rider-fullname" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rider-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="rider-email" type="email" placeholder="you@example.com" value={riderForm.email} onChange={(e) => setRiderForm({...riderForm, email: e.target.value})} className="pl-10" required data-testid="input-rider-email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rider-phone">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="rider-phone" type="tel" placeholder="+234..." value={riderForm.phone} onChange={(e) => setRiderForm({...riderForm, phone: e.target.value})} className="pl-10" data-testid="input-rider-phone" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rider-city">City (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="rider-city" placeholder="Lagos" value={riderForm.city} onChange={(e) => setRiderForm({...riderForm, city: e.target.value})} className="pl-10" data-testid="input-rider-city" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rider-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="rider-password" type="password" placeholder="At least 6 characters" value={riderForm.password} onChange={(e) => setRiderForm({...riderForm, password: e.target.value})} className="pl-10" required data-testid="input-rider-password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rider-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="rider-confirmPassword" type="password" placeholder="Confirm your password" value={riderForm.confirmPassword} onChange={(e) => setRiderForm({...riderForm, confirmPassword: e.target.value})} className="pl-10" required data-testid="input-rider-confirm-password" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-rider-register">
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Rider Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="driver">
                <form onSubmit={handleDriverSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver-fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="driver-fullName" placeholder="John Doe" value={driverForm.fullName} onChange={(e) => setDriverForm({...driverForm, fullName: e.target.value})} className="pl-10" required data-testid="input-driver-fullname" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="driver-email" type="email" placeholder="you@example.com" value={driverForm.email} onChange={(e) => setDriverForm({...driverForm, email: e.target.value})} className="pl-10" required data-testid="input-driver-email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="driver-phone" type="tel" placeholder="+234..." value={driverForm.phone} onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})} className="pl-10" required data-testid="input-driver-phone" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver-vehicleType">Vehicle Type</Label>
                      <Select value={driverForm.vehicleType} onValueChange={(v) => setDriverForm({...driverForm, vehicleType: v})}>
                        <SelectTrigger id="driver-vehicleType" data-testid="select-driver-vehicle-type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAR">Car</SelectItem>
                          <SelectItem value="BIKE">Bike</SelectItem>
                          <SelectItem value="VAN">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-vehiclePlate">Vehicle Plate</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="driver-vehiclePlate" placeholder="LAG-123-AB" value={driverForm.vehiclePlate} onChange={(e) => setDriverForm({...driverForm, vehiclePlate: e.target.value})} className="pl-10" required data-testid="input-driver-plate" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="driver-password" type="password" placeholder="At least 6 characters" value={driverForm.password} onChange={(e) => setDriverForm({...driverForm, password: e.target.value})} className="pl-10" required data-testid="input-driver-password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="driver-confirmPassword" type="password" placeholder="Confirm your password" value={driverForm.confirmPassword} onChange={(e) => setDriverForm({...driverForm, confirmPassword: e.target.value})} className="pl-10" required data-testid="input-driver-confirm-password" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-driver-register">
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting application...</> : "Apply as Driver"}
                  </Button>
                  <p className="text-xs text-center text-ziba-text-secondary">Driver accounts require verification before activation</p>
                </form>
              </TabsContent>

              <TabsContent value="director">
                <form onSubmit={handleDirectorSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="director-fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="director-fullName" placeholder="John Doe" value={directorForm.fullName} onChange={(e) => setDirectorForm({...directorForm, fullName: e.target.value})} className="pl-10" required data-testid="input-director-fullname" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="director-email" type="email" placeholder="you@example.com" value={directorForm.email} onChange={(e) => setDirectorForm({...directorForm, email: e.target.value})} className="pl-10" required data-testid="input-director-email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director-phone">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="director-phone" type="tel" placeholder="+234..." value={directorForm.phone} onChange={(e) => setDirectorForm({...directorForm, phone: e.target.value})} className="pl-10" data-testid="input-director-phone" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="director-role">Role</Label>
                      <Select value={directorForm.role} onValueChange={(v) => setDirectorForm({...directorForm, role: v})}>
                        <SelectTrigger id="director-role" data-testid="select-director-role">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPERATIONS">Operations</SelectItem>
                          <SelectItem value="REGIONAL">Regional</SelectItem>
                          <SelectItem value="FINANCE">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="director-region">Region</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="director-region" placeholder="Lagos" value={directorForm.region} onChange={(e) => setDirectorForm({...directorForm, region: e.target.value})} className="pl-10" data-testid="input-director-region" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="director-password" type="password" placeholder="At least 6 characters" value={directorForm.password} onChange={(e) => setDirectorForm({...directorForm, password: e.target.value})} className="pl-10" required data-testid="input-director-password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="director-confirmPassword" type="password" placeholder="Confirm your password" value={directorForm.confirmPassword} onChange={(e) => setDirectorForm({...directorForm, confirmPassword: e.target.value})} className="pl-10" required data-testid="input-director-confirm-password" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full ziba-btn-primary" disabled={isLoading} data-testid="button-director-register">
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting application...</> : "Apply as Director"}
                  </Button>
                  <p className="text-xs text-center text-ziba-text-secondary">Director accounts require admin approval before activation</p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-ziba-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-ziba-accent hover:underline" data-testid="link-login">Sign in</Link>
            </div>
            <p className="mt-4 text-xs text-center text-ziba-text-secondary">
              By signing up, you agree to our{" "}
              <Link href="/legal/terms" className="underline text-ziba-accent">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/legal/privacy" className="underline text-ziba-accent">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
