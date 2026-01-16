import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

interface DriverUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  status: string;
  averageRating: number;
  role: string;
  isTestAccount?: boolean;
}

interface DriverAuthContextType {
  user: DriverUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDriver: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<DriverUser>) => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextType | null>(null);

export function DriverAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: user, isLoading, refetch } = useQuery<DriverUser | null>({
    queryKey: ["/api/driver/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/driver/me", { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/driver/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/driver/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      refetch();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<DriverUser>) => {
      const res = await apiRequest("PATCH", "/api/driver/profile", data);
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateProfile = async (data: Partial<DriverUser>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const isDriver = !!user && user.role === "driver";

  return (
    <DriverAuthContext.Provider
      value={{
        user: user || null,
        isLoading: !isInitialized || isLoading,
        isAuthenticated: !!user,
        isDriver,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
}

export function useDriverAuth() {
  const context = useContext(DriverAuthContext);
  if (!context) {
    throw new Error("useDriverAuth must be used within DriverAuthProvider");
  }
  return context;
}
