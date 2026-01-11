import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Loader2, UserCog, Calendar, MapPin, Briefcase, Phone, Users, Wifi, ArrowLeft, CheckCircle, Clock, XCircle, Ban, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type DirectorRole = "OPERATIONS" | "FINANCE" | "COMPLIANCE" | "GROWTH" | "REGIONAL_MANAGER";

interface Director {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: DirectorRole;
  region: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "TERMINATED";
  contractStart: string | null;
  contractEnd: string | null;
  driversAssigned: number;
  driversOnline: number;
  createdAt: string;
}

const statusConfig = {
  ACTIVE: { color: "bg-green-600", icon: CheckCircle, label: "Active" },
  PENDING: { color: "bg-yellow-600", icon: Clock, label: "Pending" },
  SUSPENDED: { color: "bg-red-600", icon: XCircle, label: "Suspended" },
  TERMINATED: { color: "bg-gray-600", icon: Ban, label: "Terminated" },
};

const roleConfig: Record<DirectorRole, { color: string; label: string }> = {
  OPERATIONS: { color: "bg-blue-600", label: "Operations" },
  FINANCE: { color: "bg-green-600", label: "Finance" },
  COMPLIANCE: { color: "bg-purple-600", label: "Compliance" },
  GROWTH: { color: "bg-orange-600", label: "Growth" },
  REGIONAL_MANAGER: { color: "bg-teal-600", label: "Regional Manager" },
};

const regionOptions = ["Lagos", "Abuja", "National", "Port Harcourt", "Kano", "Ibadan"];

// Helper to make admin API requests with preview admin context
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
  return res;
}

export default function AdminDirectorsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"start" | "end" | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editingRegionValue, setEditingRegionValue] = useState<string>("");

  const { data: directors, isLoading } = useQuery<Director[]>({
    queryKey: ["/api/directors"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return adminApiRequest("PATCH", `/api/admin/directors/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directors"] });
      toast({
        title: "Status updated",
        description: "Director status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update director status.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return adminApiRequest("PATCH", `/api/admin/directors/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directors"] });
      toast({
        title: "Role updated",
        description: "Director role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update director role.",
        variant: "destructive",
      });
    },
  });

  const updateRegionMutation = useMutation({
    mutationFn: async ({ id, region }: { id: string; region: string }) => {
      return adminApiRequest("PATCH", `/api/admin/directors/${id}/region`, { region });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directors"] });
      setEditingRegionId(null);
      toast({
        title: "Region updated",
        description: "Director region has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update director region.",
        variant: "destructive",
      });
    },
  });

  const updateContractMutation = useMutation({
    mutationFn: async ({ id, contractStart, contractEnd }: { id: string; contractStart?: string | null; contractEnd?: string | null }) => {
      return adminApiRequest("PATCH", `/api/admin/directors/${id}/contract`, { contractStart, contractEnd });
    },
    onMutate: async ({ id, contractStart, contractEnd }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/directors"] });
      const previousDirectors = queryClient.getQueryData<Director[]>(["/api/directors"]);
      
      queryClient.setQueryData<Director[]>(["/api/directors"], (old) =>
        old?.map((d) => (d.id === id ? { 
          ...d, 
          ...(contractStart !== undefined && { contractStart }),
          ...(contractEnd !== undefined && { contractEnd })
        } : d))
      );
      
      return { previousDirectors };
    },
    onSuccess: () => {
      setEditingContractId(null);
      setEditingField(null);
      toast({
        title: "Contract updated",
        description: "Contract date has been updated successfully.",
      });
    },
    onError: (error: any, _, context) => {
      if (context?.previousDirectors) {
        queryClient.setQueryData(["/api/directors"], context.previousDirectors);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update contract date.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directors"] });
    },
  });

  const handleStatusChange = (directorId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: directorId, status: newStatus });
  };

  const handleRoleChange = (directorId: string, newRole: string) => {
    updateRoleMutation.mutate({ id: directorId, role: newRole });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const handleStartEdit = (director: Director, field: "start" | "end") => {
    setEditingContractId(director.id);
    setEditingField(field);
    setEditValue(formatDateForInput(field === "start" ? director.contractStart : director.contractEnd));
  };

  const handleSave = (id: string) => {
    if (editingField) {
      if (editingField === "start") {
        updateContractMutation.mutate({ id, contractStart: editValue || null });
      } else {
        updateContractMutation.mutate({ id, contractEnd: editValue || null });
      }
    }
  };

  const handleCancel = () => {
    setEditingContractId(null);
    setEditingField(null);
    setEditValue("");
  };

  const handleStartRegionEdit = (director: Director) => {
    setEditingRegionId(director.id);
    setEditingRegionValue(director.region);
  };

  const handleRegionSave = (id: string) => {
    if (editingRegionValue.trim()) {
      updateRegionMutation.mutate({ id, region: editingRegionValue.trim() });
    }
  };

  const handleRegionCancel = () => {
    setEditingRegionId(null);
    setEditingRegionValue("");
  };

  return (
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
              <UserCog className="h-6 w-6 text-primary" />
              <div>
                <CardTitle data-testid="text-page-title">Admin - Directors</CardTitle>
                <CardDescription>Manage all directors overseeing platform operations</CardDescription>
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
                      <TableHead>Status</TableHead>
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
                          <Select
                            value={director.role}
                            onValueChange={(value) => handleRoleChange(director.id, value)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-44" data-testid={`select-role-${director.id}`}>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3" />
                                  {roleConfig[director.role]?.label || director.role}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPERATIONS">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-600 text-xs">Ops</Badge>
                                  Operations
                                </div>
                              </SelectItem>
                              <SelectItem value="FINANCE">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-600 text-xs">Fin</Badge>
                                  Finance
                                </div>
                              </SelectItem>
                              <SelectItem value="COMPLIANCE">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-purple-600 text-xs">Comp</Badge>
                                  Compliance
                                </div>
                              </SelectItem>
                              <SelectItem value="GROWTH">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-orange-600 text-xs">Grth</Badge>
                                  Growth
                                </div>
                              </SelectItem>
                              <SelectItem value="REGIONAL_MANAGER">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-teal-600 text-xs">Reg</Badge>
                                  Regional Manager
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {editingRegionId === director.id ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={editingRegionValue}
                                onValueChange={setEditingRegionValue}
                              >
                                <SelectTrigger className="w-32" data-testid={`select-region-${director.id}`}>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {regionOptions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                value={editingRegionValue}
                                onChange={(e) => setEditingRegionValue(e.target.value)}
                                placeholder="Or type..."
                                className="w-24 h-8"
                                data-testid={`input-region-${director.id}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRegionSave(director.id)}
                                disabled={updateRegionMutation.isPending}
                                data-testid={`button-save-region-${director.id}`}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleRegionCancel}
                                disabled={updateRegionMutation.isPending}
                                data-testid={`button-cancel-region-${director.id}`}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{director.region}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartRegionEdit(director)}
                                data-testid={`button-edit-region-${director.id}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={director.status}
                            onValueChange={(value) => handleStatusChange(director.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-36" data-testid={`select-status-${director.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="PENDING">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-yellow-500" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="SUSPENDED">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  Suspended
                                </div>
                              </SelectItem>
                              <SelectItem value="TERMINATED">
                                <div className="flex items-center gap-2">
                                  <Ban className="h-3 w-3 text-gray-500" />
                                  Terminated
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {editingContractId === director.id && editingField === "start" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-36 h-8"
                                data-testid={`input-contract-start-${director.id}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSave(director.id)}
                                disabled={updateContractMutation.isPending}
                                data-testid={`button-save-start-${director.id}`}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={updateContractMutation.isPending}
                                data-testid={`button-cancel-start-${director.id}`}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(director.contractStart)}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartEdit(director, "start")}
                                data-testid={`button-edit-contract-start-${director.id}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingContractId === director.id && editingField === "end" ? (
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
                                disabled={updateContractMutation.isPending}
                                data-testid={`button-save-end-${director.id}`}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={updateContractMutation.isPending}
                                data-testid={`button-cancel-end-${director.id}`}
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
                                onClick={() => handleStartEdit(director, "end")}
                                data-testid={`button-edit-contract-end-${director.id}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
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
