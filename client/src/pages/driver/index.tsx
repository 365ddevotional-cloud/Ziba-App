import { Switch, Route, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DriverHome from "./home";
import DriverActiveRide from "./active-ride";
import DriverWallet from "./wallet";
import DriverPendingVerification from "./pending-verification";
import { Loader2 } from "lucide-react";

interface DriverProfile {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  status: string;
}

function DriverAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: driver, isLoading, isError } = useQuery<DriverProfile>({
    queryKey: ["/api/driver/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !driver) {
    return <Redirect to="/signup" />;
  }

  if (!driver.isVerified || driver.status === "PENDING") {
    return <DriverPendingVerification />;
  }

  return <>{children}</>;
}

export default function DriverApp() {
  return (
    <Switch>
      <Route path="/driver/pending-verification">
        <DriverPendingVerification />
      </Route>
      <Route path="/driver/ride/:id">
        <DriverAuthGuard>
          <DriverActiveRide />
        </DriverAuthGuard>
      </Route>
      <Route path="/driver/wallet">
        <DriverAuthGuard>
          <DriverWallet />
        </DriverAuthGuard>
      </Route>
      <Route path="/driver/home">
        <DriverAuthGuard>
          <DriverHome />
        </DriverAuthGuard>
      </Route>
      <Route path="/driver">
        <DriverAuthGuard>
          <DriverHome />
        </DriverAuthGuard>
      </Route>
    </Switch>
  );
}
