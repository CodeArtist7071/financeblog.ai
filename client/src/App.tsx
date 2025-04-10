import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/posts/:slug" component={BlogPost} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/admin/dashboard" adminOnly>
              <Route path="/admin/dashboard">
                {() => {
                  const Dashboard = require("./pages/admin/dashboard").default;
                  return <Dashboard />;
                }}
              </Route>
            </ProtectedRoute>
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
