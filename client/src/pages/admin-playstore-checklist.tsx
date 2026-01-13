import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle, 
  Shield, FileText, Lock, Settings, Smartphone, Globe, 
  CreditCard, Users, Database, Server
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Progress } from "@/components/ui/progress";
import { AdminGuard } from "@/components/admin-guard";

interface ChecklistItem {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning";
  description: string;
}

interface PlayStoreReadiness {
  overallScore: number;
  buildStatus: { ready: boolean; message: string };
  security: ChecklistItem[];
  requiredPages: ChecklistItem[];
  deployment: ChecklistItem[];
  appMetadata: ChecklistItem[];
}

function adminApiRequest(method: string, url: string) {
  return fetch(url, {
    method,
    headers: { "X-Preview-Admin": "true" },
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  });
}

function StatusIcon({ status }: { status: "pass" | "fail" | "warning" }) {
  if (status === "pass") {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  if (status === "fail") {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }
  return <AlertCircle className="h-5 w-5 text-yellow-500" />;
}

function StatusBadge({ status }: { status: "pass" | "fail" | "warning" }) {
  if (status === "pass") {
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Pass</Badge>;
  }
  if (status === "fail") {
    return <Badge variant="destructive">Fail</Badge>;
  }
  return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Warning</Badge>;
}

function ChecklistSection({ 
  title, 
  description, 
  icon: Icon, 
  items 
}: { 
  title: string; 
  description: string; 
  icon: typeof Shield; 
  items: ChecklistItem[] 
}) {
  const passCount = items.filter(i => i.status === "pass").length;
  const percentage = Math.round((passCount / items.length) * 100);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center justify-between gap-2">
              {title}
              <Badge variant="outline">{passCount}/{items.length}</Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Progress value={percentage} className="mt-3 h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <StatusIcon status={item.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{item.label}</span>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AdminPlayStoreChecklistPage() {
  const { data: readiness, isLoading } = useQuery<PlayStoreReadiness>({
    queryKey: ["/api/playstore-readiness"],
    queryFn: () => adminApiRequest("GET", "/api/playstore-readiness"),
  });

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </main>
        </div>
      </AdminGuard>
    );
  }

  const overallScore = readiness?.overallScore ?? 0;
  const buildReady = readiness?.buildStatus?.ready ?? false;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-admin">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                Play Store Checklist
              </h1>
              <p className="text-muted-foreground">Verify app readiness for Google Play Store submission</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className={buildReady ? "border-green-500/50" : "border-red-500/50"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Build Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {buildReady ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="font-semibold">{buildReady ? "Ready for Build" : "Not Ready"}</p>
                    <p className="text-sm text-muted-foreground">
                      {readiness?.buildStatus?.message ?? "Unknown status"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Overall Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{overallScore}%</span>
                    <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                      {overallScore >= 80 ? "Ready" : overallScore >= 60 ? "Almost Ready" : "Needs Work"}
                    </Badge>
                  </div>
                  <Progress value={overallScore} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {readiness?.security && (
              <ChecklistSection
                title="Security & Compliance"
                description="Authentication, credentials, and data protection"
                icon={Shield}
                items={readiness.security}
              />
            )}

            {readiness?.requiredPages && (
              <ChecklistSection
                title="Required Pages"
                description="Privacy policy, terms, and legal pages"
                icon={FileText}
                items={readiness.requiredPages}
              />
            )}

            {readiness?.deployment && (
              <ChecklistSection
                title="Deployment Readiness"
                description="Production configuration and settings"
                icon={Settings}
                items={readiness.deployment}
              />
            )}

            {readiness?.appMetadata && (
              <ChecklistSection
                title="App Metadata"
                description="Store listing information and assets"
                icon={Database}
                items={readiness.appMetadata}
              />
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
