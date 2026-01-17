import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { RiderAuthProvider } from "@/lib/rider-auth";
import { CountryProvider } from "@/lib/country";
import { TestBanner } from "@/components/test-banner";
import { DevBanner } from "@/components/dev-banner";
import Landing from "@/pages/landing";
import RiderApp from "@/pages/rider";
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
import AdminPlatformSettingsPage from "@/pages/admin-platform-settings";
import AdminPayoutsPage from "@/pages/admin-payouts";
import AdminTestAccountsPage from "@/pages/admin-test-accounts";
import AdminPlayStoreChecklistPage from "@/pages/admin-playstore-checklist";
import AdminTrustSafetyPage from "@/pages/admin-trust-safety";
import AdminAnnouncementsPage from "@/pages/admin-announcements";
import NotificationsPage from "@/pages/notifications";
import AdminLoginPage from "@/pages/admin-login";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import WhySafeAndSecure from "@/pages/info/why-safe-and-secure";
import WhyAlwaysAvailable from "@/pages/info/why-always-available";
import WhyCityWideCoverage from "@/pages/info/why-city-wide-coverage";
import HowSignUp from "@/pages/info/how-sign-up";
import HowRequestRide from "@/pages/info/how-request-ride";
import HowPayAndGo from "@/pages/info/how-pay-and-go";
import CompanyAbout from "@/pages/info/company-about";
import CompanyCareers from "@/pages/info/company-careers";
import CompanyPress from "@/pages/info/company-press";
import SupportHelpCenter from "@/pages/info/support-help-center";
import SupportSafety from "@/pages/info/support-safety";
import SupportContact from "@/pages/info/support-contact";
import LegalTerms from "@/pages/info/legal-terms";
import LegalPrivacy from "@/pages/info/legal-privacy";
import LegalCookies from "@/pages/info/legal-cookies";
import SignupPage from "@/pages/signup";
import DriverApp from "@/pages/driver";
import DirectorPendingApproval from "@/pages/director/pending-approval";
import DirectorHome from "@/pages/director/home";
import RiderRideComplete from "@/pages/ride/complete-rider";
import DriverRideComplete from "@/pages/ride/complete-driver";

function Router() {
  // Dev-only route mount confirmation
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    console.log("[Ziba Router] Routes mounted - /login and /signup are accessible without auth");
  }
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={LoginPage} />
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
      <Route path="/admin/platform-settings" component={AdminPlatformSettingsPage} />
      <Route path="/admin/payouts" component={AdminPayoutsPage} />
      <Route path="/admin/test-accounts" component={AdminTestAccountsPage} />
      <Route path="/admin/playstore-checklist" component={AdminPlayStoreChecklistPage} />
      <Route path="/admin/trust-safety" component={AdminTrustSafetyPage} />
      <Route path="/admin/announcements" component={AdminAnnouncementsPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/why/safe-and-secure" component={WhySafeAndSecure} />
      <Route path="/why/always-available" component={WhyAlwaysAvailable} />
      <Route path="/why/city-wide-coverage" component={WhyCityWideCoverage} />
      <Route path="/how/sign-up" component={HowSignUp} />
      <Route path="/how/request-ride" component={HowRequestRide} />
      <Route path="/how/pay-and-go" component={HowPayAndGo} />
      <Route path="/company/about" component={CompanyAbout} />
      <Route path="/company/careers" component={CompanyCareers} />
      <Route path="/company/press" component={CompanyPress} />
      <Route path="/support/help-center" component={SupportHelpCenter} />
      <Route path="/support/safety" component={SupportSafety} />
      <Route path="/support/contact" component={SupportContact} />
      <Route path="/legal/terms" component={LegalTerms} />
      <Route path="/legal/privacy" component={LegalPrivacy} />
      <Route path="/legal/cookies" component={LegalCookies} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/director/pending-approval" component={DirectorPendingApproval} />
      <Route path="/director" component={DirectorHome} />
      <Route path="/ride/complete/rider" component={RiderRideComplete} />
      <Route path="/ride/complete/driver" component={DriverRideComplete} />
      <Route path="/rider/ride-complete" component={RiderRideComplete} />
      <Route path="/driver/ride-complete" component={DriverRideComplete} />
      <Route path="/rider/:rest*" component={RiderApp} />
      <Route path="/driver/:rest*" component={DriverApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RiderAuthProvider>
          <AuthProvider>
            <CountryProvider>
              <TooltipProvider>
                <TestBanner />
                <DevBanner />
                <Toaster />
                <Router />
              </TooltipProvider>
            </CountryProvider>
          </AuthProvider>
        </RiderAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
