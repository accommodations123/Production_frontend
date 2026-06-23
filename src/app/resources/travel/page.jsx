import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { useAuth } from "../../../app/events/[id]/hooks/useAuth";
import {
  useGetMyTripsQuery,
  useGetPublicTripsQuery,
  useLazySearchTripsQuery,
  useGetHostProfileQuery
} from "../../../store/api/hostApi";
import { resolveImageUrl } from "@/lib/imageUtils";
import { useCountry } from "@/context/CountryContext";

// Extracted Constants
import {
  colorStyles,

} from "./constants";

// Child Components
import TravelFilter from "../../../components/travel/TravelFilter";
import TripCard from "../../../components/travel/TripCard";

// Lazy Loaded Modals for Performance
const PostTripModal = lazy(() => import("../../../components/travel/PostTripModal"));

import { toast, Toaster } from "sonner";

// Helper to ensure backend gets the full name it likely expects for USA
const getBackendCountryName = (c) => {
  if (!c) return c;
  const lower = c.toLowerCase().trim();
  if (lower === "united states" || lower === "usa" || lower === "us" || lower === "united states of america") {
    return "United States of America";
  }
  return c;
};

export default function TravelPage() {
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();
  const [plans, setPlans] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(() => {
    const countryName = getBackendCountryName(activeCountry?.name || "");
    return {
      country: countryName,
      state: "",
      city: "",
    };
  });

  const [prevActiveCountryName, setPrevActiveCountryName] = useState(activeCountry?.name || "");

  // Sync country filter inline during render when activeCountry changes
  const activeCountryName = activeCountry?.name || "";
  if (activeCountryName !== prevActiveCountryName) {
    setPrevActiveCountryName(activeCountryName);
    const countryName = getBackendCountryName(activeCountryName);
    if (filters.country !== countryName) {
      setFilters(prev => ({
        ...prev,
        country: countryName,
        state: "",
        city: "",
      }));
    }
  }

  // API Hooks
  const { data: myTripsData, refetch: refetchMyTrips } = useGetMyTripsQuery(undefined, {
    skip: !currentUser
  });
  const { data: hostProfile } = useGetHostProfileQuery();
  const [triggerSearch, { data: searchResults }] = useLazySearchTripsQuery();

  // Mapping utility to transform backend trip to frontend structure
  const mapTripToPlan = (trip) => {
    const normalizeCountry = (c) => {
      if (!c) return "";
      const lower = c.toLowerCase().trim();
      if (lower === "united states" || lower === "usa" || lower === "us" || lower === "united states of america") {
        return "United States of America";
      }
      return c;
    };

    const extractSocials = (t, u = null) => {
      const getVal = (val) => {
        if (val === undefined || val === null) return "";
        return String(val).trim();
      };
      return {
        whatsapp: getVal(
          t.host?.whatsapp ||
          t.host?.phone ||
          t.host?.User?.phone ||
          t.user?.whatsapp ||
          t.user?.phone ||
          t.user?.User?.phone ||
          t.whatsapp ||
          t.phone ||
          u?.phone ||
          u?.whatsapp ||
          ""
        ),
        email: getVal(
          t.host?.email ||
          t.host?.User?.email ||
          t.user?.email ||
          t.user?.User?.email ||
          t.email ||
          u?.email ||
          ""
        ),
        instagram: getVal(
          t.host?.instagram ||
          t.host?.User?.instagram ||
          t.user?.instagram ||
          t.user?.User?.instagram ||
          t.instagram ||
          u?.instagram ||
          ""
        ),
        facebook: getVal(
          t.host?.facebook ||
          t.host?.User?.facebook ||
          t.user?.facebook ||
          t.user?.User?.facebook ||
          t.facebook ||
          u?.facebook ||
          ""
        ),
        twitter: getVal(
          t.host?.twitter ||
          t.host?.x ||
          t.host?.User?.twitter ||
          t.user?.twitter ||
          t.user?.x ||
          t.user?.User?.twitter ||
          t.twitter ||
          u?.twitter ||
          u?.x ||
          ""
        )
      };
    };

    const socials = extractSocials(trip, currentUser);

    // Handle user's new "My Trips" structure (Lightweight response)
    if (trip.sent_matches || trip.received_matches) {
      return {
        id: trip.id,
        host_id: currentUser?.id, // It's my trip
        matches: [
          ...(trip.sent_matches || []),
          ...(trip.received_matches || [])
        ],
        // Provide minimal defaults to prevent UI crashes if this is erroneously rendered
        user: { fullName: currentUser?.fullName || "Me", image: resolveImageUrl(currentUser?.image || null) },
        flight: {
          from: trip.from_city || "",
          to: trip.to_city || "",
          from_country: normalizeCountry(trip.from_country || ""),
          to_country: normalizeCountry(trip.to_country || ""),
        },
        destination: trip.to_city ? `${trip.to_city}` : "",
        date: trip.travel_date,
        status: trip.status || "active",
        travelers_count: trip.travelers_count,
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
          from_country: normalizeCountry(trip.flight.from_country || trip.from_country || trip.host.country),
          to_country: normalizeCountry(trip.flight.to_country || trip.to_country)
        },
        user: {
          fullName: trip.host.full_name,
          age: trip.trip_meta.age || "",
          languages: trip.trip_meta.languages || [],
          gender: "", // Not provided in payload, default to empty
          country: trip.host.country,
          state: trip.host.city,
          city: trip.host.city,
          image: resolveImageUrl(trip.host.profile_image || trip.host.User?.profile_image || trip.host.user?.profile_image || null),
          verified: trip.host.verified || false
        },
        socials: socials
      };
    }

    // Handle previous pre-formatted response (flight + user structure) - Keep for backward compatibility if needed
    if (trip.flight && trip.user) {
      return {
        ...trip,
        host_id: trip.host_id || (trip.host ? trip.host.id : undefined),
        flight: {
          ...trip.flight,
          from_country: normalizeCountry(trip.flight.from_country || trip.from_country || trip.user.country),
          to_country: normalizeCountry(trip.flight.to_country || trip.to_country)
        },
        user: {
          ...trip.user,
          image: resolveImageUrl(trip.user.image || trip.user.profile_image || trip.user.User?.profile_image || trip.user.user?.profile_image || null)
        },
        socials: socials
      };
    }

    // Determine the full name from various possible fields
    let fullName = "Traveler";

    if (trip.host?.full_name) {
      fullName = trip.host.full_name;
    } else if (trip.user?.full_name) {
      fullName = trip.user.full_name;
    } else if (trip.host?.user?.full_name) {
      fullName = trip.host.user.full_name;
    } else if (trip.host_id === currentUser?.id && currentUser?.fullName) {
      fullName = currentUser.fullName;
    } else if (trip.host_id === currentUser?.id && (currentUser?.first_name || currentUser?.last_name)) {
      fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    }

    return {
      id: trip.id,
      host_id: trip.host_id,
      matches: trip.matches || [],
      user: {
        fullName: fullName,
        age: trip.age || trip.user?.age || trip.host?.age || "",
        gender: trip.gender || trip.user?.gender || trip.host?.gender || "",
        country: normalizeCountry(trip.user?.country || trip.host?.country || trip.from_country),
        state: trip.user?.state || trip.host?.city || "",
        city: trip.user?.city || trip.host?.city || "",
        languages: (trip.languages || trip.user?.languages)
          ? (Array.isArray(trip.languages || trip.user?.languages)
            ? (trip.languages || trip.user?.languages)
            : (trip.languages || trip.user?.languages).split(',').map(l => l.trim()))
          : (trip.host?.languages || []),
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
        // Improved fallback: Check flat field -> flight object -> user/host country
        from_country: normalizeCountry(trip.from_country || trip.flight?.from_country || trip.user?.country || trip.host?.country),
        to_country: normalizeCountry(trip.to_country || trip.flight?.to_country),
        departureDate: trip.travel_date,
        departureTime: trip.departure_time,
        arrivalDate: trip.arrival_date,
        arrivalTime: trip.arrival_time
      },
      travelers_count: trip.travelers_count,
      socials: socials
    };
  };

  // Filter by ORIGIN country (from_country) - Shows travelers departing FROM the selected country
  // This helps users find CO-TRAVELERS going on the same journey
  // Example: User in India sees other travelers also flying FROM India → they can travel together!

  const { data: publicTripsData } = useGetPublicTripsQuery({
    page: 1,
    limit: 50,
    country: getBackendCountryName(filters.country) || undefined,
    // status: 'active' // Keep commented out for now to see cancelled/pending trips for debugging
  });

  // Sync My Trips
  useEffect(() => {
    if (myTripsData?.trips) {
      const mapped = myTripsData.trips.map(mapTripToPlan);
      setMyTrips(mapped);
    }
  }, [myTripsData, currentUser]);

  // Sync Plans (Public Feed or Search Results)
  useEffect(() => {
    let combined = [];

    // Priority 1: Search Results
    if (searchResults?.results) {
      combined = searchResults.results.map(mapTripToPlan);
    }
    // Priority 2: Public Feed (Default)
    else if (publicTripsData?.results) {
      combined = publicTripsData.results.map(mapTripToPlan);
    }

    // Deduplicate by ID
    const uniqueCombined = Array.from(new Map(combined.map(item => [item.id, item])).values());

    setPlans(uniqueCombined);

  }, [searchResults, publicTripsData, currentUser, hostProfile]);


  const handleSearch = async () => {
    try {
      await triggerSearch({
        from_country: filters.country || "India",
        to_country: filters.country || "USA",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Search failed:", error);
    }
  };


  // Filter Logic (Local for now, could be API-driven)
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !searchTerm ||
        plan.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.airline?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by ORIGIN or DESTINATION country (where traveler is flying FROM or TO)
      const matchesCountry = !filters.country || 
        plan.flight.from_country?.toLowerCase() === filters.country.toLowerCase() ||
        plan.flight.to_country?.toLowerCase() === filters.country.toLowerCase();

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
      <Navbar />

      <main className="min-h-screen pt-16 md:pt-[72px]" style={{ backgroundColor: 'var(--color-background)' }}>

        {/* Clean Header Bar (Marketplace-style) */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CB2A25] to-[#E04642] flex items-center justify-center shadow-md shadow-[#CB2A25]/20">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#00142E] leading-tight">
                  Travel Partners
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block">
                  Find co-travelers on your flight path
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg shadow-[#CB2A25]/25 hover:shadow-[#CB2A25]/40 transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#CB2A25] to-[#E04642]"
            >
              <Plane className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post Your Trip</span>
              <span className="sm:hidden">Post Trip</span>
            </motion.button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="container mx-auto px-4 sm:px-6 pt-5">
          <TravelFilter
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Trips Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Plane size={28} className="text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-1.5">No travelers found</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Try adjusting your filters or be the first to post a trip!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer bg-gradient-to-r from-[#CB2A25] to-[#E04642] hover:shadow-xl transition-all"
              >
                Post a New Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlans.map((plan) => (
                <TripCard
                  key={plan.id}
                  plan={plan}
                />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </main>

      {/* Modals with Suspense for performance */}
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          {showModal && (
            <PostTripModal
              onClose={() => setShowModal(false)}
              onAdd={() => {
                // Refetch handled automatically by RTK Query tags (invalidatesTags: ['Trips'])
                // However, we can also force refetch if needed, but tags are better.
                // We kept refetchMyTrips available.
                // Let's call it just in case, or leave empty.
                refetchMyTrips();
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );
}
