import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Users, Mail, Phone, Calendar, ArrowLeft, MapPin, UserCheck, UserX, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import { AdminGuard } from "@/components/admin-guard";

type UserStatus = "ACTIVE" | "SUSPENDED";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  status: UserStatus;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  _count: {
    rides: number;
  };
}

const statusConfig: Record<UserStatus, { color: string; icon: typeof UserCheck; label: string }> = {
  ACTIVE: { color: "bg-green-600", icon: UserCheck, label: "Active" },
  SUSPENDED: { color: "bg-red-600", icon: UserX, label: "Suspended" },
};

function adminApiRequest(method: string, url: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: { "X-Preview-Admin": "true", "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    options.body = JSON.stringify({ ...body, previewAdmin: true });
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return adminApiRequest("PATCH", `/api/users/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Status updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: userId, status: newStatus });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Admin - Users</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Rides</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const statusInfo = statusConfig[user.status];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm max-w-32 truncate">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {user.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.city ? (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {user.city}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.status}
                              onValueChange={(value) => handleStatusChange(user.id, value)}
                            >
                              <SelectTrigger
                                className="w-36"
                                data-testid={`select-user-status-${user.id}`}
                              >
                                <SelectValue>
                                  <Badge className={statusInfo.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusInfo.label}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                    Active
                                  </div>
                                </SelectItem>
                                <SelectItem value="SUSPENDED">
                                  <div className="flex items-center gap-2">
                                    <UserX className="h-4 w-4 text-red-500" />
                                    Suspended
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {user.totalRatings > 0 ? (
                              <div className="flex items-center gap-2">
                                <StarRating rating={user.averageRating} size="sm" />
                                <span className="text-xs text-muted-foreground">
                                  ({user.totalRatings})
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No ratings</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user._count.rides}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      </div>
    </AdminGuard>
  );
}
