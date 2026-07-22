import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { Plane, Plus, Globe, RotateCcw, HelpCircle } from "lucide-react";

import { useAuth } from "@/features/events/hooks/useAuth";
import {
  useGetMyTripsQuery,
  useGetPublicTripsQuery
} from "@/store/api/hostApi";
import { resolveImageUrl } from "@/shared/utils/imageUtils";

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
    const normalizeCountry = (c) => {
      if (!c) return "";
      const lower = c.toLowerCase().trim();
      if (lower === "united states" || lower === "usa" || lower === "us" || lower === "united states of america") {
        return "United States of America";
      }
      return c;
    };

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
          fullName: trip.host.full_name,
          age: trip.trip_meta.age || "",
          languages: trip.trip_meta.languages || [],
          gender: "",
          country: trip.host.country,
          state: trip.host.city,
          city: trip.host.city,
          image: resolveImageUrl(trip.host.profile_image || trip.host.User?.profile_image || trip.host.user?.profile_image || null),
          verified: trip.host.verified || false
        },
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

  const getBackendCountryName = (c) => {
    if (!c) return c;
    const lower = c.toLowerCase().trim();
    if (lower === "united states" || lower === "usa" || lower === "us") {
      return "United States of America";
    }
    return c;
  };

  const { data: publicTripsData } = useGetPublicTripsQuery({
    page: 1,
    limit: 50,
    from_country: getBackendCountryName(filters.country),
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
        
        {/* 1. High-Fidelity Travel Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00162D] via-[#08223C] to-[#12365A] text-white py-16 sm:py-20 px-4 border-b border-[#D5CBA8]/10">
          {/* Backdrop blurring meshes */}
          <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-[#E1392A]/5 rounded-full filter blur-[100px] pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#D5CBA8]/10 rounded-full filter blur-[110px] pointer-events-none translate-y-1/3" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            
            <div className="space-y-4 max-w-2xl text-left">
              <span className="inline-flex items-center gap-1.5 bg-[#CB2A26]/10 border border-[#CB2A26]/30 text-[#E1392A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Globe className="w-3 h-3 animate-spin-slow" />
                Flight Path Matching
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Relocate Together, <span className="bg-gradient-to-r from-[#CB2A26] to-[#F15A24] bg-clip-text text-transparent">Fly Together.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
                Settle abroad with company. Find and connect with trusted expat co-travelers departing from your origin country to share luggage, itineraries, and layovers.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              {showModal ? (
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-white text-[#00162D] hover:bg-slate-50 transition-all shadow-lg cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Back to Directory
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs text-white shadow-xl shadow-[#CB2A26]/20 bg-gradient-to-r from-[#CB2A26] to-[#E1392A] hover:shadow-[#CB2A26]/30 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Post Your Trip Plan
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 2. Page Content workspace */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
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
              <div className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-sm">
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Browse co-travelers ({filteredPlans.length})
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Shows departures matching selected destination
                  </span>
                </div>

                {filteredPlans.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#FCFAF6] border border-[#D5CBA8]/20 flex items-center justify-center">
                      <Plane size={24} className="text-[#E1392A] -rotate-45 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#00162D]">No matching itineraries found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Try resetting your filters or be the first to post your journey details!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md bg-[#00162D] hover:bg-[#CB2A26] transition-all cursor-pointer"
                    >
                      Post Your Trip Now
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
