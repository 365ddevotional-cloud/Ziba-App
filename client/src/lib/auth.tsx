import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface Admin {
  id: string;
  email: string;
  phone?: string;
  isPasswordSet: boolean;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminSetup: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  checkAdminStatus: () => Promise<{ needsSetup: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const [userRes, adminRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/me"),
      ]);
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
      
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdmin(adminData);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Login failed");
    }
    
    const userData = await res.json();
    setUser(userData);
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed");
    }
    
    const userData = await res.json();
    setUser(userData);
  }

  async function adminLogin(email: string, password: string) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Admin login failed");
    }
    
    const adminData = await res.json();
    setAdmin(adminData);
  }

  async function adminSetup(password: string) {
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Admin setup failed");
    }
    
    const adminData = await res.json();
    setAdmin(adminData);
  }

  async function checkAdminStatus(): Promise<{ needsSetup: boolean }> {
    const res = await fetch("/api/admin/status");
    if (!res.ok) {
      throw new Error("Failed to check admin status");
    }
    return res.json();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function adminLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      isLoading,
      login,
      register,
      adminLogin,
      adminSetup,
      logout,
      adminLogout,
      checkAdminStatus,
    }}>
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

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !admin) {
      setLocation("/admin/login");
    }
  }, [admin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!admin) return null;

  return <>{children}</>;
}
