import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { useAuth } from "../../../app/events/[id]/hooks/useAuth";
import { useCountry } from "@/context/CountryContext";
import {
  useGetMyTripsQuery,
  useGetPublicTripsQuery,
  useLazySearchTripsQuery
} from "@/hooks/data/useTravelHooks";
import { useGetHostProfileQuery } from "@/hooks/data/useHostHooks";
import { resolveImageUrl } from "@/lib/imageUtils";

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

const normalizeCountry = (c) => {
  if (!c) return "";
  const lower = String(c).toLowerCase().trim();
  if (lower === "united states" || lower === "usa" || lower === "us" || lower === "united states of america") {
    return "United States of America";
  }
  if (lower === "united kingdom" || lower === "uk" || lower === "gb" || lower === "great britain") {
    return "United Kingdom";
  }
  if (lower === "india" || lower === "in") {
    return "India";
  }
  if (lower === "united arab emirates" || lower === "uae" || lower === "ae") {
    return "United Arab Emirates";
  }
  return c.trim();
};

export default function TravelPage() {
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();
  const [plans, setPlans] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: activeCountry?.name || "",
    state: "",
    city: "",
  });

  // Sync with activeCountry when user changes country in Navbar
  useEffect(() => {
    if (activeCountry?.name) {
      setFilters((prev) => ({
        ...prev,
        country: activeCountry.name,
        state: "",
        city: "",
      }));
    }
  }, [activeCountry?.name]);

  // API Hooks
  const { data: myTripsData, refetch: refetchMyTrips } = useGetMyTripsQuery(undefined, {
    skip: !currentUser
  });
  const { data: hostProfile } = useGetHostProfileQuery();
  const [triggerSearch, { data: searchResults }] = useLazySearchTripsQuery();

  // Mapping utility to transform backend trip to frontend structure
  const mapTripToPlan = (trip) => {

    const extractSocials = (t) => {
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
          ""
        ),
        email: getVal(
          t.host?.email ||
          t.host?.User?.email ||
          t.user?.email ||
          t.user?.User?.email ||
          t.email ||
          ""
        ),
        instagram: getVal(
          t.host?.instagram ||
          t.host?.User?.instagram ||
          t.user?.instagram ||
          t.user?.User?.instagram ||
          t.instagram ||
          ""
        ),
        facebook: getVal(
          t.host?.facebook ||
          t.host?.User?.facebook ||
          t.user?.facebook ||
          t.user?.User?.facebook ||
          t.facebook ||
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
        destination: trip.to_city ? `${trip.to_city}${trip.to_country ? `, ${normalizeCountry(trip.to_country)}` : ''}` : "",
        date: trip.travel_date,
        status: trip.status || "active",
        socials: socials
      };
    }

    // Handle revised pre-formatted response from backend (host + trip_meta structure)
    if (trip.flight && trip.host && trip.trip_meta) {
      const resolvedUserId = trip.host.user_id || trip.user_id || trip.host_user_id || trip.host.id;
      return {
        ...trip,
        destination: trip.destination || (trip.flight?.to_city ? `${trip.flight.to_city}${trip.flight.to_country ? `, ${trip.flight.to_country}` : ''}` : `${trip.to_city || ''}`),
        origin: trip.origin || (trip.flight?.from_city ? `${trip.flight.from_city}${trip.flight.from_country ? `, ${trip.flight.from_country}` : ''}` : `${trip.from_city || ''}`),
        date: trip.travel_date || trip.date || trip.flight?.departureDate || trip.created_at,
        time: trip.departure_time || trip.time || trip.flight?.departureTime || "10:00 AM",
        matches: trip.matches || [],
        host_id: trip.host?.id,
        user_id: resolvedUserId,
        flight: {
          ...trip.flight,
          airline: trip.flight?.airline || trip.airline || "Commercial Airline",
          flight_number: trip.flight?.flight_number || trip.flight_number || "",
          from_country: normalizeCountry(trip.flight?.from_country || trip.from_country || trip.host?.country || "India"),
          to_country: normalizeCountry(trip.flight?.to_country || trip.to_country || "USA")
        },
        user: {
          id: resolvedUserId,
          user_id: resolvedUserId,
          fullName: trip.host.full_name || trip.host.name || "Traveler",
          full_name: trip.host.full_name || trip.host.name || "Traveler",
          age: trip.trip_meta.age || "",
          languages: trip.trip_meta.languages || [],
          gender: "",
          country: trip.host.country || "India",
          state: trip.host.city || "",
          city: trip.host.city || "",
          image: resolveImageUrl(trip.host.profile_image || trip.host.User?.profile_image || trip.host.user?.profile_image || null),
          verified: trip.host.verified || false
        },
        socials: socials
      };
    }

    // Handle previous pre-formatted response (flight + user structure) - Keep for backward compatibility if needed
    if (trip.flight && trip.user) {
      const resolvedUserId = trip.user.user_id || trip.user.id || trip.host_id || trip.user_id;
      return {
        ...trip,
        destination: trip.destination || (trip.flight?.to_city ? `${trip.flight.to_city}${trip.flight.to_country ? `, ${trip.flight.to_country}` : ''}` : `${trip.to_city || ''}`),
        origin: trip.origin || (trip.flight?.from_city ? `${trip.flight.from_city}${trip.flight.from_country ? `, ${trip.flight.from_country}` : ''}` : `${trip.from_city || ''}`),
        date: trip.travel_date || trip.date || trip.flight?.departureDate || trip.created_at,
        time: trip.departure_time || trip.time || trip.flight?.departureTime || "10:00 AM",
        host_id: trip.host_id || (trip.host ? trip.host.id : undefined),
        user_id: resolvedUserId,
        flight: {
          ...trip.flight,
          airline: trip.flight?.airline || trip.airline || "Commercial Airline",
          flight_number: trip.flight?.flight_number || trip.flight_number || "",
          from_country: normalizeCountry(trip.flight.from_country || trip.from_country || trip.user.country || "India"),
          to_country: normalizeCountry(trip.flight.to_country || trip.to_country || "USA")
        },
        user: {
          ...trip.user,
          id: resolvedUserId,
          user_id: resolvedUserId,
          fullName: trip.user.full_name || trip.user.fullName || "Traveler",
          image: resolveImageUrl(trip.user.image || trip.user.profile_image || trip.user.User?.profile_image || trip.user.user?.profile_image || null)
        },
        socials: socials
      };
    }

    // Determine the full name from various possible fields
    let fullName = "Traveler";
    if (trip.user?.fullName) fullName = trip.user.fullName;
    else if (trip.user?.full_name) fullName = trip.user.full_name;
    else if (trip.user?.name) fullName = trip.user.name;
    else if (trip.host?.fullName) fullName = trip.host.fullName;
    else if (trip.host?.full_name) fullName = trip.host.full_name;
    else if (trip.host?.name) fullName = trip.host.name;
    else if (trip.host_name) fullName = trip.host_name;

    const fromCity = trip.from_city || trip.origin || trip.flight?.from || "";
    const toCity = trip.to_city || trip.destination || trip.flight?.to || "";
    const fromCountry = normalizeCountry(trip.from_country || trip.flight?.from_country || trip.user?.country || trip.host?.country || "");
    const toCountry = normalizeCountry(trip.to_country || trip.flight?.to_country || "");

    return {
      ...trip,
      id: trip.id || trip._id || trip.trip_id,
      host_id: trip.host_id || trip.user_id,
      user_id: trip.user_id || trip.host_id,
      destination: trip.destination || (toCity ? `${toCity}${toCountry ? `, ${toCountry}` : ''}` : "Travel Destination"),
      origin: trip.origin || (fromCity ? `${fromCity}${fromCountry ? `, ${fromCountry}` : ''}` : "Travel Origin"),
      date: trip.travel_date || trip.date || trip.departureDate || trip.flight?.departureDate,
      time: trip.departure_time || trip.time || trip.departureTime || trip.flight?.departureTime || "10:00 AM",
      status: trip.status || "active",
      flight: {
        airline: trip.flight?.airline || trip.airline || "Commercial Airline",
        flightName: trip.flight?.flightName || trip.flightName || trip.airline || "Commercial Airline",
        flightNumber: trip.flight?.flightNumber || trip.flight?.flight_number || trip.flight_number || "",
        from: fromCity,
        to: toCity,
        from_country: fromCountry,
        to_country: toCountry,
        departureDate: trip.travel_date || trip.date || trip.flight?.departureDate,
        departureTime: trip.departure_time || trip.time || trip.flight?.departureTime || "10:00 AM",
        arrivalDate: trip.arrival_date || trip.flight?.arrivalDate || trip.travel_date,
        arrivalTime: trip.arrival_time || trip.flight?.arrivalTime || "08:00 PM",
        seatsAvailable: trip.seats_available || trip.travelers_count || 1,
        stops: trip.stops || []
      },
      user: {
        id: trip.user_id || trip.host_id,
        user_id: trip.user_id || trip.host_id,
        fullName: fullName,
        full_name: fullName,
        age: trip.age || trip.trip_meta?.age || "25-35",
        languages: trip.languages || trip.trip_meta?.languages || ["English"],
        gender: "",
        country: fromCountry,
        state: trip.from_state || trip.user?.state || "",
        city: fromCity,
        phone: trip.phone || trip.user?.phone || trip.host?.phone || "",
        email: trip.email || trip.user?.email || trip.host?.email || "",
        whatsapp: trip.whatsapp || trip.user?.whatsapp || trip.host?.whatsapp || "",
        image: resolveImageUrl(trip.user?.image || trip.user?.profile_image || trip.host?.profile_image || trip.host?.avatar_url || null),
        verified: Boolean(trip.is_approved || trip.user?.verified || trip.host?.verified)
      },
      socials: socials
    };
  };

  const getBackendCountryName = (c) => {
    if (!c) return undefined;
    const lower = c.toLowerCase().trim();
    if (lower === "united states" || lower === "usa" || lower === "us") {
      return "United States of America";
    }
    return c;
  };

  const { data: publicTripsData } = useGetPublicTripsQuery({
    page: 1,
    limit: 50,
    country: getBackendCountryName(filters.country || activeCountry?.name)
  });

  const extractTripList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.trips)) return raw.trips;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === 'object') {
      if (Array.isArray(raw.data.results)) return raw.data.results;
      if (Array.isArray(raw.data.trips)) return raw.data.trips;
      if (Array.isArray(raw.data.data)) return raw.data.data;
    }
    return [];
  };

  // Sync My Trips
  useEffect(() => {
    const rawMyTrips = extractTripList(myTripsData);
    if (rawMyTrips.length > 0) {
      const mapped = rawMyTrips.map(mapTripToPlan).filter(Boolean);
      setMyTrips(mapped);
    }
  }, [myTripsData, currentUser]);

  // Sync Plans (Public Feed or Search Results)
  useEffect(() => {
    let rawList = [];

    // Priority 1: Search Results
    if (searchResults) {
      const searchList = extractTripList(searchResults);
      if (searchList.length > 0) rawList = searchList;
    }
    
    // Priority 2: Public Feed (Default)
    if (!rawList.length && publicTripsData) {
      rawList = extractTripList(publicTripsData);
    }

    const mapped = rawList.map(mapTripToPlan).filter(Boolean);

    // Deduplicate by ID
    const uniqueCombined = Array.from(new Map(mapped.map(item => [item.id, item])).values());

    const activeTrips = uniqueCombined.filter((item) => {
      if (item.status === "completed" || item.status === "cancelled" || item.status === "rejected") return false;
      return true;
    });

    setPlans(activeTrips);

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


  // Filter Logic
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const planUser = plan.user || {};
      const planFlight = plan.flight || {};

      const matchesSearch =
        !searchTerm ||
        planUser.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planFlight.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planFlight.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planFlight.airline?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by ORIGIN country (from_country) OR DESTINATION country (to_country)
      const selectedCountryName = filters.country;
      const matchesCountry = (() => {
        if (!selectedCountryName || selectedCountryName === "all" || selectedCountryName === "Global") return true;
        const normTarget = normalizeCountry(selectedCountryName).toLowerCase();
        const normFrom = normalizeCountry(planFlight.from_country || plan.from_country || planUser.country || plan.origin || "").toLowerCase();
        const normTo = normalizeCountry(planFlight.to_country || plan.to_country || plan.destination || "").toLowerCase();
        const normDest = (plan.destination || "").toLowerCase();
        const normOrigin = (plan.origin || "").toLowerCase();

        return (
          normFrom.includes(normTarget) ||
          normTarget.includes(normFrom) ||
          normTo.includes(normTarget) ||
          normTarget.includes(normTo) ||
          normDest.includes(normTarget) ||
          normOrigin.includes(normTarget)
        );
      })();

      const matchesState =
        !filters.state ||
        planUser.state?.toLowerCase().includes(filters.state.toLowerCase());

      const matchesCity =
        !filters.city ||
        planUser.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
        planFlight.from?.toLowerCase().includes(filters.city.toLowerCase()) ||
        planFlight.to?.toLowerCase().includes(filters.city.toLowerCase());

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
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5">
          <TravelFilter
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Trips Grid */}
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
