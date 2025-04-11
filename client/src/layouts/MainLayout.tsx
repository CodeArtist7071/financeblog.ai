import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[30%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl opacity-50 dark:opacity-20" />
        <div className="absolute -bottom-[40%] -left-[30%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl opacity-50 dark:opacity-20" />
        <div className="absolute inset-0 bg-dots-pattern bg-[length:20px_20px] opacity-[0.15]" />
      </div>
      
      <Header scrolled={scrolled} />
      
      <main className="flex-grow animate-fade-in">
        {children}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default MainLayout;
