import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container-custom py-16 md:py-24 lg:py-32 min-h-[70vh] flex flex-col items-center justify-center">
      <SEO 
        title="Page Not Found - 404 Error"
        description="The page you're looking for doesn't exist or has been moved."
      />
      
      <div className="mx-auto max-w-2xl text-center animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/10 rounded-full blur-lg"></div>
            <div className="relative p-3 bg-background rounded-full border border-border">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient animate-slide-up">
          404 - Page Not Found
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground max-w-prose animate-slide-up stagger-1">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up stagger-2">
          <Button className="rounded-full group" size="lg" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:animate-slide-right" />
              Back to Home
            </Link>
          </Button>
          
          <Button variant="outline" className="rounded-full" size="lg" asChild>
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              Browse Articles
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-16 max-w-2xl">
        <Card className="animate-fade-in stagger-3 border-border/40 bg-card/50 shadow-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Looking for something specific?</h3>
            <p className="text-muted-foreground mb-4">
              Check out these popular categories to find what you're looking for.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Link href="/category/cryptocurrency">
                <span className="badge-bitcoin">Cryptocurrency</span>
              </Link>
              <Link href="/category/stocks">
                <span className="badge-primary">Stocks</span>
              </Link>
              <Link href="/category/forex">
                <span className="badge-secondary">Forex</span>
              </Link>
              <Link href="/category/personal-finance">
                <span className="badge-outline">Personal Finance</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
