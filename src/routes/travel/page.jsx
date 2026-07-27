import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Plus, Globe, RotateCcw, HelpCircle, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getHostPath } from "@/shared/utils/navigationUtils";

import { useAuth } from "@/shared/hooks/useAuth";
import {
  useGetMyTripsQuery,
  useGetPublicTripsQuery
} from "@/store/api/travelApi";
import { resolveImageUrl } from "@/shared/utils/imageUtils";
import { extractSocials } from "@/shared/utils/socialExtract";
import { normalizeCountryName } from "@/shared/utils/countryUtils";

// Extracted Constants
import {
  colorStyles,
} from "@/features/travel/constants";

// Child Components
import TravelFilter from "@/features/travel/components/TravelFilter";
import TravelPartnerCard from "@/features/travel/components/TravelPartnerCard";

// Lazy Loaded Modals for Performance
const PostTripModal = lazy(() => import("@/features/travel/components/PostTripModal"));

import { Toaster } from "sonner";

export default function TravelPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
  });

  // API Hooks
  const { refetch: refetchMyTrips } = useGetMyTripsQuery(undefined, {
    skip: !currentUser
  });


  // Mapping utility to transform backend trip to frontend structure
  const mapTripToPlan = useCallback((trip) => {
    const normalizeCountry = (c) => normalizeCountryName(c);

    const socials = extractSocials(trip);

    // Handle user's new "My Trips" structure (Lightweight response)
    if (trip.sent_matches || trip.received_matches) {
      return {
        id: trip.id,
        host_id: currentUser?.id,
        matches: [
          ...(trip.sent_matches || []),
          ...(trip.received_matches || [])
        ],
        user: { fullName: currentUser?.fullName || "Me", image: resolveImageUrl(currentUser?.image || null) },
        flight: {
          from: trip.from_city || "",
          to: trip.to_city || "",
          from_country: normalizeCountry(trip.from_country || ""),
        },
        destination: trip.to_city ? `${trip.to_city}` : "",
        date: trip.travel_date,
        status: trip.status || "active",
        socials: socials
      };
    }

    // Handle revised pre-formatted response from backend (host + trip_meta structure)
    if (trip.flight && trip.host && trip.trip_meta) {
      return {
        ...trip,
        matches: trip.matches || [],
        host_id: trip.host?.id,
        flight: {
          ...trip.flight,
          from_country: normalizeCountry(trip.flight.from_country || trip.from_country || trip.host.country)
        },
        user: {
          fullName: trip.host?.full_name || trip.user?.fullName || "Traveler",
          age: trip.trip_meta?.age || trip.user?.age || null,
          gender: trip.user?.gender || "",
          country: normalizeCountry(trip.flight?.from_country || trip.host?.country),
          state: trip.user?.state || trip.host?.city || "",
          city: trip.user?.city || trip.host?.city || "",
          languages: trip.trip_meta?.languages || [],
          image: resolveImageUrl(trip.host?.profile_image || trip.host?.User?.profile_image || trip.user?.image || null),
          verified: trip.host?.verified ?? false
        },
        destination: trip.destination || `${trip.flight?.to}, ${normalizeCountry(trip.flight?.to_country)}`,
        date: trip.date || trip.flight?.departureDate,
        time: trip.flight?.departureTime,
        socials: socials
      };
    }

    // Handle previous pre-formatted response (flight + user structure)
    if (trip.flight && trip.user) {
      return {
        ...trip,
        host_id: trip.host_id || (trip.host ? trip.host.id : undefined),
        flight: {
          ...trip.flight,
          from_country: normalizeCountry(trip.flight.from_country || trip.from_country || trip.user.country)
        },
        user: {
          ...trip.user,
          image: resolveImageUrl(trip.user.image || trip.user.profile_image || trip.user.User?.profile_image || trip.user.user?.profile_image || null)
        },
        socials: socials
      };
    }

    // Determine full name
    const fullName = trip.fullName || trip.user?.fullName || trip.user?.name || trip.host?.full_name || trip.host?.name || "Traveler";

    return {
      id: trip.id || trip._id,
      host_id: trip.host_id || trip.host?.id || trip.user?.id,
      matches: trip.matches || [],
      user: {
        fullName: fullName,
        age: trip.age || trip.user?.age || trip.host?.age || "",
        gender: trip.gender || trip.user?.gender || trip.host?.gender || "",
        country: normalizeCountry(trip.user?.country || trip.host?.country || trip.from_country),
        state: trip.user?.state || trip.host?.city || "",
        city: trip.user?.city || trip.host?.city || "",
        languages: (() => {
          const rawLanguages = trip.languages || trip.user?.languages;
          if (!rawLanguages) return trip.host?.languages || [];
          return Array.isArray(rawLanguages) ? rawLanguages : rawLanguages.split(',').map(l => l.trim());
        })(),
        image: resolveImageUrl(trip.image || trip.user?.image || trip.user?.profile_image || trip.user?.User?.profile_image || trip.user?.user?.profile_image || trip.host?.image || trip.host?.profile_image || trip.host?.User?.profile_image || trip.host?.user?.profile_image || null),
        verified: trip.host?.user?.verified || trip.user?.verified || false
      },
      destination: `${trip.to_city}, ${normalizeCountry(trip.to_country)}`,
      date: trip.travel_date,
      time: trip.departure_time,
      flight: {
        airline: trip.airline,
        flightNumber: trip.flight_number,
        from: trip.from_city,
        to: trip.to_city,
        from_country: normalizeCountry(trip.from_country || trip.flight?.from_country || trip.user?.country || trip.host?.country),
        departureDate: trip.travel_date,
        departureTime: trip.departure_time,
        arrivalDate: trip.arrival_date,
        arrivalTime: trip.arrival_time
      },
      socials: socials
    };
  }, [currentUser]);

  const { data: publicTripsData } = useGetPublicTripsQuery({
    page: 1,
    limit: 50,
    from_country: normalizeCountryName(filters.country),
  });

  // Sync Plans
  useEffect(() => {
    let combined = [];
    if (publicTripsData?.results) {
      combined = publicTripsData.results.map(mapTripToPlan);
    }

    const uniqueCombined = Array.from(new Map(combined.map(item => [item.id, item])).values());
    const t = setTimeout(() => {
      setPlans(uniqueCombined);
    }, 0);
    return () => clearTimeout(t);
  }, [publicTripsData, mapTripToPlan]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !searchTerm ||
        plan.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.airline?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = !filters.country || plan.flight.from_country?.toLowerCase() === filters.country.toLowerCase();

      const matchesState =
        !filters.state ||
        plan.user.state?.toLowerCase().includes(filters.state.toLowerCase());

      const matchesCity =
        !filters.city ||
        plan.user.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        plan.flight.from?.toLowerCase().includes(filters.city.toLowerCase()) ||
        plan.flight.to?.toLowerCase().includes(filters.city.toLowerCase());

      return matchesSearch && matchesCountry && matchesState && matchesCity;
    });
  }, [plans, searchTerm, filters]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ country: "", state: "", city: "" });
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <style>{colorStyles}</style>

      <main className="min-h-screen bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FAF8F5]/35 pb-24 text-gray-900">

        {/* 1. Harmonized Travel Hero Header (Matching EventsHero.jsx architecture) */}
        {!showModal && (
          <div className="relative bg-white pt-8 pb-8 sm:pb-10 md:pb-12 px-4 overflow-hidden border-b border-gray-100">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12">
                
                <div className="text-center md:text-left max-w-2xl animate-fade-in">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00142E] mb-6 leading-[1.1] tracking-tight">
                    Discover Travel <span className="text-[#E1392A]">Partners</span>
                  </h1>

                  <p className="text-[#00142E]/70 text-base md:text-lg max-w-xl mb-8 font-medium leading-relaxed">
                    Explore flight paths, connect with verified co-travelers, share luggage, and find layover companionship around the world.
                  </p>

                  {/* Search Bar - Matching Events & Buy/Sell Search Input */}
                  <div className="relative mb-6 sm:mb-8 max-w-lg mx-auto md:mx-0 group">
                    <input
                      type="text"
                      placeholder="Search co-travelers by name, destination, or flight..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-5 py-3 pl-12 rounded-xl bg-[#F8F9FA] border border-gray-200 text-[#00142E] placeholder-[#00142E]/50 focus:outline-none focus:border-[#00142E] focus:ring-2 focus:ring-[#00142E]/10 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#00142E]/50 group-focus-within:text-[#00142E] transition-colors duration-300" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start mb-6 sm:mb-8">
                    <Button
                      onClick={() => navigate(getHostPath('travel', currentUser))}
                      className="h-12 px-6 sm:px-8 bg-[#E1392A] hover:bg-[#E1392A]/90 text-white rounded-xl font-medium shadow-lg shadow-[#00142E]/20 flex items-center gap-2 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base cursor-pointer border-0"
                    >
                      <Plus className="h-5 w-5" />
                      Post Your Trip Plan
                    </Button>
                  </div>
                </div>

                {/* Right Side Visual Card (Matching Events & Marketplace Hero Card) */}
                <div className="w-full md:w-1/2 flex items-center justify-center animate-slide-in-right">
                  <div className="relative w-full max-w-md h-64 sm:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-[#00142E] via-[#071F3B] to-slate-900 p-6 text-white flex flex-col justify-between shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/15">
                        Flight Match Network
                      </span>
                      <Globe className="w-6 h-6 text-[#E1392A]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-extrabold">Verified Expat Co-Travelers</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Departing together from origin countries. Share luggage allowance, layovers, and airport rides.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-emerald-300">Active Directory</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 2. Page Content workspace */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${showModal ? 'pt-8' : '-mt-6'}`}>
          {showModal ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md">
              <Suspense fallback={
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-accent rounded-full animate-spin mx-auto" />
                </div>
              }>
                <PostTripModal
                  onClose={() => setShowModal(false)}
                  onAdd={() => {
                    refetchMyTrips();
                  }}
                />
              </Suspense>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Floating Filter Console */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                <TravelFilter
                  searchQuery={searchTerm}
                  setSearchQuery={setSearchTerm}
                  filters={filters}
                  setFilters={setFilters}
                  onReset={resetFilters}
                />
              </div>

              {/* Grid Content Listings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E1392A] animate-pulse" />
                    <span className="text-xs uppercase font-black text-[#00142E] tracking-wider">
                      Verified Co-Travelers ({filteredPlans.length})
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1.5 hidden sm:flex">
                    <HelpCircle className="w-3.5 h-3.5 text-[#E1392A]" /> Direct Host Connect via Social Media
                  </span>
                </div>

                {filteredPlans.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center space-y-5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00142E] to-[#071F3B] p-0.5 shadow-xl">
                      <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                        <Plane size={28} className="text-[#E1392A] -rotate-45 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#00142E]">No Co-Travelers Match Your Filters</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                        Try resetting your search filters or be the first to post your journey details to find flight partners!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-6 py-3 rounded-2xl font-black text-xs text-white shadow-xl bg-gradient-to-r from-[#CB2A26] to-[#E1392A] hover:shadow-[#CB2A26]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      Post Your Trip Plan
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlans.map((plan) => (
                      <TravelPartnerCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </main>
    </>
  );
}