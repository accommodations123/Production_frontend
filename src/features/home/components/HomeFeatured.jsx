import React, { useMemo } from 'react';
import { MapPin, Calendar, Plane
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountry } from '@/context/CountryContext';
import { filterUpcomingEvents } from '@/shared/utils/eventUtils';
import { getHostPath } from '@/shared/utils/navigationUtils';

// API Hooks
import {
  useGetAllPropertiesQuery,
  useGetApprovedEventsQuery,
  useGetBuySellListingsQuery,
  useGetPublicTripsQuery
} from '@/store/api/hostApi';
import { useAuth } from '@/features/events/hooks/useAuth';

// UI Components
import { Button } from '@/shared/ui/button';

// Child Components
import { SectionHeader } from '@/features/home/components/featured/SectionHeader';
import { PropertyCard } from '@/features/home/components/featured/PropertyCard';
import { EventCard } from '@/features/home/components/featured/EventCard';
import { MarketplaceCard } from '@/features/marketplace/components/MarketplaceCard';
import TravelPartnerCard from '@/features/travel/components/TravelPartnerCard';
import { resolveImageUrl } from '@/shared/utils/imageUtils';

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
};

const HomeFeatured = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("user");
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();
  const { data: allProperties, isLoading: propertiesLoading } = useGetAllPropertiesQuery({ country: activeCountry?.name, limit: 4 });
  const { data: approvedEvents, isLoading: eventsLoading } = useGetApprovedEventsQuery({ name: activeCountry?.name, limit: 4 });
  const { data: marketplaceItems, isLoading: marketplaceLoading } = useGetBuySellListingsQuery({ country: activeCountry?.name, limit: 4 });
  const { data: publicTripsData, isLoading: tripsLoading } = useGetPublicTripsQuery({
    page: 1,
    limit: 4,
    country: activeCountry?.name === "United States" || activeCountry?.name === "USA" || activeCountry?.name === "US"
      ? "United States of America"
      : activeCountry?.name
  });

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="bg-white font-sans text-foreground">

      {/* 1. Community Stays Section */}
      <section className="py-6 sm:py-8 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 relative z-10">
          <SectionHeader
            title="Accommodations"
            subtitle="Explore verified homes with Indian hosts and cultural amenities."
            linkText="View All Stays"
            linkTo="/search"
            actionText="Host Stay"
            actionTo={getHostPath('property', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {propertiesLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[300px] sm:h-[380px] lg:h-[420px]" />)
            ) : allProperties?.length > 0 ? (
              allProperties.slice(0, 4).filter(Boolean).map((property, idx) => (
                <motion.div
                  key={property.id || property._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <PropertyCard property={property} />

                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-8 sm:py-10 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Stays Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to list a property in our community.</p>
                <Button onClick={() => navigate('/host/create')} className="mt-4 sm:mt-6 bg-[#E1392A] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">List Your Property</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Travel Partners Section */}
      <section className="py-4 sm:py-6 relative overflow-hidden bg-white">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
          <SectionHeader
            title="Travel Partners"
            subtitle={`Find co-travelers and explore ${activeCountry?.name || "the world"} together.`}
            linkText="View All Trips"
            linkTo="/travel"
            actionText="Post Trip"
            actionTo={getHostPath('travel', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {tripsLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : displayedTrips?.length > 0 ? (
              displayedTrips.map((plan, idx) => (
                <motion.div
                  key={plan.id || plan._id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <TravelPartnerCard plan={plan} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-8 sm:py-10 text-center bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[#D1CBB7]/30">
                <Plane className="w-10 h-10 sm:w-12 sm:h-12 text-[#D1CBB7] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Travel Partners Found</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base">Be the first to post a trip for our community.</p>
                <Button onClick={() => navigate('/travel')} className="mt-4 sm:mt-6 bg-[#E1392A] hover:bg-[#a0221e] text-white rounded-full text-sm sm:text-base px-4 sm:px-6 py-2">Post Your Trip</Button>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* 4. Community Events Section */}
      <section className="py-4 sm:py-6 relative bg-[#F8F9FA] overflow-hidden">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 relative z-10">
          <SectionHeader
            title="Events"
            subtitle="Discover festivals, meetups, and cultural celebrations near you."
            linkText="View All Events"
            linkTo="/events"
            actionText="Host Event"
            actionTo={getHostPath('event', isAuthenticated)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
              <div className="col-span-full py-8 sm:py-10 text-center bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#00142E] mb-2">No Events Scheduled</h3>
                <p className="text-[#00142E]/60 text-sm sm:text-base mb-6 sm:mb-8">Be the first to create a community event!</p>
                <Link to="/events/host" className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00142E] text-white rounded-full font-bold hover:bg-[#E1392A] transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
                  Host an Event
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Marketplace */}
      <section className="py-4 sm:py-6 bg-white">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
          <SectionHeader
            title="Marketplace"
            subtitle="Buy, sell, and trade with trusted community members."
            linkText="Browse Marketplace"
            linkTo="/marketplace"
            actionText="Sell Item"
            actionTo={getHostPath('marketplace', isAuthenticated)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {marketplaceLoading ? (
              [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[280px] sm:h-[320px] lg:h-[340px]" />)
            ) : marketplaceItems?.length > 0 ? (
              marketplaceItems.slice(0, 4).filter(Boolean).map((item, idx) => (
                <motion.div key={item.id} {...fadeInUp} transition={{ delay: idx * 0.1 }} className="h-full">
                  <MarketplaceCard product={item} onClick={(p) => navigate(`/marketplace?product=${p.id}`)} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16 text-[#00142E]/50">No active listings.</div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Safety Tips Section */}
      {/* <section className="py-4 sm:py-6 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Safety Tips"
            subtitle="Important guidelines for a safe and positive community experience."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SAFETY_TIPS.map((tip, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#00142E]/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#00142E]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#00142E] text-base sm:text-lg mb-2">{tip.title}</h3>
                    <p className="text-[#00142E]/60 text-sm">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 7. Feature Cards Section */}
      {/* <section className="py-4 sm:py-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURE_CARDS.map((card, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-[#00142E] to-[#00142E]/80 p-6 sm:p-8 rounded-2xl text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-white/80 mb-6 text-sm sm:text-base">{card.description}</p>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#00142E] rounded-full text-sm sm:text-base">
                    {card.buttonText}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 8. Final Call to Action */}
      {/* <section className="py-6 sm:py-8 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#00142E] tracking-tight">
              Ready to find your <span className="text-[#E1392A]">home</span>?
            </h2>
            <p className="text-lg sm:text-xl text-[#00142E]/60">
              Join thousands of Indians abroad who are already connecting, living, and celebrating together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => navigate('/search')}
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 lg:px-10 rounded-full bg-[#00142E] text-white hover:bg-[#00142E]/90 text-base sm:text-lg font-bold shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section> */}


    </div>
  );
};

export default HomeFeatured;
