import { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { SEO, SEOProps } from "@/components/SEO";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  seo?: SEOProps;
}

export default function AdminLayout({ 
  children,
  title = "Admin Panel",
  description = "Manage your finance and crypto blog content",
  seo
}: AdminLayoutProps) {
  return (
    <>
      <SEO 
        title={seo?.title || title}
        description={seo?.description || description}
        {...seo}
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <AdminNav />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {!seo && title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            
            {children}
          </div>
        </main>
        
        <footer className="border-t py-4 bg-card">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Finance Blog Admin Panel. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}