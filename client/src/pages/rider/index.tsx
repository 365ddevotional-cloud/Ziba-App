import { Switch, Route, Redirect } from "wouter";
import { useRiderAuth } from "@/lib/rider-auth";
import RiderHome from "./home";
import RiderLogin from "./login";
import RiderRegister from "./register";
import RiderRequest from "./request";
import RiderConfirm from "./confirm";
import RiderLiveRide from "./live-ride";
import RiderHistory from "./history";
import RiderWallet from "./wallet";
import RiderProfile from "./profile";
import RiderSupport from "./support";
import RiderAccessDenied from "./access-denied";
import { Loader2 } from "lucide-react";

function RiderAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isRider, user } = useRiderAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/rider/login" />;
  }

  if (!isRider) {
    return <RiderAccessDenied />;
  }

  return <>{children}</>;
}

function RiderGuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isRider } = useRiderAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && isRider) {
    return <Redirect to="/rider/home" />;
  }

  if (isAuthenticated && !isRider) {
    return <RiderAccessDenied />;
  }

  return <>{children}</>;
}

export default function RiderApp() {
  return (
    <Switch>
      <Route path="/rider/login">
        <RiderGuestGuard>
          <RiderLogin />
        </RiderGuestGuard>
      </Route>
      <Route path="/rider/signup">
        <RiderGuestGuard>
          <RiderRegister />
        </RiderGuestGuard>
      </Route>
      <Route path="/rider/register">
        <RiderGuestGuard>
          <RiderRegister />
        </RiderGuestGuard>
      </Route>
      <Route path="/rider/request">
        <RiderAuthGuard>
          <RiderRequest />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/confirm">
        <RiderAuthGuard>
          <RiderConfirm />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/live">
        <RiderAuthGuard>
          <RiderLiveRide />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/active-ride">
        <RiderAuthGuard>
          <RiderLiveRide />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/history">
        <RiderAuthGuard>
          <RiderHistory />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/trip-history">
        <RiderAuthGuard>
          <RiderHistory />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/wallet">
        <RiderAuthGuard>
          <RiderWallet />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/profile">
        <RiderAuthGuard>
          <RiderProfile />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/support">
        <RiderAuthGuard>
          <RiderSupport />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/home">
        <RiderAuthGuard>
          <RiderHome />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider">
        <RiderAuthGuard>
          <RiderHome />
        </RiderAuthGuard>
      </Route>
    </Switch>
  );
}
