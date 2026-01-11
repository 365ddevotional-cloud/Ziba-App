import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import Landing from "@/pages/landing";
import UsersPage from "@/pages/users";
import DriversPage from "@/pages/drivers";
import DirectorsPage from "@/pages/directors";
import RidesPage from "@/pages/rides";
import AdminPage from "@/pages/admin";
import AdminUsersPage from "@/pages/admin-users";
import AdminDriversPage from "@/pages/admin-drivers";
import AdminRidesPage from "@/pages/admin-rides";
import { UserLoginPage, DirectorLoginPage, AdminLoginPage } from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={UserLoginPage} />
      <Route path="/director/login" component={DirectorLoginPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/drivers" component={DriversPage} />
      <Route path="/directors" component={DirectorsPage} />
      <Route path="/rides" component={RidesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/drivers" component={AdminDriversPage} />
      <Route path="/admin/rides" component={AdminRidesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
