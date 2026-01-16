import { Switch, Route, Redirect } from "wouter";
import { useDriverAuth } from "@/lib/driver-auth";
import { useRiderAuth } from "@/lib/rider-auth";
import DriverHome from "./home";
import DriverLogin from "./login";
import DriverOnboard from "./onboard";
import DriverStatus from "./status";
import DriverAccessDenied from "./access-denied";
import { Loader2 } from "lucide-react";

function DriverAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isDriver, user } = useDriverAuth();
  const { isRider } = useRiderAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block riders from accessing driver routes
  if (isRider) {
    return <DriverAccessDenied />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/driver/login" />;
  }

  if (!isDriver) {
    return <DriverAccessDenied />;
  }

  return <>{children}</>;
}

function DriverGuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isDriver } = useDriverAuth();
  const { isRider } = useRiderAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block riders from accessing driver routes
  if (isRider) {
    return <DriverAccessDenied />;
  }

  if (isAuthenticated && isDriver) {
    return <Redirect to="/driver/home" />;
  }

  if (isAuthenticated && !isDriver) {
    return <DriverAccessDenied />;
  }

  return <>{children}</>;
}

export default function DriverApp() {
  return (
    <Switch>
      <Route path="/driver/login">
        <DriverGuestGuard>
          <DriverLogin />
        </DriverGuestGuard>
      </Route>
      <Route path="/driver/home">
        <DriverAuthGuard>
          <DriverHome />
        </DriverAuthGuard>
      </Route>
      <Route path="/driver/onboard">
        <DriverAuthGuard>
          <DriverOnboard />
        </DriverAuthGuard>
      </Route>
      <Route path="/driver/status">
        <DriverAuthGuard>
          <DriverStatus />
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
