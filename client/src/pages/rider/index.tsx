import { Switch, Route, Redirect, useLocation } from "wouter";
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
import RiderTripSummary from "./trip-summary";
import RiderAccessDenied from "./access-denied";
import WalletAddFunds from "./wallet-add-funds";
import WalletAddCard from "./wallet-add-card";
import WalletPaymentMethods from "./wallet-payment-methods";
import WalletTransactionDetail from "./wallet-transaction-detail";
import CoordinatorHome from "../coordinator/home";
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
    if (process.env.NODE_ENV === "development") {
      console.warn("[RiderAuthGuard] Not authenticated, redirecting to /login");
    }
    return <Redirect to="/login" />;
  }

  // Block non-riders (including drivers) from accessing rider routes
  if (!isRider) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[RiderAuthGuard] User is not a rider, user:", user);
    }
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

  // If authenticated as rider, redirect to home
  if (isAuthenticated && isRider) {
    return <Redirect to="/rider/home" />;
  }

  // If authenticated but not a rider, block access
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
      {/* Dynamic routes with params must come before static routes */}
      <Route path="/rider/trip-summary/:id">
        <RiderAuthGuard>
          <RiderTripSummary />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/wallet/transaction/:id">
        <RiderAuthGuard>
          <WalletTransactionDetail />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/wallet/add-funds">
        <RiderAuthGuard>
          <WalletAddFunds />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/wallet/add-card">
        <RiderAuthGuard>
          <WalletAddCard />
        </RiderAuthGuard>
      </Route>
      <Route path="/rider/wallet/payment-methods">
        <RiderAuthGuard>
          <WalletPaymentMethods />
        </RiderAuthGuard>
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
      <Route path="/coordinator/home">
        <RiderAuthGuard>
          <CoordinatorHome />
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
