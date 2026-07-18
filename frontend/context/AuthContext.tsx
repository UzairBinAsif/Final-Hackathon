"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "technician";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for token and user on mount
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user from localStorage", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: loggedInUser, token: receivedToken } = response.data;

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setToken(receivedToken);
      setUser(loggedInUser);

      // Redirect based on role
      if (loggedInUser.role === "admin") {
        router.push("/dashboard");
      } else if (loggedInUser.role === "technician") {
        router.push("/my-issues");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Login failed";
      throw new Error(errMsg);
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      await api.post("/auth/register", { name, email, password, role: "technician" });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Registration failed";
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
