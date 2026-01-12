import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Loader2, KeyRound, ArrowLeft, Plus, Trash2, RotateCw, LogIn, FlaskConical, Copy, Check, Users, Car, Shield, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { countries } from "@/lib/country";
import { AdminGuard } from "@/components/admin-guard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TestAccount {
  id: string;
  email: string;
  role: "USER" | "DRIVER" | "DIRECTOR" | "ADMIN";
  countryCode: string;
  region: string | null;
  city: string | null;
  status: "ACTIVE" | "SUSPENDED";
  fullName: string;
  isTestAccount: boolean;
  createdAt: string;
  createdBy: string | null;
  temporaryPassword?: string;
}

function adminApiRequest(method: string, url: string, body?: any) {
  const options: any = { method };
  if (body !== undefined) {
    options.body = JSON.stringify({ ...body, previewAdmin: true });
    options.headers = { "Content-Type": "application/json", "X-Preview-Admin": "true" };
  } else {
    options.headers = { "X-Preview-Admin": "true" };
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

const roleIcons: Record<string, any> = {
  USER: Users,
  DRIVER: Car,
  DIRECTOR: UserCog,
  ADMIN: Shield,
};

const roleColors: Record<string, string> = {
  USER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DRIVER: "bg-green-500/10 text-green-500 border-green-500/20",
  DIRECTOR: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminTestLoginsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [newAccountPassword, setNewAccountPassword] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    role: "USER" as "USER" | "DRIVER" | "DIRECTOR" | "ADMIN",
    countryCode: "NG",
    region: "",
    city: "",
    fullName: "",
  });

  const { data: testAccounts, isLoading } = useQuery<TestAccount[]>({
    queryKey: ["/api/test-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/test-accounts", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch test accounts");
      return res.json();
    },
  });

  const { data: devMode } = useQuery<{ isDevMode: boolean; testAccountsEnabled: boolean }>({
    queryKey: ["/api/dev-mode"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return adminApiRequest("POST", "/api/test-accounts", data);
    },
    onSuccess: (data: TestAccount) => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-accounts"] });
      setNewAccountPassword(data.temporaryPassword || null);
      setFormData({ role: "USER", countryCode: "NG", region: "", city: "", fullName: "" });
      toast({ title: "Test account created", description: `Created ${data.email}` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiRequest("DELETE", `/api/test-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-accounts"] });
      toast({ title: "Test account deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      return adminApiRequest("DELETE", "/api/test-accounts");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-accounts"] });
      toast({ title: "All test accounts deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiRequest("POST", `/api/test-accounts/${id}/reset-password`);
    },
    onSuccess: (data: { temporaryPassword: string }) => {
      toast({ 
        title: "Password reset", 
        description: `New password: ${data.temporaryPassword}`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const loginAsMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiRequest("POST", `/api/test-accounts/${id}/login-as`);
    },
    onSuccess: (data: { redirectTo: string }) => {
      toast({ title: "Logged in as test account" });
      setLocation(data.redirectTo);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    if (!formData.fullName) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  if (!devMode?.isDevMode) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto py-8 px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-red-500">Test Accounts Disabled</CardTitle>
                <CardDescription className="text-center">
                  Test accounts are only available in development mode.
                </CardDescription>
              </CardHeader>
            </Card>
          </main>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              Test Login Manager
              <FlaskConical className="h-6 w-6 text-amber-500" />
            </h1>
          </div>
          <p className="text-muted-foreground">Create and manage fake login credentials for testing</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-test-account">
                <Plus className="h-4 w-4 mr-2" />
                Create Test Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Test Account</DialogTitle>
                <DialogDescription>
                  Create a new test account for development testing.
                </DialogDescription>
              </DialogHeader>
              
              {newAccountPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-500 mb-2">Account Created!</p>
                    <p className="text-sm text-muted-foreground mb-2">Save this password - it will only be shown once:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">{newAccountPassword}</code>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => copyToClipboard(newAccountPassword, "new-password")}
                      >
                        {copiedId === "new-password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewAccountPassword(null);
                      setCreateOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Test User Name"
                        data-testid="input-fullname"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as any }))}
                      >
                        <SelectTrigger data-testid="select-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="DRIVER">Driver</SelectItem>
                          <SelectItem value="DIRECTOR">Director</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select 
                        value={formData.countryCode} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, countryCode: v }))}
                      >
                        <SelectTrigger data-testid="select-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Region (optional)</Label>
                        <Input
                          value={formData.region}
                          onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                          placeholder="e.g., Lagos"
                          data-testid="input-region"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City (optional)</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g., Ikeja"
                          data-testid="input-city"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!testAccounts?.length}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Test Accounts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Test Accounts?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {testAccounts?.length || 0} test accounts. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteAllMutation.mutate()}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : testAccounts && testAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testAccounts.map((account) => {
              const RoleIcon = roleIcons[account.role] || Users;
              const country = countries.find(c => c.code === account.countryCode);
              
              return (
                <Card key={account.id} className="relative">
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                      <FlaskConical className="h-3 w-3 mr-1" />
                      TEST
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleColors[account.role]}`}>
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{account.fullName}</CardTitle>
                        <CardDescription className="truncate">{account.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{account.role}</Badge>
                      <Badge variant="outline">{country?.name || account.countryCode}</Badge>
                      {account.city && <Badge variant="outline">{account.city}</Badge>}
                      {account.region && !account.city && <Badge variant="outline">{account.region}</Badge>}
                      <Badge 
                        variant={account.status === "ACTIVE" ? "default" : "destructive"}
                        className={account.status === "ACTIVE" ? "bg-green-500/20 text-green-500 border-green-500/30" : ""}
                      >
                        {account.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => loginAsMutation.mutate(account.id)}
                        disabled={loginAsMutation.isPending}
                        data-testid={`button-login-as-${account.id}`}
                      >
                        <LogIn className="h-3 w-3 mr-1" />
                        Login As
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resetPasswordMutation.mutate(account.id)}
                        disabled={resetPasswordMutation.isPending}
                        data-testid={`button-reset-password-${account.id}`}
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(account.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${account.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No test accounts created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Create Test Account" to get started.</p>
            </CardContent>
          </Card>
        )}
      </main>
      </div>
    </AdminGuard>
  );
}
