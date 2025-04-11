import { Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/admin/dashboard";
import Analytics from "./pages/admin/analytics";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SEO } from "./components/SEO";

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SEO /> {/* Default SEO tags */}
          <MainLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/posts/:slug" component={BlogPost} />
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/admin/dashboard" component={Dashboard} adminOnly />
              <ProtectedRoute path="/admin/analytics" component={Analytics} adminOnly />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
