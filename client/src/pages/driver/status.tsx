import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";

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
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isApproved: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  driver?: {
    id: string;
    status: string;
    isOnline: boolean;
    averageRating: number;
    totalRatings: number;
  };
}

export default function DriverStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DriverProfile | null>(null);

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
      const data: DriverProfile = await res.json();
      setProfile(data);
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        // Profile doesn't exist, redirect to onboard
        navigate("/driver/onboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (profile?.status) {
      case "APPROVED":
        return {
          icon: CheckCircle2,
          iconColor: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950",
          title: "Application Approved!",
          description: "Your driver application has been approved. You can now start accepting rides.",
          buttonText: "Go to Driver Dashboard",
          buttonAction: () => navigate("/driver/home"),
        };
      case "REJECTED":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950",
          title: "Application Rejected",
          description: profile.rejectionReason || "Your application was rejected. Please review and resubmit.",
          buttonText: "Update Application",
          buttonAction: () => navigate("/driver/onboard"),
        };
      case "SUSPENDED":
        return {
          icon: AlertCircle,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          title: "Account Suspended",
          description: "Your driver account has been suspended. Please contact support.",
          buttonText: "Contact Support",
          buttonAction: () => navigate("/rider/support"),
        };
      default:
        return {
          icon: Clock,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          title: "Application Under Review",
          description: "Your driver application is being reviewed. We'll notify you once a decision is made.",
          buttonText: "Update Application",
          buttonAction: () => navigate("/driver/onboard"),
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto w-20 h-20 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}>
              <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-2xl">{statusConfig.title}</CardTitle>
              <CardDescription className="mt-2">{statusConfig.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={statusConfig.buttonAction} className="w-full" size="lg">
              {statusConfig.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Your submitted driver information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-medium">{profile.driversLicenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License Expiry</p>
                <p className="font-medium">
                  {new Date(profile.licenseExpiryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-medium">{profile.vehicleType}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Vehicle Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-medium">{profile.vehicleMake} {profile.vehicleModel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{profile.vehicleColor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plate Number</p>
                  <p className="font-medium">{profile.vehiclePlateNumber}</p>
                </div>
              </div>
            </div>

            {profile.status === "APPROVED" && profile.driver && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Driver Stats</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-medium">
                      {profile.driver.averageRating.toFixed(1)} ({profile.driver.totalRatings} reviews)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {profile.driver.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {profile.rejectionReason && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Rejection Reason</p>
                <p className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md">
                  {profile.rejectionReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">
                  {new Date(profile.createdAt).toLocaleString()}
                </span>
              </div>
              {profile.updatedAt !== profile.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {new Date(profile.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
