import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PeopleHero from "../components/PeopleHero";
import PeopleFilters from "../components/PeopleFilters";
import PeopleCard from "../components/PeopleCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/button";
import { Users, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { useGetPublicProfilesQuery } from "@/store/api/peopleApi";

export default function PeopleHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const selectedCategory = searchParams.get("category") || "all";

  const setSearchQuery = (val) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set("query", val);
    } else {
      nextParams.delete("query");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const setSelectedCategory = (val) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val && val !== "all") {
      nextParams.set("category", val);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Pagination limit count
  const [limit, setLimit] = useState(12);

  // Build params for API query
  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      verified: verifiedOnly ? "true" : undefined,
    };

    if (selectedLocation !== "all") {
      const parts = selectedLocation.split(",");
      if (parts.length >= 2) {
        params.city = parts[0].trim();
        params.country = parts[1].trim();
      } else {
        params.city = selectedLocation.trim();
      }
    }

    if (selectedRating !== "all") {
      params.min_rating = Number(selectedRating);
    }

    return params;
  }, [selectedCategory, selectedLocation, selectedRating, verifiedOnly, limit]);

  // Fetch live profiles from backend API
  const { data, isLoading, isFetching, isError, refetch } = useGetPublicProfilesQuery(queryParams);

  const peopleList = data?.results || [];
  const totalCount = data?.total || peopleList.length;

  // Additional client-side search filtering if searchQuery is typed in search bar
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return peopleList;
    const q = searchQuery.toLowerCase().trim();

    return peopleList.filter((p) => {
      const matchesName = p.name?.toLowerCase().includes(q);
      const matchesProfession = p.profession?.toLowerCase().includes(q);
      const matchesSkills = Array.isArray(p.skills) && p.skills.some((s) => s.toLowerCase().includes(q));
      const matchesBio = p.bio?.toLowerCase().includes(q);
      return matchesName || matchesProfession || matchesSkills || matchesBio;
    });
  }, [peopleList, searchQuery]);

  // Extract unique locations for filtering dropdown dynamically from fetched data
  const locations = useMemo(() => {
    if (!peopleList.length) return [];
    const unique = new Set();
    peopleList.forEach((p) => {
      if (p.city && p.country) {
        unique.add(`${p.city}, ${p.country}`);
      }
    });
    return Array.from(unique).sort();
  }, [peopleList]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedRating("all");
    setVerifiedOnly(false);
    setLimit(12);
  };

  const hasMore = peopleList.length < totalCount;

  const handleLoadMore = () => {
    setLimit((prev) => prev + 6);
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
              {isLoading ? (
                "Loading advisors..."
              ) : (
                `Showing ${filteredPeople.length} of ${totalCount} experts`
              )}
            </span>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 py-4">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
              <p className="text-slate-700 font-bold">Failed to load professionals.</p>
              <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
                Try Again
              </Button>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200">
              <EmptyState
                icon={Users}
                title="No Advisors Match Your Search"
                description="Try broadening your criteria, selecting another domain category, or clearing the filter settings."
                actionText="Reset Search Filter"
                onActionClick={handleResetFilters}
              />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Professionals grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeople.map((person) => (
                  <PeopleCard key={person.id} person={person} />
                ))}
              </div>

              {/* Load More pagination button */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    variant="outline"
                    className="h-11 px-6 rounded-xl text-slate-700 font-bold border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </>
                    ) : (
                      <>
                        Load More Experts <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Sticky CTA section */}
          <div className="bg-[#00142E] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Are you a relocation expert?
              </h3>
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
