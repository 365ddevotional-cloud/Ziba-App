import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRiderAuth } from "@/lib/rider-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RiderBottomNav } from "@/components/rider-bottom-nav";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  LogOut,
  Loader2,
  Star,
  Edit2,
  Save,
  X,
} from "lucide-react";

export default function RiderProfile() {
  const { user, logout, updateProfile } = useRiderAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    city: user?.city || "",
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      navigate("/rider/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      city: user?.city || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/rider/home">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Profile</h1>
        </div>
        {!isEditing ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            data-testid="button-edit"
          >
            <Edit2 className="w-5 h-5" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelEdit}
              data-testid="button-cancel-edit"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={handleSave}
              disabled={isSaving}
              data-testid="button-save"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 space-y-4 pb-20">
        <div className="text-center py-4">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          {!isEditing ? (
            <>
              <h2 className="text-xl font-semibold text-foreground">{user?.fullName}</h2>
              {user?.averageRating && user.averageRating > 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-muted-foreground">
                    {user.averageRating.toFixed(1)} rating
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-xs mx-auto">
              <Label htmlFor="fullName" className="sr-only">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Full Name"
                className="text-center"
                data-testid="input-fullname"
              />
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                {!isEditing ? (
                  <p className="text-sm font-medium text-foreground">
                    {user?.phone || "Not set"}
                  </p>
                ) : (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="mt-1"
                    data-testid="input-phone"
                  />
                )}
              </div>
            </div>
            
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">City</p>
                {!isEditing ? (
                  <p className="text-sm font-medium text-foreground">
                    {user?.city || "Not set"}
                  </p>
                ) : (
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="mt-1"
                    data-testid="input-city"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.isTestAccount && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
              Test Account
            </p>
          </div>
        )}

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </>
          )}
        </Button>
      </main>

      <RiderBottomNav activeTab="profile" />
    </div>
  );
}
