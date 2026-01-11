import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, UserCog, Calendar, MapPin, Briefcase, Phone, Users, Wifi, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Director {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "OPERATIONS" | "FINANCE" | "COMPLIANCE";
  region: string;
  contractStart: string | null;
  contractEnd: string | null;
  driversAssigned: number;
  driversOnline: number;
  createdAt: string;
}

const roleConfig = {
  OPERATIONS: { color: "bg-blue-600", label: "Operations" },
  FINANCE: { color: "bg-green-600", label: "Finance" },
  COMPLIANCE: { color: "bg-purple-600", label: "Compliance" },
};

export default function DirectorsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const { data: directors, isLoading } = useQuery<Director[]>({
    queryKey: ["/api/directors"],
  });

  const updateContractEndMutation = useMutation({
    mutationFn: async ({ id, contractEnd }: { id: string; contractEnd: string }) => {
      return apiRequest("PATCH", `/api/directors/${id}`, { contractEnd });
    },
    onMutate: async ({ id, contractEnd }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/directors"] });
      const previousDirectors = queryClient.getQueryData<Director[]>(["/api/directors"]);
      
      queryClient.setQueryData<Director[]>(["/api/directors"], (old) =>
        old?.map((d) => (d.id === id ? { ...d, contractEnd } : d))
      );
      
      return { previousDirectors };
    },
    onSuccess: () => {
      setEditingId(null);
      toast({
        title: "Contract updated",
        description: "Contract end date has been updated successfully.",
      });
    },
    onError: (error: any, _, context) => {
      if (context?.previousDirectors) {
        queryClient.setQueryData(["/api/directors"], context.previousDirectors);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update contract end date.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directors"] });
    },
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const handleStartEdit = (director: Director) => {
    setEditingId(director.id);
    setEditValue(formatDateForInput(director.contractEnd));
  };

  const handleSave = (id: string) => {
    if (editValue) {
      updateContractEndMutation.mutate({ id, contractEnd: editValue });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCog className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Directors</CardTitle>
                <CardDescription>View all directors overseeing platform operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : directors && directors.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Contract Start</TableHead>
                      <TableHead>Contract End</TableHead>
                      <TableHead>Drivers Assigned</TableHead>
                      <TableHead>Drivers Online</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directors.map((director) => (
                      <TableRow key={director.id} data-testid={`row-director-${director.id}`}>
                        <TableCell className="font-medium">{director.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{director.email}</TableCell>
                        <TableCell>
                          {director.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {director.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleConfig[director.role].color}>
                            <Briefcase className="h-3 w-3 mr-1" />
                            {roleConfig[director.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {director.region}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(director.contractStart)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isAdmin ? (
                            editingId === director.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="date"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-36 h-8"
                                  data-testid={`input-contract-end-${director.id}`}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(director.id)}
                                  disabled={updateContractEndMutation.isPending}
                                  data-testid={`button-save-${director.id}`}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={handleCancel}
                                  disabled={updateContractEndMutation.isPending}
                                  data-testid={`button-cancel-${director.id}`}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(director.contractEnd)}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(director)}
                                  data-testid={`button-edit-contract-${director.id}`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(director.contractEnd)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{director.driversAssigned}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-green-500" />
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              {director.driversOnline}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(director.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No directors registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
