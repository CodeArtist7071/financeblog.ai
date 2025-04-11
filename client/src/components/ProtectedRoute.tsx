import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

type ProtectedRouteProps = RouteProps & {
  adminOnly?: boolean;
};

export function ProtectedRoute({
  path,
  adminOnly = false,
  children,
  ...rest
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If admin only and user is not an admin, redirect to home
  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/" />;
  }

  return <Route path={path} {...rest}>{children}</Route>;
}