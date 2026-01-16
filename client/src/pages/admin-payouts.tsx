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
  ChevronLeft,
  Loader2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Building2,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Shield,
} from "lucide-react";

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return lastFour.padStart(accountNumber.length, '*');
}

interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
}

interface PayoutRequest {
  id: string;
  driverId: string;
  driver: Driver;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  rejectionReason: string | null;
  bankAccount: BankAccount | null;
}

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showPaidDialog, setShowPaidDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: payouts, isLoading } = useQuery<PayoutRequest[]>({
    queryKey: ["/api/admin/payouts"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/payouts/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setShowApproveDialog(false);
      setSelectedPayout(null);
      toast({
        title: "Payout approved",
        description: "The withdrawal has been approved and is ready for payment.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve payout",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest("POST", `/api/admin/payouts/${id}/reject`, { rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setShowRejectDialog(false);
      setSelectedPayout(null);
      setRejectionReason("");
      toast({
        title: "Payout rejected",
        description: "The withdrawal has been rejected and funds returned to driver.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject payout",
        variant: "destructive",
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/payouts/${id}/mark-paid`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setShowPaidDialog(false);
      setSelectedPayout(null);
      toast({
        title: "Payout marked as paid",
        description: "The withdrawal has been completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark payout as paid",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: PayoutRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "PAID":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredPayouts = payouts?.filter(p => 
    activeTab === "ALL" ? true : p.status === activeTab
  ) || [];

  const pendingCount = payouts?.filter(p => p.status === "PENDING").length || 0;
  const approvedCount = payouts?.filter(p => p.status === "APPROVED").length || 0;

  const totalPending = payouts
    ?.filter(p => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const totalApproved = payouts
    ?.filter(p => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-ziba-bg">
        <header className="p-4 flex items-center gap-3 border-b border-ziba-border bg-ziba-card">
          <Link href="/admin">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-ziba-text-primary text-lg">Driver Payouts</h1>
        </header>

        <main className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-ziba-card border-ziba-border">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ziba-text-primary">{pendingCount}</p>
                <p className="text-xs text-ziba-text-secondary">Pending</p>
              </CardContent>
            </Card>
            <Card className="bg-ziba-card border-ziba-border">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ziba-text-primary">{approvedCount}</p>
                <p className="text-xs text-ziba-text-secondary">Approved</p>
              </CardContent>
            </Card>
            <Card className="bg-ziba-card border-ziba-border">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ziba-text-primary">
                  NGN {totalPending.toLocaleString()}
                </p>
                <p className="text-xs text-ziba-text-secondary">Pending Amount</p>
              </CardContent>
            </Card>
            <Card className="bg-ziba-card border-ziba-border">
              <CardContent className="p-4 text-center">
                <Send className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ziba-text-primary">
                  NGN {totalApproved.toLocaleString()}
                </p>
                <p className="text-xs text-ziba-text-secondary">Ready to Pay</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="PENDING" data-testid="tab-pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="APPROVED" data-testid="tab-approved">
                Approved {approvedCount > 0 && `(${approvedCount})`}
              </TabsTrigger>
              <TabsTrigger value="PAID" data-testid="tab-paid">Paid</TabsTrigger>
              <TabsTrigger value="REJECTED" data-testid="tab-rejected">Rejected</TabsTrigger>
              <TabsTrigger value="ALL" data-testid="tab-all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-ziba-accent" />
                </div>
              ) : filteredPayouts.length === 0 ? (
                <Card className="bg-ziba-card border-ziba-border">
                  <CardContent className="p-8 text-center">
                    <Send className="w-12 h-12 text-ziba-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-ziba-text-secondary">No {activeTab.toLowerCase()} payouts</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPayouts.map((payout) => (
                  <Card 
                    key={payout.id} 
                    className="bg-ziba-card border-ziba-border hover-elevate"
                    data-testid={`card-payout-${payout.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-ziba-accent" />
                            <span className="font-medium text-ziba-text-primary">
                              {payout.driver.fullName}
                            </span>
                            {getStatusBadge(payout.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-ziba-text-secondary">
                              <Mail className="w-3 h-3" />
                              {payout.driver.email}
                            </div>
                            <div className="flex items-center gap-2 text-ziba-text-secondary">
                              <Phone className="w-3 h-3" />
                              {payout.driver.phone}
                            </div>
                          </div>

                          {payout.bankAccount && (
                            <div className="mt-3 p-2 bg-muted/50 rounded-md">
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-ziba-accent" />
                                <span className="font-medium">{payout.bankAccount.bankName}</span>
                                {payout.bankAccount.verified ? (
                                  <Badge variant="outline" className="border-green-500 text-green-500 text-xs">
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-500 text-amber-500 text-xs">
                                    Unverified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-ziba-text-secondary mt-1">
                                {maskAccountNumber(payout.bankAccount.accountNumber)} - {payout.bankAccount.accountName}
                              </p>
                            </div>
                          )}

                          {payout.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-500/10 rounded-md">
                              <p className="text-sm text-red-500">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {payout.rejectionReason}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-ziba-text-secondary mt-2">
                            Requested: {formatDate(payout.requestedAt)}
                            {payout.processedAt && ` • Processed: ${formatDate(payout.processedAt)}`}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-ziba-accent">
                            NGN {payout.amount.toLocaleString()}
                          </p>
                          
                          <div className="flex flex-col gap-2 mt-3">
                            {payout.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setShowApproveDialog(true);
                                  }}
                                  data-testid={`button-approve-${payout.id}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setShowRejectDialog(true);
                                  }}
                                  data-testid={`button-reject-${payout.id}`}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {payout.status === "APPROVED" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowPaidDialog(true);
                                }}
                                data-testid={`button-mark-paid-${payout.id}`}
                              >
                                <DollarSign className="w-3 h-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>

        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Withdrawal</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this withdrawal request?
              </DialogDescription>
            </DialogHeader>
            {selectedPayout && (
              <div className="py-4">
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <p className="font-medium">{selectedPayout.driver.fullName}</p>
                  <p className="text-2xl font-bold text-ziba-accent">
                    NGN {selectedPayout.amount.toLocaleString()}
                  </p>
                  {selectedPayout.bankAccount && (
                    <p className="text-sm text-muted-foreground">
                      To: {selectedPayout.bankAccount.bankName} - {maskAccountNumber(selectedPayout.bankAccount.accountNumber)}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedPayout && approveMutation.mutate(selectedPayout.id)}
                disabled={approveMutation.isPending}
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Withdrawal</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this withdrawal. The funds will be returned to the driver's available balance.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {selectedPayout && (
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <p className="font-medium">{selectedPayout.driver.fullName}</p>
                  <p className="text-xl font-bold">NGN {selectedPayout.amount.toLocaleString()}</p>
                </div>
              )}
              <div>
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2"
                  data-testid="input-rejection-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => selectedPayout && rejectMutation.mutate({ 
                  id: selectedPayout.id, 
                  reason: rejectionReason 
                })}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPaidDialog} onOpenChange={setShowPaidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Confirm that you have transferred the funds to the driver's bank account.
              </DialogDescription>
            </DialogHeader>
            {selectedPayout && (
              <div className="py-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md space-y-2">
                  <p className="font-medium">{selectedPayout.driver.fullName}</p>
                  <p className="text-2xl font-bold text-green-500">
                    NGN {selectedPayout.amount.toLocaleString()}
                  </p>
                  {selectedPayout.bankAccount && (
                    <div className="text-sm text-muted-foreground">
                      <p>{selectedPayout.bankAccount.bankName}</p>
                      <p>{maskAccountNumber(selectedPayout.bankAccount.accountNumber)}</p>
                      <p>{selectedPayout.bankAccount.accountName}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 rounded-md flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-500 mt-0.5" />
                  <p className="text-sm text-amber-600">
                    Only mark as paid after confirming the bank transfer was successful.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaidDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => selectedPayout && markPaidMutation.mutate(selectedPayout.id)}
                disabled={markPaidMutation.isPending}
                data-testid="button-confirm-paid"
              >
                {markPaidMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Confirm Paid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
