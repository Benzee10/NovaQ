import * as React from "react";
import { Layout } from "@/components/layout";
import { ProfileCard } from "@/components/profile-card";
import { useListProfiles } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilesDirectory() {
  const { data: profiles, isLoading } = useListProfiles();
  const [search, setSearch] = React.useState("");

  const filteredProfiles = React.useMemo(() => {
    if (!profiles) return [];
    if (!search.trim()) return profiles;
    const query = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.location.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.bio.toLowerCase().includes(query)
    );
  }, [profiles, search]);

  return (
    <Layout>
      <div className="py-12 px-4 sm:px-6">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">Directory</h1>
          <p className="text-muted-foreground text-lg">Browse our exclusive collection of verified profiles.</p>
        </div>

        {/* Filter Bar */}
        <div className="max-w-xl mx-auto mb-12 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search by location, name, or keywords..."
            className="pl-12 pr-4 h-14 text-lg rounded-full bg-card shadow-lg shadow-black/5 border-border/50 focus-visible:ring-primary focus-visible:border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProfiles.map((profile, i) => (
              <ProfileCard key={profile.id} profile={profile} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 glass-panel rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">No matches found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
