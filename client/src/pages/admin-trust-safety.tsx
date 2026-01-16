import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminGuard } from "@/components/admin-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Loader2,
  Shield,
  AlertTriangle,
  Flag,
  Star,
  UserX,
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
} from "lucide-react";
import { format } from "date-fns";

interface Stats {
  openReports: number;
  reviewedReports: number;
  suspendedUsers: number;
  suspendedDrivers: number;
  lowRatedDrivers: number;
}

interface Reporter {
  id: string;
  fullName: string;
  email: string;
}

interface Reported {
  id: string;
  fullName: string;
  email: string;
  status: string;
  averageRating: number;
}

interface Report {
  id: string;
  tripId: string | null;
  reporterId: string;
  reporterRole: string;
  reportedUserId: string;
  reportedRole: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  actionTaken: string | null;
  reporter: Reporter | null;
  reported: Reported | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  UNSAFE_DRIVING: "Unsafe Driving",
  RUDE_BEHAVIOR: "Rude Behavior",
  PAYMENT_ISSUE: "Payment Issue",
  FRAUD: "Fraud",
  HARASSMENT: "Harassment",
  VEHICLE_ISSUE: "Vehicle Issue",
  ROUTE_DEVIATION: "Route Deviation",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "border-amber-500 text-amber-500",
  REVIEWED: "border-blue-500 text-blue-500",
  ACTION_TAKEN: "border-red-500 text-red-500",
  DISMISSED: "border-gray-500 text-gray-500",
};

export default function AdminTrustSafetyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("reports");
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>("REVIEWED");
  const [actionTaken, setActionTaken] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/trust-safety/stats"],
    staleTime: 30000,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports", statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
    staleTime: 30000,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, actionTaken }: { id: string; status: string; actionTaken: string }) => {
      const res = await apiRequest("POST", `/api/admin/reports/${id}/review`, { status, actionTaken });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trust-safety/stats"] });
      toast({ title: "Report reviewed", description: "The report has been updated" });
      setShowReviewDialog(false);
      setSelectedReport(null);
      setActionTaken("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, role, reason }: { userId: string; role: string; reason: string }) => {
      const res = await apiRequest("POST", "/api/admin/suspend-user", { userId, role, reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trust-safety/stats"] });
      toast({ title: "User suspended", description: "The user has been suspended" });
      setShowSuspendDialog(false);
      setSuspendReason("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleReview = () => {
    if (!selectedReport) return;
    reviewMutation.mutate({
      id: selectedReport.id,
      status: reviewStatus,
      actionTaken,
    });
  };

  const handleSuspend = () => {
    if (!selectedReport?.reported) return;
    suspendMutation.mutate({
      userId: selectedReport.reportedUserId,
      role: selectedReport.reportedRole,
      reason: suspendReason,
    });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <header className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/admin">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">Trust & Safety</h1>
          </div>
        </header>

        <main className="p-4 space-y-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flag className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                    <p className="text-2xl font-bold" data-testid="stat-open-reports">{stats?.openReports || 0}</p>
                    <p className="text-xs text-muted-foreground">Open Reports</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold" data-testid="stat-reviewed">{stats?.reviewedReports || 0}</p>
                    <p className="text-xs text-muted-foreground">Reviewed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <UserX className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold" data-testid="stat-suspended-users">{stats?.suspendedUsers || 0}</p>
                    <p className="text-xs text-muted-foreground">Suspended Riders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Car className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold" data-testid="stat-suspended-drivers">{stats?.suspendedDrivers || 0}</p>
                    <p className="text-xs text-muted-foreground">Suspended Drivers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                    <p className="text-2xl font-bold" data-testid="stat-low-rated">{stats?.lowRatedDrivers || 0}</p>
                    <p className="text-xs text-muted-foreground">Low-Rated Drivers</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
                  <TabsTrigger value="ratings" className="flex-1">Ratings</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40" data-testid="select-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
                        <SelectItem value="DISMISSED">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-44" data-testid="select-category">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {reportsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : !reports || reports.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No reports found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <Card key={report.id} data-testid={`report-${report.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={STATUS_COLORS[report.status]}>
                                    {report.status.replace("_", " ")}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {CATEGORY_LABELS[report.category] || report.category}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Reporter</p>
                                    <div className="flex items-center gap-1">
                                      {report.reporterRole === "driver" ? (
                                        <Car className="w-3 h-3 text-muted-foreground" />
                                      ) : (
                                        <User className="w-3 h-3 text-muted-foreground" />
                                      )}
                                      <p className="text-sm font-medium truncate">
                                        {report.reporter?.fullName || "Unknown"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Reported</p>
                                    <div className="flex items-center gap-1">
                                      {report.reportedRole === "driver" ? (
                                        <Car className="w-3 h-3 text-muted-foreground" />
                                      ) : (
                                        <User className="w-3 h-3 text-muted-foreground" />
                                      )}
                                      <p className="text-sm font-medium truncate">
                                        {report.reported?.fullName || "Unknown"}
                                      </p>
                                      {report.reported?.status === "SUSPENDED" && (
                                        <Badge variant="destructive" className="text-xs">Suspended</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {report.description}
                                </p>

                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(new Date(report.createdAt), "PPp")}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowReviewDialog(true);
                                  }}
                                  data-testid={`button-review-${report.id}`}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Review
                                </Button>
                                {report.reported?.status !== "SUSPENDED" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setShowSuspendDialog(true);
                                    }}
                                    data-testid={`button-suspend-${report.id}`}
                                  >
                                    <UserX className="w-3 h-3 mr-1" />
                                    Suspend
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ratings" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Overview</CardTitle>
                      <CardDescription>
                        View all ratings across the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center py-8">
                        Rating analytics coming soon
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
              <DialogDescription>
                Review this report and take appropriate action
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[selectedReport.category]}
                    </Badge>
                    <Badge variant="outline" className={STATUS_COLORS[selectedReport.status]}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reported User</p>
                    <p className="font-medium">{selectedReport.reported?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reported?.email}</p>
                    {selectedReport.reported && selectedReport.reported.averageRating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-sm">{selectedReport.reported.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger data-testid="select-review-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
                      <SelectItem value="DISMISSED">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action Taken (optional)</Label>
                  <Textarea
                    placeholder="Describe the action taken..."
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    data-testid="input-action-taken"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={reviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                This will suspend the reported user from using the platform
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                  <p className="font-medium text-red-500">
                    Suspending: {selectedReport.reported?.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reportedRole === "driver" ? "Driver" : "Rider"}
                  </p>
                </div>

                <div>
                  <Label>Suspension Reason</Label>
                  <Textarea
                    placeholder="Enter the reason for suspension..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    data-testid="input-suspend-reason"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || suspendMutation.isPending}
                data-testid="button-confirm-suspend"
              >
                {suspendMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Suspend User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
