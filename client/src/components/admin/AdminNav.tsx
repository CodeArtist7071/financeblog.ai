import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Home, LayoutDashboard, BarChart2, FileText, MessageSquare, Settings } from "lucide-react";

export function AdminNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { 
      label: "Dashboard", 
      href: "/admin/dashboard", 
      icon: <LayoutDashboard className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Analytics", 
      href: "/admin/analytics", 
      icon: <BarChart2 className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Posts", 
      href: "/admin/posts", 
      icon: <FileText className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Comments", 
      href: "/admin/comments", 
      icon: <MessageSquare className="h-4 w-4 mr-2" /> 
    },
    { 
      label: "Settings", 
      href: "/admin/settings", 
      icon: <Settings className="h-4 w-4 mr-2" /> 
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="bg-card border-b mb-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center text-primary font-semibold mr-8">
                <Home className="h-5 w-5 mr-2" />
                <span>Finance Blog</span>
              </a>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}>
                      {item.icon}
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {user?.username || 'Admin'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}