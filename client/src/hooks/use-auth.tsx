import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<{user: User} | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // The API returns { user: User } so we need to extract the user
  const user = userData?.user;

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        email: credentials.username, // API expects email
        password: credentials.password
      });
      const data = await res.json();
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], { user });
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error) => {
      console.error("Login error:", error);
      
      // Provide more helpful error messages based on common issues
      let errorMessage = "Invalid credentials";
      
      if (error.message) {
        if (error.message.includes("401")) {
          errorMessage = "Invalid username or password";
        } else if (error.message.includes("404")) {
          errorMessage = "Account not found";
        } else if (error.message.includes("network") || error.message.includes("failed to fetch")) {
          errorMessage = "Network error - please check your connection";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/auth/register", {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      const data = await res.json();
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], { user });
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      
      // Provide more helpful error messages based on common issues
      let errorMessage = "Could not create account";
      
      if (error.message) {
        if (error.message.includes("409")) {
          errorMessage = "This email is already registered";
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid registration data";
        } else if (error.message.includes("network") || error.message.includes("failed to fetch")) {
          errorMessage = "Network error - please check your connection";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}