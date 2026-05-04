"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, AuthResponse, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  socialLogin: (provider: "google" | "facebook", token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

   useEffect(() => {
    async function loadUser() {
      // Logic moved to api.ts interceptor for headers
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Fetch user profile from /api/auth/me/
          const { data } = await api.get<User>("/auth/me/");
          setUser(data);
        } catch (error) {
           // Interceptor handles 401->Refresh->Retry or Logout
           // So this catch is just for other network errors or if refresh failed entirely
          console.error("Failed to load user");
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (credentials: any) => {
    try {
      // Clear existing tokens to avoid sending invalid Authorization header
      // which might cause 401 if JWTAuthentication fails before view permissions apply
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      console.log("Attempting login with:", { ...credentials, password: "***" });
      const { data } = await api.post<AuthResponse>("/token/", credentials);
      console.log("Login successful, tokens received");
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      // No need to set api.defaults... interceptor does it.
      
      // Fetch user immediately after login
      const userRes = await api.get<User>("/auth/me/");
      setUser(userRes.data);
      
      if (userRes.data.is_staff || userRes.data.is_superuser) {
        router.push("/admin");
      } else if (userRes.data.is_business) {
        router.push("/business/admin");
      } else if (userRes.data.is_instructor) {
        router.push("/instructor/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login failed with details:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (credentials: any) => {
    try {
      await api.post("/auth/register/", credentials);
      // Automatically login after register or redirect to login? 
      // Plan said redirect to login.
      router.push("/login"); 
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const socialLogin = async (provider: "google" | "facebook", token: string) => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      const { data } = await api.post<AuthResponse>(`/auth/${provider}/`, { token });
      
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      const userRes = await api.get<User>("/auth/me/");
      setUser(userRes.data);
      
      if (userRes.data.is_staff || userRes.data.is_superuser) {
        router.push("/admin");
      } else if (userRes.data.is_business) {
        router.push("/business/admin");
      } else if (userRes.data.is_instructor) {
        router.push("/instructor/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error(`${provider} login failed:`, error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setLoading(true); // Prevent 404 flash/race during redirect
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    // api.defaults... handled by interceptor check
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, socialLogin, logout }}>
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
