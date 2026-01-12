import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CountryProvider } from "@/lib/country";
import { TestBanner } from "@/components/test-banner";
import Landing from "@/pages/landing";
import UsersPage from "@/pages/users";
import DriversPage from "@/pages/drivers";
import DirectorsPage from "@/pages/directors";
import RidesPage from "@/pages/rides";
import AdminPage from "@/pages/admin";
import AdminUsersPage from "@/pages/admin-users";
import AdminDriversPage from "@/pages/admin-drivers";
import AdminRidesPage from "@/pages/admin-rides";
import AdminDirectorsPage from "@/pages/admin-directors";
import AdminPaymentsPage from "@/pages/admin-payments";
import AdminIncentivesPage from "@/pages/admin-incentives";
import AdminWalletsPage from "@/pages/admin-wallets";
import AdminAnalyticsPage from "@/pages/admin-analytics";
import AdminFaresPage from "@/pages/admin-fares";
import AdminTestAccountsPage from "@/pages/admin-test-accounts";
import AdminLoginPage from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/drivers" component={DriversPage} />
      <Route path="/directors" component={DirectorsPage} />
      <Route path="/rides" component={RidesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/drivers" component={AdminDriversPage} />
      <Route path="/admin/directors" component={AdminDirectorsPage} />
      <Route path="/admin/rides" component={AdminRidesPage} />
      <Route path="/admin/payments" component={AdminPaymentsPage} />
      <Route path="/admin/incentives" component={AdminIncentivesPage} />
      <Route path="/admin/wallets" component={AdminWalletsPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/fares" component={AdminFaresPage} />
      <Route path="/admin/test-accounts" component={AdminTestAccountsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CountryProvider>
            <TooltipProvider>
              <TestBanner />
              <Toaster />
              <Router />
            </TooltipProvider>
          </CountryProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
