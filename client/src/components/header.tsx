import { Link, useLocation } from "wouter";
import { Menu, X, Users, Car, MapPin, Shield, UserCog, LogIn, LogOut, Bell, Check } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  userId: string;
  role: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const navLinks = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/drivers", label: "Drivers", icon: Car },
  { href: "/directors", label: "Directors", icon: UserCog },
  { href: "/rides", label: "Rides", icon: MapPin },
  { href: "/admin", label: "Admin", icon: Shield },
];

function NotificationBell() {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "X-Preview-Admin": "true" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "X-Preview-Admin": "true" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "RIDE_REQUESTED":
      case "RIDE_ASSIGNED":
      case "RIDE_COMPLETED":
        return <MapPin className="h-4 w-4 text-primary" />;
      case "WALLET_UPDATED":
        return <Shield className="h-4 w-4 text-green-500" />;
      case "STATUS_CHANGE":
        return <UserCog className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.preventDefault();
                markAllReadMutation.mutate();
              }}
              data-testid="button-mark-all-read"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {notifications && notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                  data-testid={`notification-${notification.id}`}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-xs py-0 h-4">
                        {notification.role}
                      </Badge>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-ziba-border bg-ziba-primary">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ziba-accent flex items-center justify-center">
            <span className="text-ziba-primary font-bold text-lg">Z</span>
          </div>
          <span className="text-xl font-bold text-ziba-text-primary" data-testid="text-logo">Ziba</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={isActive ? "text-ziba-accent border-b-2 border-ziba-accent rounded-none" : "text-ziba-text-primary hover:text-ziba-accent"}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            <NotificationBell />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-ziba-accent text-ziba-accent hover:bg-ziba-accent/10" data-testid="button-user-menu">
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-ziba-card border-ziba-border">
                  <DropdownMenuItem disabled className="text-ziba-text-secondary">
                    Logged in as {user.role}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-ziba-border" />
                  <DropdownMenuItem onClick={() => logout()} className="text-ziba-text-primary hover:text-ziba-accent" data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/admin/login">
                <Button size="sm" className="ziba-btn-primary" data-testid="button-admin-login">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin Login
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-ziba-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-ziba-card border-b border-ziba-border p-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive ? "text-ziba-accent bg-ziba-accent/10" : "text-ziba-text-primary hover:text-ziba-accent"}`}
                  data-testid={`nav-mobile-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
