import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

interface RiderUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  status: string;
  averageRating: number;
  role: string;
  isTestAccount?: boolean;
}

interface RiderAuthContextType {
  user: RiderUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRider: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<RiderUser>) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

const RiderAuthContext = createContext<RiderAuthContextType | null>(null);

export function RiderAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: user, isLoading, refetch } = useQuery<RiderUser | null>({
    queryKey: ["/api/rider/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/rider/me", { credentials: "include" });
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
      const res = await apiRequest("POST", "/api/rider/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/rider/register", data);
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/rider/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      refetch();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<RiderUser>) => {
      const res = await apiRequest("PATCH", "/api/rider/profile", data);
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateProfile = async (data: Partial<RiderUser>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const isRider = !!user && user.role === "rider";

  return (
    <RiderAuthContext.Provider
      value={{
        user: user || null,
        isLoading: !isInitialized || isLoading,
        isAuthenticated: !!user,
        isRider,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </RiderAuthContext.Provider>
  );
}

export function useRiderAuth() {
  const context = useContext(RiderAuthContext);
  if (!context) {
    throw new Error("useRiderAuth must be used within RiderAuthProvider");
  }
  return context;
}
