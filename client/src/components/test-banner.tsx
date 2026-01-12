import { FlaskConical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  isTestAccount?: boolean;
  isImpersonating?: boolean;
  originalAdmin?: { email: string } | null;
}

export function TestBanner() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const returnMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/test-accounts/return-to-admin", {
        method: "POST",
        headers: { "X-Preview-Admin": "true" },
      });
      if (!res.ok) throw new Error("Failed to return to admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin/test-accounts");
    },
  });

  if (!user?.isImpersonating && !user?.isTestAccount) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 flex items-center justify-between gap-4" data-testid="banner-test-account">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4" />
        <span className="font-medium text-sm">
          You are logged in as a TEST account ({user.email})
        </span>
      </div>
      {user.isImpersonating && (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => returnMutation.mutate()}
          disabled={returnMutation.isPending}
          className="bg-black/20 hover:bg-black/30 text-black border-none"
          data-testid="button-return-to-admin"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Return to Admin
        </Button>
      )}
    </div>
  );
}
