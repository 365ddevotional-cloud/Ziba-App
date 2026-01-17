import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronLeft,
  CheckCheck,
  Loader2,
  Megaphone,
  Car,
  CreditCard,
  Star,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  userId: string;
  role: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  RIDE_REQUESTED: Car,
  RIDE_ASSIGNED: Car,
  DRIVER_ASSIGNED: Car,
  TRIP_STARTED: Car,
  TRIP_COMPLETED: Car,
  RIDE_COMPLETED: Car,
  PAYMENT_HELD: CreditCard,
  PAYMENT_RELEASED: CreditCard,
  PAYOUT_SENT: Wallet,
  RATING_RECEIVED: Star,
  REPORT_STATUS: AlertTriangle,
  WALLET_UPDATED: Wallet,
  STATUS_CHANGE: Bell,
  ADMIN_ANNOUNCEMENT: Megaphone,
  SYSTEM: Bell,
};

const TYPE_LABELS: Record<string, string> = {
  RIDE_REQUESTED: "Ride",
  RIDE_ASSIGNED: "Ride",
  DRIVER_ASSIGNED: "Driver",
  TRIP_STARTED: "Trip",
  TRIP_COMPLETED: "Trip",
  RIDE_COMPLETED: "Trip",
  PAYMENT_HELD: "Payment",
  PAYMENT_RELEASED: "Payment",
  PAYOUT_SENT: "Payout",
  RATING_RECEIVED: "Rating",
  REPORT_STATUS: "Report",
  WALLET_UPDATED: "Wallet",
  STATUS_CHANGE: "Account",
  ADMIN_ANNOUNCEMENT: "Announcement",
  SYSTEM: "System",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    staleTime: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/read-all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all read
          </Button>
        )}
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No notifications</h2>
              <p className="text-muted-foreground">
                You're all caught up! We'll notify you when something happens.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] || Bell;
              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer hover-elevate",
                    !notification.read && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                  data-testid={`notification-${notification.id}`}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        notification.type === "ADMIN_ANNOUNCEMENT"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">
                          {notification.title || "Notification"}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {TYPE_LABELS[notification.type] || notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                        {" - "}
                        {format(new Date(notification.createdAt), "PPp")}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-3 h-3 rounded-full bg-primary mt-1" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
