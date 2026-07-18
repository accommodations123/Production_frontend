import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/shared/layout/Navbar";
import { Footer } from "@/shared/layout/Footer";
import PeopleHero from "../components/PeopleHero";
import PeopleFilters from "../components/PeopleFilters";
import PeopleCard from "../components/PeopleCard";
import { MOCK_PEOPLE } from "../data/people";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/button";
import { Users, Sparkles, ChevronDown } from "lucide-react";

export default function PeopleHome() {
  // Load initial list from local state to pick up new registrants
  const [peopleList, setPeopleList] = useState(() => {
    const saved = localStorage.getItem("kinlife_people");
    return saved ? JSON.parse(saved) : MOCK_PEOPLE;
  });

  // Filter criteria states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Pagination count
  const [visibleCount, setVisibleCount] = useState(6);

  // Extract unique locations for filtering dropdown
  const locations = useMemo(() => {
    const unique = new Set(peopleList.map(p => `${p.city}, ${p.country}`));
    return Array.from(unique).sort();
  }, [peopleList]);

  // Handle clear/reset action
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedRating("all");
    setVerifiedOnly(false);
    setVisibleCount(6);
  };

  // Perform list searches/filters
  const filteredPeople = useMemo(() => {
    return peopleList.filter((p) => {
      // 1. Text Search query (Name, Title, Skills, Bio)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesProfession = p.profession.toLowerCase().includes(query);
        const matchesSkills = p.skills.some((s) => s.toLowerCase().includes(query));
        const matchesBio = p.bio.toLowerCase().includes(query);

        if (!matchesName && !matchesProfession && !matchesSkills && !matchesBio) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }

      // 3. Location filter
      if (selectedLocation !== "all") {
        const pLocation = `${p.city}, ${p.country}`;
        if (pLocation !== selectedLocation) {
          return false;
        }
      }

      // 4. Experience filter
      if (selectedExperience !== "all") {
        const years = parseInt(p.experience.replace(/\D/g, ""), 10) || 0;
        if (selectedExperience === "junior" && years >= 5) return false;
        if (selectedExperience === "mid" && (years < 5 || years >= 10)) return false;
        if (selectedExperience === "senior" && years < 10) return false;
      }

      // 5. Rating filter
      if (selectedRating !== "all") {
        const minRating = parseFloat(selectedRating);
        if (p.rating < minRating) {
          return false;
        }
      }

      // 6. Verified filter
      if (verifiedOnly && !p.verified) {
        return false;
      }

      return true;
    });
  }, [peopleList, searchQuery, selectedCategory, selectedLocation, selectedExperience, selectedRating, verifiedOnly]);

  const displayedPeople = filteredPeople.slice(0, visibleCount);
  const hasMore = filteredPeople.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">


      <main className="flex-grow">

        {/* Banner Hero */}
        <PeopleHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Directory Layout Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* Filters Bar component */}
          <PeopleFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            onReset={handleResetFilters}
            availableLocations={locations}
          />

          {/* Directory Listings Count indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
              Available Support Advisors
            </h2>
            <span className="text-xs font-bold text-[#717171]">
              Showing {displayedPeople.length} of {filteredPeople.length} experts
            </span>
          </div>

          {/* Listing Grid / Zero State handler */}
          {displayedPeople.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200">
              <EmptyState
                icon={Users}
                title="No Advisors Match Your Search"
                description="Try broadening your criteria, selecting another helper domain category, or clearing the filter settings."
                actionText="Reset Search Filter"
                onActionClick={handleResetFilters}
              />
            </div>
          ) : (
            <div className="space-y-10">

              {/* Professionals grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPeople.map((person) => (
                  <PeopleCard key={person.id} person={person} />
                ))}
              </div>

              {/* Load More pagination button */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="h-11 px-6 rounded-xl text-slate-700 font-bold border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    Load More Experts <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              )}

            </div>
          )}

          {/* Sticky CTA section */}
          <div className="bg-[#00142E] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Are you a relocation expert?</h3>
              <p className="text-[#717171] text-sm leading-relaxed">
                Start helping expat newcomers settle in your home city. Set your own hours, define services, and grow your local network.
              </p>
            </div>
            <Link to="/people/become" className="z-10 shrink-0">
              <Button className="h-12 px-6 bg-white hover:bg-slate-100 text-[#00142E] font-bold rounded-xl active:scale-95 transition-all cursor-pointer">
                Join as an Expert <Sparkles className="w-4 h-4 ml-1.5 text-[#E1392A]" />
              </Button>
            </Link>
          </div>

        </div>

      </main>


    </div>
  );
}
