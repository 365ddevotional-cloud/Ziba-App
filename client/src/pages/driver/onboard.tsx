import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, Loader2, User, Phone, Mail, CreditCard, Calendar, FileText } from "lucide-react";

interface DriverProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  profilePhotoUrl?: string;
  driversLicenseNumber: string;
  licenseExpiryDate: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlateNumber: string;
  status: string;
  isApproved: boolean;
}

export default function DriverOnboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    profilePhotoUrl: "",
    driversLicenseNumber: "",
    licenseExpiryDate: "",
    vehicleType: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehiclePlateNumber: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/driver/login");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await apiRequest("GET", "/api/driver/profile");
      const profile: DriverProfile = await res.json();
      setFormData({
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        profilePhotoUrl: profile.profilePhotoUrl || "",
        driversLicenseNumber: profile.driversLicenseNumber,
        licenseExpiryDate: profile.licenseExpiryDate.split("T")[0],
        vehicleType: profile.vehicleType,
        vehicleMake: profile.vehicleMake,
        vehicleModel: profile.vehicleModel,
        vehicleColor: profile.vehicleColor,
        vehiclePlateNumber: profile.vehiclePlateNumber,
      });
    } catch (error: any) {
      // Profile doesn't exist yet, that's okay
      if (user?.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.email || 
        !formData.driversLicenseNumber || !formData.licenseExpiryDate ||
        !formData.vehicleType || !formData.vehicleMake || !formData.vehicleModel ||
        !formData.vehicleColor || !formData.vehiclePlateNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/driver/onboard", {
        ...formData,
        profilePhotoUrl: formData.profilePhotoUrl || undefined,
      });
      const profile: DriverProfile = await res.json();
      
      toast({
        title: "Application submitted!",
        description: "Your driver application has been submitted and is under review.",
      });
      
      navigate("/driver/status");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Could not submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Driver Onboarding</CardTitle>
              <CardDescription>Complete your profile to become a Ziba driver</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="driver@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePhotoUrl">Profile Photo URL (Optional)</Label>
                  <Input
                    id="profilePhotoUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.profilePhotoUrl}
                    onChange={(e) => updateField("profilePhotoUrl", e.target.value)}
                  />
                </div>
              </div>

              {/* License Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Driver's License</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="driversLicenseNumber">License Number *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="driversLicenseNumber"
                      type="text"
                      placeholder="ABC123456789"
                      value={formData.driversLicenseNumber}
                      onChange={(e) => updateField("driversLicenseNumber", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate">License Expiry Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => updateField("licenseExpiryDate", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => updateField("vehicleType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">Bike</SelectItem>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make *</Label>
                    <Input
                      id="vehicleMake"
                      type="text"
                      placeholder="Toyota"
                      value={formData.vehicleMake}
                      onChange={(e) => updateField("vehicleMake", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model *</Label>
                    <Input
                      id="vehicleModel"
                      type="text"
                      placeholder="Camry"
                      value={formData.vehicleModel}
                      onChange={(e) => updateField("vehicleModel", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Color *</Label>
                  <Input
                    id="vehicleColor"
                    type="text"
                    placeholder="Black"
                    value={formData.vehicleColor}
                    onChange={(e) => updateField("vehicleColor", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiclePlateNumber">Plate Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="vehiclePlateNumber"
                      type="text"
                      placeholder="ABC 123 XYZ"
                      value={formData.vehiclePlateNumber}
                      onChange={(e) => updateField("vehiclePlateNumber", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
