import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Users,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { useAuth } from "../../../app/events/[id]/hooks/useAuth";
import {
  useGetMyTripsQuery,
  useGetPublicTripsQuery,
  useGetMatchesQuery,
  useLazySearchTripsQuery,
  useTravelMatchActionMutation,
  useGetHostProfileQuery
} from "../../../store/api/hostApi";
import { useCountry } from "@/context/CountryContext";

// Extracted Constants
import {
  colorStyles,

} from "./constants";

// Child Components
import TravelFilter from "../../../components/travel/TravelFilter";
import TripCard from "../../../components/travel/TripCard";
import TripDetailModal from "../../../components/travel/TripDetailModal";

// Lazy Loaded Modals for Performance
const PostTripModal = lazy(() => import("../../../components/travel/PostTripModal"));
const MatchRequestModal = lazy(() => import("../../../components/travel/MatchRequestModal"));
const MatchRequestsModal = lazy(() => import("../../../components/travel/MatchRequestsModal"));

import { toast, Toaster } from "sonner";

export default function TravelPage() {
  const { user: currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
  });

  // API Hooks
  const { data: myTripsData, refetch: refetchMyTrips } = useGetMyTripsQuery(undefined, {
    skip: !currentUser
  });
  const { data: matchesData, refetch: refetchMatches } = useGetMatchesQuery(undefined, {
    skip: !currentUser
  });
  const { data: hostProfile } = useGetHostProfileQuery();
  const [triggerSearch, { data: searchResults }] = useLazySearchTripsQuery();
  const [performMatchAction] = useTravelMatchActionMutation();

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
        user: { fullName: currentUser?.fullName || "Me", image: currentUser?.image || null },
        flight: {
          from: trip.from_city || "",
          to: trip.to_city || "",
          from_country: normalizeCountry(trip.from_country || ""),
        },
        destination: trip.to_city ? `${trip.to_city}` : "",
        date: trip.travel_date,
        status: trip.status || "active"
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
          gender: "", // Not provided in payload, default to empty
          country: trip.host.country,
          state: trip.host.city,
          city: trip.host.city,
          image: trip.host.profile_image || null,
          verified: trip.host.verified || false
        }
      };
    }

    // Handle previous pre-formatted response (flight + user structure) - Keep for backward compatibility if needed
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
          image: trip.user.image || trip.user.profile_image || null
        }
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
        image: trip.image || trip.user?.image || trip.user?.profile_image || trip.host?.image || trip.host?.profile_image || null,
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
        departureDate: trip.travel_date,
        departureTime: trip.departure_time,
        arrivalDate: trip.arrival_date,
        arrivalTime: trip.arrival_time
      }
    };
  };

  const { activeCountry } = useCountry();

  // Filter by ORIGIN country (from_country) - Shows travelers departing FROM the selected country
  // This helps users find CO-TRAVELERS going on the same journey
  // Example: User in India sees other travelers also flying FROM India → they can travel together!

  // Helper to ensure backend gets the full name it likely expects for USA
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
    from_country: getBackendCountryName(filters.country || activeCountry?.name),
    // status: 'active' // Keep commented out for now to see cancelled/pending trips for debugging
  });

  // Sync My Trips
  useEffect(() => {
    if (myTripsData?.trips) {
      const mapped = myTripsData.trips.map(mapTripToPlan);
      setMyTrips(mapped);
    }
  }, [myTripsData, currentUser]);

  // Sync Matches
  useEffect(() => {
    // Backend returns 'requests' array from getReceivedMatchRequests
    if (matchesData?.requests) {
      setMatches(matchesData.requests);
    } else if (matchesData?.matches) {
      setMatches(matchesData.matches);
    }
  }, [matchesData]);

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

    // Deduplicate by ID and filter out own trips (Compare Host IDs)
    const uniqueCombined = Array.from(new Map(combined.map(item => [item.id, item])).values())
      .filter(trip => trip.host_id !== hostProfile?.id);

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
    return plans.map(plan => {
      // 1. Check Incoming Requests (someone matched WITH ME)
      const incomingMatch = matches.find(m => m.matched_trip_id === plan.id);

      // 2. Check Outgoing Requests (I matched WITH THEM)
      // Iterate through my trips and find if any has a match targeting this plan
      const outgoingMatch = myTrips.flatMap(t => t.matches || []).find(m => m.matched_trip_id === plan.id);

      const status = outgoingMatch ? outgoingMatch.status : incomingMatch ? incomingMatch.status : null;

      return {
        ...plan,
        matchStatus: status
      };
    }).filter((plan) => {
      const matchesSearch =
        plan.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.flight.to.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by ORIGIN country (where traveler is flying FROM) - For CO-TRAVELER matching
      const matchesCountry = !filters.country || plan.flight.from_country?.toLowerCase() === filters.country.toLowerCase();

      if (filters.country && !matchesCountry) {
        console.log("Filter Mismatch:", {
          filter: filters.country,
          planCountry: plan.flight.from_country,
          planFrom: plan.flight.from,
          matches: matchesCountry
        });
      }

      const matchesState = !filters.state || plan.user.state === filters.state;
      const matchesCity = !filters.city || plan.flight.from?.toLowerCase().includes(filters.city.toLowerCase());

      return matchesSearch && matchesCountry && matchesState && matchesCity;
    });
  }, [plans, searchTerm, filters, matches, myTrips]);

  const handleSendMatchRequest = async (remoteTripId, message, consentGiven) => {
    // 1. Find user's trip to use as requester
    const activeTrip = myTrips[0] || plans.find(p => p.host_id === currentUser?.id);

    if (!activeTrip) {
      alert("You need to post a trip before you can request a match!");
      return;
    }

    const myTripId = activeTrip.id;

    const payload = {
      trip_id: myTripId,
      matched_trip_id: remoteTripId,
      action: "request"
    };

    try {
      const response = await performMatchAction(payload).unwrap();
      if (response.success) {
        // Optimistic update or wait for refetch (RTK Query tags handle refetch)
        const newMatch = {
          id: Date.now(),
          trip_id: myTripId,
          matched_trip_id: remoteTripId,
          status: response.status || "pending",
          consent_given: consentGiven,
          message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        // We can rely on refetchMatches but adding manually for instant feedback if needed
        setMatches(prev => [...prev, newMatch]);
      }
    } catch (error) {
      console.error("Failed to send match request:", error);
      alert(error?.data?.message || "Failed to send match request. Please try again.");
    }
  };

  const updateMatchStatus = async (matchId, tripId, matchedTripId, status) => {
    // Find match - handle both backend formats (match_id vs id)
    const match = matches.find(m => m.match_id === matchId || m.id === matchId);

    // Use provided tripId/matchedTripId or fall back to match object
    const actualTripId = tripId || match?.trip_id || match?.requester_trip?.id;
    const actualMatchedTripId = matchedTripId || match?.matched_trip_id || match?.receiver_trip?.id;

    if (!actualTripId || !actualMatchedTripId) {
      console.error("Missing trip IDs for match action");
      return;
    }

    // Mapping UI status to backend action
    const action = status === "accepted" ? "accept" : status === "rejected" ? "reject" : status;

    const payload = {
      trip_id: actualTripId,
      matched_trip_id: actualMatchedTripId,
      action: action
    };

    try {
      const response = await performMatchAction(payload).unwrap();
      if (response.success) {
        // Remove from local matches array for instant UI feedback
        setMatches(matches.filter(m => (m.match_id || m.id) !== matchId));
        // Refetch to get fresh data
        refetchMatches();
      }
    } catch (error) {
      console.error("Failed to update match status:", error);
      alert(error?.data?.message || "Failed to update match status. Please try again.");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ country: "", state: "", city: "" });
  };

  const handlePlanSelect = (id) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  const handleOpenMatchModal = (plan) => {
    toast.promise(
      handleSendMatchRequest(plan.id, "", true),
      {
        loading: 'Sending connect request...',
        success: `Request sent to ${plan.user.fullName}!`,
        error: 'Failed to send request. Please try again.',
      }
    );
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <style>{colorStyles}</style>
      <Navbar />

      <main className="min-h-screen pt-20" style={{ backgroundColor: 'var(--color-background)' }}>

        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00142E]/90 to-transparent"></div>

          <div className="relative z-10 container mx-auto px-6 pb-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Find Your Perfect <br /> <span style={{ color: 'var(--color-accent)' }}>Travel Partner</span>
              </h1>
              <p className="text-xl text-gray-200 mb-10 font-medium">
                Connect with fellow travelers sharing your flight path. <br />
                Safe, verified, and community-driven matching.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowModal(true)} className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 active:scale-95 text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
                  <Plane size={20} /> Post Your Trip
                </button>
                {currentUser && (
                  <button
                    onClick={() => setShowRequestsModal(true)}
                    className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-white/10 backdrop-blur-md text-white border border-white/20 relative"
                  >
                    <Users size={20} /> Match Requests
                    {matches.filter(m => m.status === 'pending' && myTrips.some(t => t.id === m.matched_trip_id)).length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                        {matches.filter(m => m.status === 'pending' && myTrips.some(t => t.id === m.matched_trip_id)).length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <div className="container mx-auto px-6 -mt-16 relative z-30">
          <TravelFilter
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Trips Grid */}
        <section className="container mx-auto px-6 py-12">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200">
              <Plane size={64} className="mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold mb-2">No matching travelers found</h3>
              <p className="text-gray-500 mb-8">Try adjusting your filters or be the first to post a trip!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg mx-auto cursor-pointer"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Post a New Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map((plan) => (
                <TripCard
                  key={plan.id}
                  plan={plan}
                  isSelected={expandedPlanId === plan.id}
                  onSelect={() => handlePlanSelect(plan.id)}
                  onMatchRequest={handleOpenMatchModal}
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

          {showRequestsModal && (
            <MatchRequestsModal
              onClose={() => setShowRequestsModal(false)}
              matches={matches}
              plans={plans}
              myTrips={myTrips}
              onAcceptRequest={(matchId, tripId, matchedTripId) => updateMatchStatus(matchId, tripId, matchedTripId, "accepted")}
              onRejectRequest={(matchId, tripId, matchedTripId) => updateMatchStatus(matchId, tripId, matchedTripId, "rejected")}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );
}