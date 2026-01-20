import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type User } from "./api";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  impersonate: (userId: string) => Promise<User>;
  stopImpersonating: () => Promise<User>;
  signup: (data: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.auth.login(username, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: string;
    }) => api.auth.signup(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  const login = async (username: string, password: string): Promise<User> => {
    return loginMutation.mutateAsync({ username, password });
  };

  const impersonate = async (userId: string): Promise<User> => {
    const response = await fetch(`/api/auth/impersonate/${userId}`, { method: "POST" });
    if (!response.ok) throw new Error("Failed to impersonate");
    const data = await response.json();
    queryClient.setQueryData(["auth", "me"], data);
    return data;
  };

  const stopImpersonating = async (): Promise<User> => {
    const response = await fetch("/api/auth/impersonate/stop", { method: "POST" });
    if (!response.ok) throw new Error("Failed to stop impersonating");
    const data = await response.json();
    queryClient.setQueryData(["auth", "me"], data);
    return data;
  };

  const signup = async (data: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
  }): Promise<User> => {
    return signupMutation.mutateAsync(data);
  };

  const logout = async (): Promise<void> => {
    return logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, impersonate, stopImpersonating, signup, logout }}>
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
