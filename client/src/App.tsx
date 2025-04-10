import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/posts/:slug" component={BlogPost} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    </QueryClientProvider>
  );
}

export default App;
