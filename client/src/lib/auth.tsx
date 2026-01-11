import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "./queryClient";

export type UserRole = "user" | "director" | "admin";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  needsPasswordSetup?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ needsPasswordSetup?: boolean }>;
  setupPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
          needsPasswordSetup: data.needsPasswordSetup,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string, role: UserRole) {
    const res = await apiRequest("POST", "/api/auth/login", { email, password, role });
    const data = await res.json();
    
    if (data.needsPasswordSetup) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || role,
        needsPasswordSetup: true,
      });
      return { needsPasswordSetup: true };
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role || role,
      fullName: data.user.fullName,
      needsPasswordSetup: false,
    });
    return {};
  }

  async function setupPassword(password: string) {
    await apiRequest("POST", "/api/auth/setup-password", { password });
    if (user) {
      setUser({ ...user, needsPasswordSetup: false });
    }
  }

  async function logout() {
    await apiRequest("POST", "/api/auth/logout", {});
    setUser(null);
    queryClient.clear();
    setLocation("/");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, setupPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
