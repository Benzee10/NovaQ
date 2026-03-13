import * as React from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetProfile } from "@workspace/api-client-react";
import { getProfileImage, formatWhatsAppLink } from "@/lib/utils";
import { MapPin, ShieldCheck, MessageCircle, Calendar, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ProfileDetail() {
  const [, params] = useRoute("/profiles/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, isLoading, error } = useGetProfile(id, {
    query: { enabled: !!id } as any
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 sm:p-8 animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-[60vh] bg-muted rounded-3xl"></div>
          <div className="w-full md:w-1/2 space-y-4 pt-8">
            <div className="h-10 bg-muted rounded-lg w-1/2"></div>
            <div className="h-6 bg-muted rounded-lg w-1/3"></div>
            <div className="h-32 bg-muted rounded-lg w-full mt-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-3xl font-serif font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-8">This profile may have been removed or is currently inactive.</p>
          <Link href="/profiles">
            <Button>Return to Directory</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const waLink = formatWhatsAppLink(profile.whatsapp, `Hi ${profile.name}, I saw your profile on Lumière Directory!`);

  return (
    <Layout>
      <div className="px-4 py-6 sm:py-10 max-w-6xl mx-auto w-full">
        <Link href="/profiles" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column - Large Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="sticky top-24 relative rounded-[2rem] overflow-hidden shadow-2xl border border-border bg-card">
              <div className="aspect-[3/4] w-full relative">
                <img
                  src={getProfileImage(profile.photoUrl, profile.id)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                
                {profile.verified && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="verified" className="bg-background/90 backdrop-blur-md px-3 py-1.5 shadow-xl">
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-primary" /> Verified Profile
                    </Badge>
                  </div>
                )}
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground drop-shadow-md flex items-end gap-3">
                    {profile.name} <span className="text-3xl font-sans font-light opacity-80">{profile.age}</span>
                  </h1>
                  <div className="flex items-center text-lg font-medium text-foreground/90 mt-2">
                    <MapPin className="w-5 h-5 mr-1.5 text-primary" />
                    {profile.location}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="glass-panel rounded-3xl p-8 sm:p-10 mb-8 flex-1">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/50">
                <h2 className="text-2xl font-serif font-semibold">About</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Joined {joinDate}
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert prose-p:leading-relaxed max-w-none text-muted-foreground font-sans">
                {profile.bio.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-4">Interests & Lifestyle</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="bg-card rounded-3xl p-8 border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-2xl font-serif font-bold mb-2">Interested in connecting?</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Reach out directly via WhatsApp. Please be respectful and courteous in your initial message.
              </p>
              
              <Button 
                variant="whatsapp" 
                size="lg" 
                className="w-full sm:w-auto min-w-[240px] text-lg py-7 rounded-2xl group"
                onClick={() => window.open(waLink, '_blank')}
              >
                <MessageCircle className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" /> 
                Message on WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
