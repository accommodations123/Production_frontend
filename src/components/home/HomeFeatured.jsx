import React, { useState, useMemo } from 'react';
import {
  Shield, ShieldCheck, Sparkles, MapPin, Users, Calendar,
  ArrowRight, Heart, Globe, Star, Facebook, Instagram, MessageCircle, Plane, Home
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountry } from '@/context/CountryContext';
import { filterUpcomingEvents } from '@/lib/eventUtils';
import { getHostPath } from '@/lib/navigationUtils';

// API Hooks
import {
  useGetApprovedPropertiesQuery,
  useGetAllPropertiesQuery,
  useGetApprovedEventsQuery,
  useGetBuySellListingsQuery,
  useGetPublicTripsQuery
} from '@/store/api/hostApi';
import { useGetPublicStayRequestsQuery } from '@/store/api/stayRequestApi';
import { useGetPublicProfilesQuery } from '@/store/api/peopleApi';
import { useAuth } from '@/app/events/[id]/hooks/useAuth';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Child Components
import { SectionHeader } from './featured/SectionHeader.jsx';
import { PropertyCard } from './featured/PropertyCard.jsx';
import { StayRequestCard } from '@/components/search/StayRequestCard.jsx';
import { EventCard } from './featured/EventCard.jsx';
import { ProductCard } from '../marketplace/ProductCard.jsx';
import PeopleCard from '@/features/people/components/PeopleCard.jsx';
import TripCard from '@/components/travel/TripCard';
import { resolveImageUrl } from '@/lib/imageUtils';
import {
  SAFETY_TIPS, FEATURE_CARDS
} from './featured/HomeFeaturedConstants.jsx';
const openSocialLink = (platform, value, fallbackPhone) => {
  if (!value && !fallbackPhone) return;

  let url = null;

  switch (platform) {
    case "whatsapp": {
      const num = (value || fallbackPhone || "").replace(/\D/g, "");
      if (!num) return;
      url = `https://wa.me/${num}`;
      break;
    }

    case "instagram": {
      const handle = value?.replace(/^@/, "");
      if (!handle) return;
      url = `https://instagram.com/${handle}`;
      break;
    }

    case "facebook": {
      if (!value) return;
      url = value.startsWith("http")
        ? value
        : `https://facebook.com/${value}`;
      break;
    }

    default:
      return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

// Inline Skeleton
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-neutral/10 rounded-2xl ${className}`} />
);

const mapTripToPlan = (trip, currentUser = null) => {
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
      host_id: currentUser?.id, // It's my trip
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
          : String(trip.languages || trip.user?.languages || "").split(',').map(l => l.trim()))
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
      from_country: normalizeCountry(trip.from_country || trip.flight?.from_country || trip.user?.country || trip.host?.country),
      departureDate: trip.travel_date,
      departureTime: trip.departure_time,
      arrivalDate: trip.arrival_date,
      arrivalTime: trip.arrival_time
    },
    socials: socials
  };
};

const HomeFeatured = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("user");
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();
  const { data: allProperties, isLoading: propertiesLoading } = useGetAllPropertiesQuery({ country: activeCountry?.name, limit: 4 });
  const { data: stayRequestsData, isLoading: stayRequestsLoading } = useGetPublicStayRequestsQuery({
    country: activeCountry?.name === "United States" || activeCountry?.name === "USA" || activeCountry?.name === "US"
      ? "United States of America"
      : activeCountry?.name,
    limit: 4
  });
  const { data: approvedEvents, isLoading: eventsLoading } = useGetApprovedEventsQuery({ name: activeCountry?.name, limit: 4 });
  const { data: marketplaceItems, isLoading: marketplaceLoading } = useGetBuySellListingsQuery({ country: activeCountry?.name, limit: 4 });
  const { data: peopleData, isLoading: peopleLoading } = useGetPublicProfilesQuery({
    page: 1,
    limit: 4,
    country: activeCountry?.name === "United States" || activeCountry?.name === "USA" || activeCountry?.name === "US"
      ? "United States of America"
      : activeCountry?.name
  });
  const { data: publicTripsData, isLoading: tripsLoading } = useGetPublicTripsQuery({
    page: 1,
    limit: 4,
    country: activeCountry?.name === "United States" || activeCountry?.name === "USA" || activeCountry?.name === "US"
      ? "United States of America"
      : activeCountry?.name
  });

  const displayedStayRequests = useMemo(() => {
    if (!stayRequestsData) return [];
    let items = [];
    if (Array.isArray(stayRequestsData)) {
      items = stayRequestsData;
    } else if (Array.isArray(stayRequestsData.items)) {
      items = stayRequestsData.items;
    } else if (Array.isArray(stayRequestsData.results)) {
      items = stayRequestsData.results;
    } else if (Array.isArray(stayRequestsData.data)) {
      items = stayRequestsData.data;
    }
    return items.filter(Boolean).slice(0, 4);
  }, [stayRequestsData]);

  const displayedPeople = useMemo(() => {
    if (!peopleData) return [];
    if (Array.isArray(peopleData)) return peopleData;
    if (Array.isArray(peopleData.items)) return peopleData.items;
    if (Array.isArray(peopleData.results)) return peopleData.results;
    if (Array.isArray(peopleData.data?.items)) return peopleData.data.items;
    if (Array.isArray(peopleData.data?.results)) return peopleData.data.results;
    if (Array.isArray(peopleData.data)) return peopleData.data;
    return [];
  }, [peopleData]);

  const displayedTrips = useMemo(() => {
    if (!publicTripsData?.results) return [];
    return publicTripsData.results.map(trip => mapTripToPlan(trip, currentUser)).slice(0, 4);
  }, [publicTripsData, currentUser]);

  const displayedEvents = useMemo(() => {
    if (!approvedEvents || approvedEvents.length === 0) return [];

    // 1. Filter out expired events
    const upcoming = filterUpcomingEvents(approvedEvents);

    // 2. Filter by country matching listing page logic
    return upcoming.filter(event => {
      if (!activeCountry?.name) return true;
      const eventCountry = (event.country || "").toLowerCase().trim();
      const selectedCountry = activeCountry.name.toLowerCase().trim();
      const selectedCountryCode = (activeCountry.code || "").toLowerCase().trim();

      // Allow online events to show globally
      if (event.event_mode?.toLowerCase() === "online") return true;

      return eventCountry === selectedCountry || eventCountry === selectedCountryCode;
    }).slice(0, 4);
  }, [approvedEvents, activeCountry]);

  const [viewMode, setViewMode] = useState("grid");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="bg-white font-inter text-[#00142E]">

      {/* 1. Accommodations Section */}
      <section className="py-4 sm:py-6 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-[#CB2A25]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Accommodations"
            subtitle="Explore verified homes with Indian hosts and cultural amenities."
            linkText="View All Stays"
            linkTo="/accommodations"
            actionText="Host Stay"
            actionTo={getHostPath('property', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {propertiesLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[380px] lg:h-[420px]" />)
            ) : allProperties?.length > 0 ? (
              allProperties.slice(0, 4).filter(Boolean).map((property, idx) => (
                <motion.div
                  key={property.id || property._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PropertyCard property={property} />

                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Stays Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to list a property.</p>
                <Button onClick={() => navigate('/host/create')} className="mt-4 sm:mt-6 bg-[#CB2A25] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">List Your Property</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Stay Requests Section */}
      <section className="py-4 sm:py-6 relative overflow-hidden bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Stay Requests"
            subtitle={`Find seekers looking for verified rooms, roommates, and homes in ${activeCountry?.name || "the area"}.`}
            linkText="View All Requests"
            linkTo="/accommodations?tab=seekers"
            actionText="Post Request"
            actionTo="/accommodations/post-request"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stayRequestsLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : displayedStayRequests?.length > 0 ? (
              displayedStayRequests.map((request, idx) => (
                <motion.div
                  key={request.id || request._id || idx}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <StayRequestCard request={request} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <Home className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Stay Requests Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Looking for a place? Post a request to connect with local hosts and roommates.</p>
                <Button onClick={() => navigate('/accommodations/post-request')} className="mt-4 sm:mt-6 bg-[#CB2A25] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">Post Stay Request</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Travel Partners Section */}
      <section className="py-4 sm:py-6 relative overflow-hidden bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Travel Partners"
            subtitle={`Find co-travelers and explore ${activeCountry?.name || "the world"} together.`}
            linkText="View All Trips"
            linkTo="/travel"
            actionText="Post Trip"
            actionTo={getHostPath('travel', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {tripsLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : displayedTrips?.length > 0 ? (
              displayedTrips.map((plan, idx) => (
                <motion.div
                  key={plan.id || plan._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TripCard plan={plan} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <Plane className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Travel Partners Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to post a trip.</p>
                <Button onClick={() => navigate('/travel')} className="mt-4 sm:mt-6 bg-[#CB2A25] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">Post Your Trip</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. People & Experts Section */}
      <section className="py-4 sm:py-6 relative bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="People"
            subtitle="Connect with verified mentors, local guides, and trusted advisors."
            linkText="View All People"
            linkTo="/people"
            actionText="Become Expert"
            actionTo={getHostPath('people', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {peopleLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[320px] sm:h-[360px] lg:h-[380px]" />)
            ) : displayedPeople?.length > 0 ? (
              displayedPeople.slice(0, 4).map((person, idx) => (
                <motion.div
                  key={person.id || person._id || idx}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <PeopleCard person={person} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Advisors Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to join as a verified advisor!</p>
                <Button onClick={() => navigate('/people/become')} className="mt-4 sm:mt-6 bg-[#CB2A25] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">Join as an Expert</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Events Section */}
      <section className="py-4 sm:py-6 relative bg-[#F8F9FA] overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Events"
            subtitle="Discover festivals, meetups, and cultural celebrations near you."
            linkText="View All Events"
            linkTo="/events"
            actionText="Host Event"
            actionTo={getHostPath('event', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {eventsLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[350px] lg:h-[380px] bg-gray-100 rounded-2xl" />)
            ) : displayedEvents.length > 0 ? (
              displayedEvents.map((event, idx) => (
                <motion.div
                  key={event.id || event._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <EventCard
                    event={event}
                    viewMode="grid"
                    onViewDetails={(id) => navigate(`/events/${id}`, { state: { eventParam: event } })}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Events Scheduled</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base mb-6 sm:mb-8">Be the first to create an event!</p>
                <Link to="/events/host" className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00142E] text-white rounded-full font-bold hover:bg-[#CB2A25] transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                  Host an Event
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Marketplace */}
      <section className="py-4 sm:py-6 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Marketplace"
            subtitle="Buy, sell, and trade with trusted members."
            linkText="Browse Marketplace"
            linkTo="/marketplace"
            actionText="Sell Item"
            actionTo={getHostPath('marketplace', isAuthenticated)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {marketplaceLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : marketplaceItems?.length > 0 ? (
              marketplaceItems.slice(0, 4).filter(Boolean).map((item, idx) => (
                <motion.div key={item.id} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                  <ProductCard product={item} onClick={(p) => navigate(`/marketplace?product=${p.id}`)} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16 text-[#00142E]/50">No active listings.</div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeFeatured;