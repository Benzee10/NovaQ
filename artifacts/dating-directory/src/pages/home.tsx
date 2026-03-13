import * as React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useListProfiles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProfileCard } from "@/components/profile-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: profiles, isLoading } = useListProfiles();

  // Safely limit to 6 for the preview grid
  const previewProfiles = profiles?.slice(0, 6) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden rounded-3xl mt-4 sm:mt-8 min-h-[60vh] flex items-center justify-center px-4 sm:px-8 py-20 border border-border shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Luxurious abstract background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-secondary/30 text-secondary-foreground mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Premium Selection</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-foreground leading-[1.1] mb-6"
          >
            Meet Real Women <br className="hidden sm:block" />
            <span className="text-gradient-gold italic pr-2">Near You</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg sm:text-xl text-muted-foreground font-sans max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Discover verified profiles of sophisticated women looking for genuine connections. Browse securely and contact directly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Link href="/profiles">
              <Button size="lg" className="rounded-full px-8 text-lg font-serif tracking-wide shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1">
                Explore Directory <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Preview Grid */}
      <section className="py-24 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">Featured Profiles</h2>
            <p className="text-muted-foreground">A curated selection of our newest members.</p>
          </div>
          <Link href="/profiles" className="hidden sm:inline-flex items-center text-primary font-semibold hover:underline underline-offset-4">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : previewProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {previewProfiles.map((profile, i) => (
              <ProfileCard key={profile.id} profile={profile} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">No profiles available yet.</p>
          </div>
        )}
        
        <div className="mt-12 text-center sm:hidden">
          <Link href="/profiles">
            <Button variant="outline" className="w-full">View All Profiles</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
