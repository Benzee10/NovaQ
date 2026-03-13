import * as React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfileImage } from "@/lib/utils";
import type { Profile } from "@workspace/api-client-react";

interface ProfileCardProps {
  profile: Profile;
  index?: number;
}

export function ProfileCard({ profile, index = 0 }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group h-full flex flex-col border-border/50 hover:border-primary/50 transition-colors duration-500 hover:shadow-2xl hover:shadow-primary/5 bg-card/40 backdrop-blur-sm">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
          
          <img
            src={getProfileImage(profile.photoUrl, profile.id)}
            alt={profile.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {profile.verified && (
              <Badge variant="verified" className="shadow-lg backdrop-blur-md bg-background/80">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20">
            <h3 className="text-2xl font-serif font-bold text-foreground drop-shadow-md flex items-end gap-2">
              {profile.name}, <span className="text-xl font-sans font-light opacity-90">{profile.age}</span>
            </h3>
            <div className="flex items-center text-sm font-medium text-foreground/80 mt-1 drop-shadow">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
              {profile.location}
            </div>
          </div>
        </div>

        <CardContent className="flex flex-col flex-1 p-5 pt-4">
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
            {profile.bio || "No bio provided."}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
            {profile.interests?.slice(0, 3).map((interest: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-accent text-accent-foreground font-medium uppercase tracking-wider">
                {interest}
              </span>
            ))}
            {(profile.interests?.length || 0) > 3 && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-transparent border border-border text-muted-foreground font-medium">
                +{profile.interests!.length - 3}
              </span>
            )}
          </div>

          <Link href={`/profiles/${profile.id}`} className="block w-full">
            <Button className="w-full font-serif text-lg tracking-wide group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              View Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
