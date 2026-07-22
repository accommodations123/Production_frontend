import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Plane,
  ShoppingBag,
  Briefcase,
  Users
} from 'lucide-react';

import { useCountry } from '@/context/CountryContext';
import { filterUpcomingEvents } from '@/shared/utils/eventUtils';
import { getHostPath } from '@/shared/utils/navigationUtils';

import {
  useGetAllPropertiesQuery,
  useGetApprovedEventsQuery,
  useGetBuySellListingsQuery,
  useGetPublicTripsQuery
} from '@/store/api/hostApi';
import { useAuth } from '@/features/events/hooks/useAuth';

import { Button } from '@/shared/ui/button';

import { SectionHeader } from '@/features/home/components/featured/SectionHeader';
import { PropertyCard } from '@/features/home/components/featured/PropertyCard';
import { EventCard } from '@/features/home/components/featured/EventCard';
import { MarketplaceCard } from '@/features/marketplace/components/MarketplaceCard';
import TravelPartnerCard from '@/features/travel/components/TravelPartnerCard';
import { resolveImageUrl } from '@/shared/utils/imageUtils';

// Inline Skeleton helper
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral/10 rounded-2xl ${className}`} />
);

const mapTripToPlan = (trip, currentUser = null) => {
  const normalizeCountry = (c) => {
    if (!c) return '';
    const lower = c.toLowerCase().trim();
    if (lower === 'united states' || lower === 'usa' || lower === 'us' || lower === 'united states of america') {
      return 'United States of America';
    }
    return c;
  };

  const extractSocials = (t) => {
    const getVal = (val) => {
      if (val === undefined || val === null) return '';
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
        ''
      ),
      email: getVal(
        t.host?.email ||
        t.host?.User?.email ||
        t.user?.email ||
        t.user?.User?.email ||
        t.email ||
        ''
      ),
      instagram: getVal(
        t.host?.instagram ||
        t.host?.User?.instagram ||
        t.user?.instagram ||
        t.user?.User?.instagram ||
        t.instagram ||
        ''
      ),
      facebook: getVal(
        t.host?.facebook ||
        t.host?.User?.facebook ||
        t.user?.facebook ||
        t.user?.User?.facebook ||
        t.facebook ||
        ''
      ),
      twitter: getVal(
        t.host?.twitter ||
        t.host?.x ||
        t.host?.User?.twitter ||
        t.user?.twitter ||
        t.user?.x ||
        t.user?.User?.twitter ||
        t.twitter ||
        ''
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
      user: { fullName: currentUser?.fullName || 'Me', image: resolveImageUrl(currentUser?.image || null) },
      flight: {
        from: trip.from_city || '',
        to: trip.to_city || '',
        from_country: normalizeCountry(trip.from_country || ''),
      },
      destination: trip.to_city ? `${trip.to_city}` : '',
      date: trip.travel_date,
      status: trip.status || 'active',
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
        age: trip.trip_meta.age || '',
        languages: trip.trip_meta.languages || [],
        gender: '', // Not provided in payload, default to empty
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
  let fullName = 'Traveler';

  if (trip.host?.full_name) {
    fullName = trip.host.full_name;
  } else if (trip.user?.full_name) {
    fullName = trip.user.full_name;
  } else if (trip.host?.user?.full_name) {
    fullName = trip.host.user.full_name;
  } else if (trip.host_id === currentUser?.id && currentUser?.fullName) {
    fullName = currentUser.fullName;
  } else if (trip.host_id === currentUser?.id && (currentUser?.first_name || currentUser?.last_name)) {
    fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
  }

  return {
    id: trip.id,
    host_id: trip.host_id,
    matches: trip.matches || [],
    user: {
      fullName: fullName,
      age: trip.age || trip.user?.age || trip.host?.age || '',
      gender: trip.gender || trip.user?.gender || trip.host?.gender || '',
      country: normalizeCountry(trip.user?.country || trip.host?.country || trip.from_country),
      state: trip.user?.state || trip.host?.city || '',
      city: trip.user?.city || trip.host?.city || '',
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

export function HomeFeatured() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('user');
  const { user: currentUser } = useAuth();
  const { activeCountry } = useCountry();

  const [activeTab, setActiveTab] = useState('stays');

  // Queries
  const { data: allProperties, isLoading: propertiesLoading } = useGetAllPropertiesQuery({ country: activeCountry?.name, limit: 4 });
  const { data: approvedEvents, isLoading: eventsLoading } = useGetApprovedEventsQuery({ name: activeCountry?.name, limit: 4 });
  const { data: marketplaceItems, isLoading: marketplaceLoading } = useGetBuySellListingsQuery({ country: activeCountry?.name, limit: 4 });
  const { data: publicTripsData, isLoading: tripsLoading } = useGetPublicTripsQuery({
    page: 1,
    limit: 4,
    country: activeCountry?.name === 'United States' || activeCountry?.name === 'USA' || activeCountry?.name === 'US'
      ? 'United States of America'
      : activeCountry?.name
  });

  const displayedTrips = useMemo(() => {
    if (!publicTripsData?.results) return [];
    return publicTripsData.results.map(trip => mapTripToPlan(trip, currentUser)).slice(0, 4);
  }, [publicTripsData, currentUser]);

  const displayedEvents = useMemo(() => {
    if (!approvedEvents || approvedEvents.length === 0) return [];
    const upcoming = filterUpcomingEvents(approvedEvents);
    return upcoming.filter(event => {
      if (!activeCountry?.name) return true;
      const eventCountry = (event.country || '').toLowerCase().trim();
      const selectedCountry = activeCountry.name.toLowerCase().trim();
      const selectedCountryCode = (activeCountry.code || '').toLowerCase().trim();

      if (event.event_mode?.toLowerCase() === 'online') return true;

      return eventCountry === selectedCountry || eventCountry === selectedCountryCode;
    }).slice(0, 4);
  }, [approvedEvents, activeCountry]);

  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, ease: 'easeOut' }
  };

  const services = [
    {
      id: 'stays',
      title: 'Expat Stays',
      description: 'Rent verified rooms, shared flats, or apartments hosted by established community members. Navigate housing with cultural ease.',
      icon: MapPin,
      badge: 'Accommodations',
      tags: ['Vetted Hosts', 'Flexible Rentals', 'Local Support'],
      browseTo: '/search',
      createTo: getHostPath('property', isAuthenticated),
      requestTo: isAuthenticated ? '/search?action=request' : '/signin'
    },
    {
      id: 'marketplace',
      title: 'Trusted Marketplace',
      description: 'Buy or sell furniture, appliances, and cultural items securely within your network. Free listings and no commission fees.',
      icon: ShoppingBag,
      badge: 'Buy & Sell',
      tags: ['Pre-loved Goods', 'Expat Essentials', 'No Commissions'],
      browseTo: '/marketplace',
      createTo: getHostPath('marketplace', isAuthenticated)
    },
    {
      id: 'events',
      title: 'Cultural Events',
      description: 'Attend local festivals, professional meetups, and language exchanges. Build a reliable local community close to home.',
      icon: Calendar,
      badge: 'Festivals & Meetups',
      tags: ['Diwali & Holi', 'Networking', 'Local Gatherings'],
      browseTo: '/events',
      createTo: getHostPath('event', isAuthenticated)
    },
    {
      id: 'travel',
      title: 'Travel Matching',
      description: 'Connect with co-travelers flying the same route. Share international flights, coordinate airport rides, and organize shared trips.',
      icon: Plane,
      badge: 'Shared Travel',
      tags: ['Flight Companions', 'Shared Cab Rides', 'Verify Identity'],
      browseTo: '/travel',
      createTo: getHostPath('travel', isAuthenticated)
    },
    {
      id: 'careers',
      title: 'Expat Placement',
      description: 'Discover professional expat opportunities and contracting assignments from leading tier-1 industry clients.',
      icon: Briefcase,
      badge: 'Careers & Jobs',
      tags: ['W2 Benefits', 'Contract Placements', 'Global Recruits'],
      browseTo: '/career',
      createTo: '/contact'
    },
    {
      id: 'people',
      title: 'People Directory',
      description: 'Find verified relocation experts, local immigration lawyers, visa consultants, tax advisors, and local expat guides.',
      icon: Users,
      badge: 'Expert Consultations',
      tags: ['Visa Experts', 'Tax Advisors', 'Local Guides'],
      browseTo: '/people',
      createTo: '/hosts'
    }
  ];


  const tabsList = [
    { id: 'stays', label: 'Verified Stays', icon: MapPin },
    { id: 'travel', label: 'Travel Partners', icon: Plane },
    { id: 'events', label: 'Cultural Events', icon: Calendar },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag }
  ];

  return (
    <div className="bg-white font-sans text-[#222222]">

      {/* 1. Services Overview Section (Professional Grid) */}
      <section className="pt-10 pb-24 bg-gradient-to-b from-[#FCFAF6] via-[#FFFFFF] to-[#FAF8F5]/35 border-t border-slate-100 relative">
        {/* Soft decorative ambient glow */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#D5CBA8]/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 text-left relative z-10">

          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-accent mb-2 block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00162D] tracking-tight leading-tight">
              Relocating with Vetted Support & Shared Culture
            </h2>
            <p className="text-slate-500 mt-3 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              Our platform brings utility, security, and familiarity to international moves. Choose an option below to browse active directories or post your own listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  {...fadeInUp}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#CB2A26]/40 hover:shadow-lg transition-all duration-300 h-full justify-between hover:-translate-y-1 group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0 group-hover:bg-[#CB2A26] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                          {service.badge}
                        </span>
                        <h3 className="text-base font-extrabold text-[#00162D] group-hover:text-[#CB2A26] transition-colors duration-300 tracking-tight">{service.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 font-normal min-h-[3rem]">
                      {service.description}
                    </p>

                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(service.browseTo)}
                        className="flex-1 h-9 rounded-xl border border-slate-250 text-[#00162D] hover:bg-slate-50 hover:border-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Browse Listings
                      </button>
                      <button
                        onClick={() => navigate(service.createTo)}
                        className="flex-1 h-9 rounded-xl bg-[#CB2A26] hover:bg-[#A9221F] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm hover:shadow"
                      >
                        {service.id === 'careers' ? 'Contact Support' : service.id === 'people' ? 'Become Expert' : 'Post Ad'}
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Interactive Explorer Dashboard Section */}
      <section id="explore-dashboard" className="py-24 bg-gradient-to-b from-[#FAF8F5]/30 to-[#FCFAF6]/60 border-t border-slate-100 relative">
        <div className="absolute bottom-12 left-10 w-[350px] h-[350px] bg-[#E1392A]/5 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 relative z-10">

          <div className="text-left mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2 block">
              Marketplace & Matches
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Real-Time Community Listings
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl font-normal leading-relaxed">
              Explore active properties, travel matches, local celebrations, and items submitted by verified members.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-start mb-12 w-full">
            <div className="grid grid-cols-2 sm:flex sm:flex-row p-1 bg-slate-200/50 backdrop-blur-md rounded-xl border border-slate-200/30 w-full sm:w-auto gap-1">
              {tabsList.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none w-full sm:w-auto whitespace-nowrap ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/20"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-accent' : 'text-slate-400'}`} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'stays' && (
                  <div>
                    <SectionHeader
                      title="Available Stays"
                      subtitle="Browse vetted flats and rooms listed directly by expat hosts."
                      linkText="View All Stays"
                      linkTo="/search"
                      actionText="Host a Stay"
                      actionTo={getHostPath('property', isAuthenticated)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {propertiesLoading ? (
                        [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[380px]" />)
                      ) : allProperties?.length > 0 ? (
                        allProperties.slice(0, 4).filter(Boolean).map((property, idx) => (
                          <motion.div
                            key={property.id || property._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="h-full"
                          >
                            <PropertyCard property={property} />
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-primary mb-1">No Stays Found</h3>
                          <p className="text-slate-450 text-sm max-w-sm mx-auto mb-6 font-normal">Be the first to list a premium property in our community.</p>
                          <Button onClick={() => navigate('/host/create')} className="bg-accent hover:bg-accent/95 text-white rounded-xl text-sm px-6 py-2 h-10 font-semibold shadow-sm transition-all duration-200">List Your Property</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'travel' && (
                  <div>
                    <SectionHeader
                      title="Travel Companions"
                      subtitle={`Locate expats flying to or from ${activeCountry?.name || 'various destinations'}.`}
                      linkText="View All Trips"
                      linkTo="/travel"
                      actionText="Post Trip Details"
                      actionTo={getHostPath('travel', isAuthenticated)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {tripsLoading ? (
                        [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[320px]" />)
                      ) : displayedTrips?.length > 0 ? (
                        displayedTrips.map((plan, idx) => (
                          <motion.div
                            key={plan.id || plan._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="h-full"
                          >
                            <TravelPartnerCard plan={plan} />
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-primary mb-1">No Travel Partners Found</h3>
                          <p className="text-slate-450 text-sm max-w-sm mx-auto mb-6 font-normal">Be the first to post a trip for our community.</p>
                          <Button onClick={() => navigate('/travel')} className="bg-accent hover:bg-accent/95 text-white rounded-xl text-sm px-6 py-2 h-10 font-semibold shadow-sm transition-all duration-200">Post Your Trip</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div>
                    <SectionHeader
                      title="Upcoming Events"
                      subtitle="Celebrate festivals, local meetups, and networking dinners."
                      linkText="View All Events"
                      linkTo="/events"
                      actionText="Host an Event"
                      actionTo={getHostPath('event', isAuthenticated)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {eventsLoading ? (
                        [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[350px]" />)
                      ) : displayedEvents.length > 0 ? (
                        displayedEvents.map((event, idx) => (
                          <motion.div
                            key={event.id || event._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
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
                        <div className="col-span-full py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-primary mb-1">No Events Scheduled</h3>
                          <p className="text-slate-450 text-sm max-w-sm mx-auto mb-6 font-normal">Be the first to create a community event!</p>
                          <Button onClick={() => navigate(getHostPath('event', isAuthenticated))} className="bg-accent hover:bg-accent/95 text-white rounded-xl text-sm px-6 py-2 h-10 font-semibold shadow-sm transition-all duration-200">
                            Host an Event
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'marketplace' && (
                  <div>
                    <SectionHeader
                      title="Community Marketplace"
                      subtitle="Trade furniture, appliances, or clothes securely with nearby members."
                      linkText="Browse Marketplace"
                      linkTo="/marketplace"
                      actionText="Post an Item"
                      actionTo={getHostPath('marketplace', isAuthenticated)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {marketplaceLoading ? (
                        [1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-[320px]" />)
                      ) : marketplaceItems?.length > 0 ? (
                        marketplaceItems.slice(0, 4).filter(Boolean).map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="h-full"
                          >
                            <MarketplaceCard product={item} onClick={(p) => navigate(`/marketplace?product=${p.id}`)} />
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-primary mb-1">No Active Listings</h3>
                          <p className="text-slate-450 text-sm max-w-sm mx-auto mb-6 font-normal">Be the first to list an item in the community marketplace.</p>
                          <Button onClick={() => navigate(getHostPath('marketplace', isAuthenticated))} className="bg-accent hover:bg-accent/95 text-white rounded-xl text-sm px-6 py-2 h-10 font-semibold shadow-sm transition-all duration-200">
                            Sell an Item
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeFeatured;
