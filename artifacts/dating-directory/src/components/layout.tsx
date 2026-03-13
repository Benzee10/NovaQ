import * as React from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Heart, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = React.useState(true); // Default to premium dark mode
  const [location] = useLocation();

  React.useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-x-0 border-t-0 rounded-none px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-serif font-bold text-xl tracking-wide text-foreground">
            Lumière
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {location !== "/admin" && (
             <Link href="/profiles" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors font-sans hidden sm:block">
               Browse Profiles
             </Link>
          )}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-accent text-accent-foreground hover-elevate transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-border bg-card/30 backdrop-blur-sm text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground justify-center">
            <span className="font-serif italic text-lg">Lumière</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="text-xs uppercase tracking-widest font-bold">Premium Directory</span>
          </div>
          
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-xs sm:text-sm font-medium max-w-md mx-auto flex items-start sm:items-center gap-3 text-left sm:text-center">
            <div className="bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold">18+</div>
            <p>This platform contains profiles of verified adults. By using this service, you confirm you are 18 years of age or older.</p>
          </div>
          
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors mt-4">
            <LockKeyhole className="w-3 h-3" /> Admin Access
          </Link>
        </div>
      </footer>
    </div>
  );
}
