import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/features/Hero";
// import { CategoryStrip } from "@/components/features/CategoryStrip";
import { FeaturedListings } from "@/components/features/FeaturedListings"; // Keeping import for safety, but unused
import { MobileHomeHeader } from "@/components/home/MobileHomeHeader";
import HomeFeatured from "@/components/home/HomeFeatured";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [homeFilters, setHomeFilters] = useState(null); // New state for inline search

  return (
    <main className="min-h-screen bg-white">
      {/* Search Overlay Global */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Navbar handles its own responsiveness (Desktop Header vs Mobile Bottom Nav) */}
      <Navbar />

      {/* Mobile Header (Moved to RootLayout) */}
      {/* <div className="md:hidden">
        <MobileHomeHeader onSearchClick={() => setIsSearchOpen(true)} />
      </div> */}

      {/* Desktop Hero (Now Visible on Mobile) */}
      <div className="block">
        <Hero onSearch={(filters) => setHomeFilters(filters)} />
      </div>

      {/* Unified Content (Responsive) */}
      <HomeFeatured filters={homeFilters} />

      {/* Footer (Desktop Only - Mobile has nav bar spacer) */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile Bottom Spacing for Fixed Nav */}
      <div className="lg:hidden h-20" />
    </main>
  );
}
