import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
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
      <Route path="/users">
        <ProtectedRoute allowedRoles={["user", "admin"]}>
          <UsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/drivers">
        <ProtectedRoute allowedRoles={["admin"]}>
          <DriversPage />
        </ProtectedRoute>
      </Route>
      <Route path="/directors">
        <ProtectedRoute allowedRoles={["director", "admin"]}>
          <DirectorsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/rides">
        <ProtectedRoute allowedRoles={["user", "admin"]}>
          <RidesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
          <AdminPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
          <AdminUsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/drivers">
        <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
          <AdminDriversPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/rides">
        <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
          <AdminRidesPage />
        </ProtectedRoute>
      </Route>
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
