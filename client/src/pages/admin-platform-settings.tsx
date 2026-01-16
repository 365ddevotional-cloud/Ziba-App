import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Settings,
  Percent,
  History,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface PlatformSettings {
  id: string;
  commissionRate: number;
  minCommissionRate: number;
  maxCommissionRate: number;
  updatedAt: string;
  updatedBy: string | null;
}

interface AuditLog {
  id: string;
  adminId: string;
  oldRate: number;
  newRate: number;
  createdAt: string;
}

export default function AdminPlatformSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingRate, setPendingRate] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ["/api/admin/platform-settings"],
    staleTime: 1000 * 60,
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/platform-settings/audit-log"],
    staleTime: 1000 * 60,
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async (commissionRate: number) => {
      const res = await apiRequest("POST", "/api/admin/platform-settings/commission", {
        commissionRate,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings/audit-log"] });
      toast({
        title: "Commission Updated",
        description: data.message,
      });
      setPendingRate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update commission rate",
        variant: "destructive",
      });
    },
  });

  const handleSliderChange = (value: number[]) => {
    setPendingRate(value[0]);
  };

  const handleSave = () => {
    if (pendingRate === null) return;
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    if (pendingRate === null) return;
    updateCommissionMutation.mutate(pendingRate);
    setShowConfirmDialog(false);
  };

  const currentRate = settings?.commissionRate ?? 0.15;
  const displayRate = pendingRate ?? currentRate;
  const hasChanges = pendingRate !== null && pendingRate !== currentRate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Commission Rate
            </CardTitle>
            <CardDescription>
              Platform commission on each completed trip (15% - 18%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary" data-testid="text-commission-rate">
                {(displayRate * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Driver receives {((1 - displayRate) * 100).toFixed(0)}% of each fare
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>15%</span>
                <span>16%</span>
                <span>17%</span>
                <span>18%</span>
              </div>
              <Slider
                value={[displayRate]}
                min={settings?.minCommissionRate ?? 0.15}
                max={settings?.maxCommissionRate ?? 0.18}
                step={0.01}
                onValueChange={handleSliderChange}
                disabled={updateCommissionMutation.isPending}
                data-testid="slider-commission"
              />
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Changing from {(currentRate * 100).toFixed(0)}% to {(displayRate * 100).toFixed(0)}%
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateCommissionMutation.isPending}
                className="flex-1"
                data-testid="button-save-commission"
              >
                {updateCommissionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={() => setPendingRate(null)}
                  disabled={updateCommissionMutation.isPending}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              )}
            </div>

            {settings?.updatedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {format(new Date(settings.updatedAt), "PPp")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Change History
            </CardTitle>
            <CardDescription>
              Audit log of commission rate changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!auditLogs || auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No changes recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    data-testid={`audit-log-${log.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {(log.oldRate * 100).toFixed(0)}% → {(log.newRate * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "PPp")}
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      log.newRate > log.oldRate 
                        ? "bg-red-500/10 text-red-500" 
                        : "bg-green-500/10 text-green-500"
                    }`}>
                      {log.newRate > log.oldRate ? "+" : ""}{((log.newRate - log.oldRate) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important Notes</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Commission changes only affect <strong>future trips</strong></li>
                <li>Already settled trips will not be affected</li>
                <li>All changes are logged for audit purposes</li>
                <li>Commission is applied at trip settlement (SETTLED state)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Commission Change</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the platform commission from{" "}
              <strong>{(currentRate * 100).toFixed(0)}%</strong> to{" "}
              <strong>{(displayRate * 100).toFixed(0)}%</strong>.
              <br /><br />
              This change will affect all future trips only. Already settled trips will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-dialog-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSave}
              data-testid="button-dialog-confirm"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
