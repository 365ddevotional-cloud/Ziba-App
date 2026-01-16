import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Car, CheckCircle, XCircle, Clock, AlertCircle, User, Phone, Mail, CreditCard, Calendar, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { AdminGuard } from "@/components/admin-guard";

interface DriverProfile {
  id: string;
  userId: string;
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
  isApproved: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
  driver?: {
    id: string;
    status: string;
    isOnline: boolean;
    averageRating: number;
    totalRatings: number;
  };
}

const statusConfig = {
  PENDING: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
  APPROVED: { color: "bg-green-500", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "bg-red-500", icon: XCircle, label: "Rejected" },
  SUSPENDED: { color: "bg-orange-500", icon: AlertCircle, label: "Suspended" },
};

async function adminApiRequest(method: string, url: string, data?: unknown) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Preview-Admin": "true",
    },
    body: data ? JSON.stringify({ ...data as object, previewAdmin: true }) : JSON.stringify({ previewAdmin: true }),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export default function AdminDriverOnboardingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<DriverProfile | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: profiles, isLoading } = useQuery<DriverProfile[]>({
    queryKey: ["/api/admin/drivers", statusFilter],
    queryFn: async () => {
      const url = statusFilter 
        ? `/api/admin/drivers?status=${statusFilter}`
        : "/api/admin/drivers";
      return adminApiRequest("GET", url);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiRequest("POST", `/api/admin/driver/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drivers"] });
      toast({
        title: "Driver approved",
        description: "Driver profile has been approved successfully.",
      });
      setSelectedProfile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve driver.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return adminApiRequest("POST", `/api/admin/driver/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drivers"] });
      toast({
        title: "Driver rejected",
        description: "Driver profile has been rejected.",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProfile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject driver.",
        variant: "destructive",
      });
    },
  });

  const filteredProfiles = profiles?.filter((profile) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.fullName.toLowerCase().includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower) ||
      profile.phone.toLowerCase().includes(searchLower) ||
      profile.driversLicenseNumber.toLowerCase().includes(searchLower) ||
      profile.vehiclePlateNumber.toLowerCase().includes(searchLower)
    );
  });

  const handleReject = (profile: DriverProfile) => {
    setSelectedProfile(profile);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedProfile || !rejectionReason.trim()) {
      toast({
        title: "Missing reason",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id: selectedProfile.id, reason: rejectionReason });
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">Driver Onboarding Review</h1>
              <p className="text-muted-foreground mt-2">
                Review and approve driver applications
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Driver Profiles ({filteredProfiles?.length || 0})</CardTitle>
              <CardDescription>Review driver applications and manage approvals</CardDescription>
            </CardHeader>
            <CardContent>
              {!filteredProfiles || filteredProfiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No driver profiles found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => {
                        const StatusIcon = statusConfig[profile.status].icon;
                        return (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <div className="font-medium">{profile.fullName}</div>
                              <div className="text-sm text-muted-foreground">{profile.email}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{profile.phone}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-mono">{profile.driversLicenseNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                Exp: {new Date(profile.licenseExpiryDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {profile.vehicleType} - {profile.vehicleMake} {profile.vehicleModel}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {profile.vehicleColor} • {profile.vehiclePlateNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${statusConfig[profile.status].color} text-white`}
                                variant="default"
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[profile.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(profile.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {profile.status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        setSelectedProfile(profile);
                                        approveMutation.mutate(profile.id);
                                      }}
                                      disabled={approveMutation.isPending}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(profile)}
                                      disabled={rejectMutation.isPending}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedProfile(profile)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Detail Dialog */}
      {selectedProfile && (
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Driver Profile Details</DialogTitle>
              <DialogDescription>
                Full information for {selectedProfile.fullName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedProfile.fullName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedProfile.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedProfile.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">License Number</Label>
                  <p className="font-medium font-mono">{selectedProfile.driversLicenseNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">License Expiry</Label>
                  <p className="font-medium">
                    {new Date(selectedProfile.licenseExpiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Type</Label>
                  <p className="font-medium">{selectedProfile.vehicleType}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Make</Label>
                  <p className="font-medium">{selectedProfile.vehicleMake}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Model</Label>
                  <p className="font-medium">{selectedProfile.vehicleModel}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Color</Label>
                  <p className="font-medium">{selectedProfile.vehicleColor}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Plate Number</Label>
                  <p className="font-medium font-mono">{selectedProfile.vehiclePlateNumber}</p>
                </div>
              </div>
              {selectedProfile.rejectionReason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md mt-1">
                    {selectedProfile.rejectionReason}
                  </p>
                </div>
              )}
              {selectedProfile.driver && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Driver Stats</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">{selectedProfile.driver.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Online</p>
                      <p className="font-medium">{selectedProfile.driver.isOnline ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-medium">
                        {selectedProfile.driver.averageRating.toFixed(1)} ({selectedProfile.driver.totalRatings})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {selectedProfile.status === "PENDING" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedProfile)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      approveMutation.mutate(selectedProfile.id);
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Driver Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedProfile?.fullName}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="e.g., License expired, incomplete documentation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}
