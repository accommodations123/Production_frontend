import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PeopleHero from "../components/PeopleHero";
import PeopleFilters from "../components/PeopleFilters";
import PeopleCard from "../components/PeopleCard";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/button";
import { Users, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { useGetPublicProfilesQuery } from "@/store/api/peopleApi";
import { COUNTRIES } from "@/lib/mock-data";

export default function PeopleHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const selectedCategory = searchParams.get("category") || "all";

  const peopleApiQueries = useSelector((state) => state.peopleApi?.queries || {});

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

  // Directory Filter States
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  // Pagination limit count
  const [limit, setLimit] = useState(12);

  // Build params for API query
  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    };

    if (selectedCountry !== "all") {
      params.country = selectedCountry;
    }

    if (selectedLocation !== "all") {
      const parts = selectedLocation.split(",");
      if (parts.length >= 2) {
        params.city = parts[0].trim();
        if (selectedCountry === "all") {
          params.country = parts[1].trim();
        }
      } else {
        params.city = selectedLocation.trim();
      }
    }

    return params;
  }, [selectedCategory, selectedCountry, selectedLocation, limit]);

  // Fetch live profiles from backend API
  const { data, isLoading, isFetching, isError, refetch } = useGetPublicProfilesQuery(queryParams);

  const peopleList = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.people)) return data.people;
    if (Array.isArray(data.profiles)) return data.profiles;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data?.people)) return data.data.people;
    if (Array.isArray(data.data?.profiles)) return data.data.profiles;
    if (Array.isArray(data.data?.items)) return data.data.items;
    if (Array.isArray(data.data?.results)) return data.data.results;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const totalCount = data?.total || data?.data?.total || peopleList.length;

  // Comprehensive filtering across search, category, country, city, experience, rating
  const filteredPeople = useMemo(() => {
    return peopleList.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesProfession = p.profession?.toLowerCase().includes(q);
        const matchesHeadline = p.headline?.toLowerCase().includes(q);
        const matchesSkills = Array.isArray(p.skills) && p.skills.some((s) => s.toLowerCase().includes(q));
        const matchesBio = p.bio?.toLowerCase().includes(q);
        if (!matchesName && !matchesProfession && !matchesHeadline && !matchesSkills && !matchesBio) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory && selectedCategory !== "all") {
        const pCat = (p.category || "").toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (pCat !== sCat && !pCat.includes(sCat) && !sCat.includes(pCat)) {
          return false;
        }
      }

      // 3. Country
      if (selectedCountry && selectedCountry !== "all") {
        const pCountry = (p.country || "").toLowerCase().trim();
        const sCountry = selectedCountry.toLowerCase().trim();
        if (pCountry !== sCountry && !pCountry.includes(sCountry) && !sCountry.includes(pCountry)) {
          return false;
        }
      }

      // 4. Location / City
      if (selectedLocation && selectedLocation !== "all") {
        const pCity = (p.city || "").toLowerCase().trim();
        const pCountry = (p.country || "").toLowerCase().trim();
        const sLoc = selectedLocation.toLowerCase().trim();
        const fullLoc = `${pCity}, ${pCountry}`;
        if (pCity !== sLoc && fullLoc !== sLoc && !fullLoc.includes(sLoc)) {
          return false;
        }
      }

      // 5. Rating
      if (selectedRating && selectedRating !== "all") {
        const minRating = Number(selectedRating);

        // Check if there are cached live reviews in RTK Query for this expert
        const targetId = String(p.id || p._id || "");
        let liveReviews = [];
        for (const [key, q] of Object.entries(peopleApiQueries)) {
          if (key.startsWith("getExpertReviews") && key.includes(targetId) && q?.data) {
            liveReviews = Array.isArray(q.data)
              ? q.data
              : Array.isArray(q.data?.data)
              ? q.data.data
              : Array.isArray(q.data?.reviews)
              ? q.data.reviews
              : [];
            if (liveReviews.length > 0) break;
          }
        }

        const reviewCount = liveReviews.length > 0
          ? liveReviews.length
          : Number(
              p.review_count ??
              p.reviewCount ??
              p.reviews_count ??
              p.total_reviews ??
              p.stats?.review_count ??
              (Array.isArray(p.reviews) ? p.reviews.length : 0)
            );

        const liveAvg = liveReviews.length > 0
          ? (liveReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / liveReviews.length)
          : 0;

        const dbRating = Number(
          p.rating ??
          p.avg_rating ??
          p.average_rating ??
          p.rating_average ??
          p.stats?.rating ??
          (Array.isArray(p.reviews) && p.reviews.length
            ? (p.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / p.reviews.length)
            : (reviewCount > 0 ? 5 : 0))
        );

        const pRating = liveAvg > 0 ? liveAvg : dbRating;

        if (pRating < minRating) {
          return false;
        }
      }

      // 6. Experience
      if (selectedExperience && selectedExperience !== "all") {
        const expMatch = String(p.experience || p.headline || p.profession || "").match(/(\d+)\s*(?:years?|yrs?)/i);
        const years = expMatch
          ? parseInt(expMatch[1], 10)
          : Number(p.yearsOfExperience || p.years_of_experience || (p.experiences?.length ? p.experiences.length : 1));

        if (selectedExperience === "junior" && (years < 1 || years > 4)) return false;
        if (selectedExperience === "mid" && (years < 5 || years > 9)) return false;
        if (selectedExperience === "senior" && years < 10) return false;
      }

      return true;
    });
  }, [
    peopleList,
    searchQuery,
    selectedCategory,
    selectedCountry,
    selectedLocation,
    selectedRating,
    selectedExperience,
    peopleApiQueries
  ]);

  // Extract unique locations for filtering dropdown dynamically from fetched data
  const locations = useMemo(() => {
    if (!peopleList.length) return [];
    const unique = new Set();
    peopleList.forEach((p) => {
      if (p.city) {
        unique.add(p.city);
      }
    });
    return Array.from(unique).sort();
  }, [peopleList]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setSelectedCountry("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedRating("all");
    setLimit(12);
  };

  const hasMore = peopleList.length < totalCount;

  const handleLoadMore = () => {
    setLimit((prev) => prev + 6);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-20 lg:pt-24">
        {/* Banner Hero */}
        <PeopleHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalCount={totalCount} />

        {/* Directory Layout Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Filters Bar component */}
          <PeopleFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            onReset={handleResetFilters}
            availableLocations={locations}
            availableCountries={COUNTRIES}
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


        </div>
      </main>
      <Footer />
    </div>
  );
}
