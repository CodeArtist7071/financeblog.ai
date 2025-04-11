import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Bitcoin, Coins, DollarSign, TrendingUp, Sun, Moon, Menu, X, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  scrolled?: boolean;
}

const Header = ({ scrolled = false }: HeaderProps) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth?.() || {};

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const shouldUseDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(shouldUseDarkMode);
    
    if (shouldUseDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    toast({
      title: newMode ? "Dark mode enabled" : "Light mode enabled",
      duration: 1500
    });
  };

  const navItems = [
    { name: "Home", path: "/", icon: <TrendingUp className="h-4 w-4 mr-1" /> },
    { name: "Crypto", path: "/category/cryptocurrency", icon: <Bitcoin className="h-4 w-4 mr-1" /> },
    { name: "Stocks", path: "/category/stocks", icon: <TrendingUp className="h-4 w-4 mr-1" /> },
    { name: "Forex", path: "/category/forex", icon: <DollarSign className="h-4 w-4 mr-1" /> },
  ];

  return (
    <header 
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-md shadow-md" 
          : "bg-background"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="relative flex items-center justify-center p-1">
                <div className="absolute inset-0 bg-primary/10 rounded-full group-hover:scale-110 transition-all duration-300"></div>
                <Coins className="h-8 w-8 text-primary relative z-10" />
              </div>
              <span className="ml-2 text-xl font-bold text-gradient">
                FinancePulse
              </span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    location === item.path
                      ? "bg-primary-50 text-primary dark:bg-primary/20"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  } transition-all duration-150 ease-in-out`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center text-foreground/80 hover:text-foreground"
              >
                <User className="h-4 w-4 mr-1" />
                {user.username || "Account"}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                asChild
              >
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground/70 hover:text-foreground hover:bg-muted"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              ) : (
                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-foreground/70 hover:text-foreground hover:bg-muted"
                aria-expanded={mobileMenuOpen ? "true" : "false"}
              >
                <span className="sr-only">{mobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96" : "max-h-0"
        }`} 
        id="mobile-menu"
      >
        <div className="px-4 py-2 space-y-1 bg-background border-t border-border/30">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${
                location === item.path
                  ? "bg-primary-50 text-primary dark:bg-primary/20"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              } flex items-center px-3 py-2 rounded-md text-sm font-medium w-full`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {!user && (
            <Link
              href="/auth"
              className="w-full mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
