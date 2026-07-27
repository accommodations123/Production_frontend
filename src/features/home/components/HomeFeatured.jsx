import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Plane,
  ShoppingBag,
  Briefcase,
  Users,
  ChevronRight,
  Plus
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
import { useGetMeQuery } from '@/store/api/authApi';

import { PropertyCard } from '@/features/home/components/featured/PropertyCard';
import { EventCard } from '@/features/home/components/featured/EventCard';
import { MarketplaceCard, TravelPartnerCard } from '@/shared/components/cards';

const formatEventDate = (evt) => {
  const dateStr = evt.event_date || evt.date || evt.start_date;
  if (!dateStr) return 'Date TBA';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const fallbackDate = new Date(`${cleanDateStr}T00:00:00Z`);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
    return 'Date TBA';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function HomeFeatured() {
  const navigate = useNavigate();
  const { data: currentUser } = useGetMeQuery();
  const isAuthenticated = !!currentUser;
  const { activeCountry } = useCountry();

  // Selected Tab for Real-Time Community Listings Section
  const [activeTab, setActiveTab] = useState('stays');

  /* -------------------------------
     API Queries
  -------------------------------- */
  const { data: allProperties = [], isLoading: propertiesLoading } = useGetAllPropertiesQuery({
    country: activeCountry?.name,
    limit: 6
  });

  const { data: rawEvents = [], isLoading: eventsLoading } = useGetApprovedEventsQuery({
    country: activeCountry?.name,
    limit: 6
  });

  const { data: marketplaceData, isLoading: marketplaceLoading } = useGetBuySellListingsQuery({
    country: activeCountry?.name,
    limit: 6
  });

  const { data: tripsData, isLoading: tripsLoading } = useGetPublicTripsQuery({
    country: activeCountry?.name,
    limit: 6
  });

  // Filter valid events
  const approvedEvents = useMemo(() => {
    return filterUpcomingEvents(rawEvents);
  }, [rawEvents]);

  // Extract marketplace listings
  const marketplaceListings = useMemo(() => {
    if (!marketplaceData) return [];
    if (Array.isArray(marketplaceData)) return marketplaceData;
    if (Array.isArray(marketplaceData.listings)) return marketplaceData.listings;
    if (Array.isArray(marketplaceData.data)) return marketplaceData.data;
    return [];
  }, [marketplaceData]);

  const extractSocials = (t) => {
    const getVal = (val) => (val === undefined || val === null ? "" : String(val).trim());
    return {
      whatsapp: getVal(t.host?.whatsapp || t.host?.phone || t.host?.User?.phone || t.user?.whatsapp || t.user?.phone || t.user?.User?.phone || t.whatsapp || t.phone || ""),
      email: getVal(t.host?.email || t.host?.User?.email || t.user?.email || t.user?.User?.email || t.email || ""),
      instagram: getVal(t.host?.instagram || t.host?.User?.instagram || t.user?.instagram || t.user?.User?.instagram || t.instagram || ""),
      facebook: getVal(t.host?.facebook || t.host?.User?.facebook || t.user?.facebook || t.user?.User?.facebook || t.facebook || ""),
      linkedin: getVal(t.host?.linkedin || t.host?.User?.linkedin || t.user?.linkedin || t.user?.User?.linkedin || t.linkedin || ""),
      twitter: getVal(t.host?.twitter || t.host?.x || t.host?.User?.twitter || t.user?.twitter || t.user?.x || t.user?.User?.twitter || t.twitter || ""),
    };
  };

  const mapTripToPlan = (trip) => {
    if (!trip) return null;
    return {
      id: trip.id || trip._id,
      user: {
        id: trip.host?.id || trip.user?.id || trip.host_id || "",
        fullName: trip.host?.full_name || trip.user?.fullName || trip.user?.name || "Traveler",
        image: trip.host?.profile_image || trip.host?.User?.profile_image || trip.user?.image || trip.user?.profile_image || null,
        age: trip.trip_meta?.age || trip.user?.age || null,
        gender: trip.user?.gender || "",
        languages: trip.trip_meta?.languages || trip.user?.languages || [],
        verified: trip.host?.verified ?? trip.user?.verified ?? false,
      },
      flight: {
        airline: trip.flight?.airline || "",
        flightNumber: trip.flight?.flightNumber || "",
        from: trip.flight?.from || trip.from_city || trip.origin || "",
        from_country: trip.flight?.from_country || trip.from_country || "",
        to: trip.flight?.to || trip.to_city || trip.destination || "",
        to_country: trip.flight?.to_country || trip.to_country || "",
        departureTime: trip.flight?.departureTime || trip.time || "",
        arrivalTime: trip.flight?.arrivalTime || "",
      },
      destination: trip.destination || trip.flight?.to || "",
      date: trip.date || trip.travel_date || trip.flight?.departureDate || "",
      socials: extractSocials(trip),
    };
  };

  // Extract public trips
  const tripsList = useMemo(() => {
    if (!tripsData) return [];
    let raw = [];
    if (Array.isArray(tripsData)) raw = tripsData;
    else if (Array.isArray(tripsData.results)) raw = tripsData.results;
    else if (Array.isArray(tripsData.trips)) raw = tripsData.trips;
    else if (Array.isArray(tripsData.data)) raw = tripsData.data;
    return raw.map(mapTripToPlan).filter(Boolean);
  }, [tripsData]);

  /* -------------------------------
     6 Service Category Cards Config (Screenshot 2)
  -------------------------------- */
  const serviceCards = [
    {
      id: 'accommodations',
      title: 'Expat Stays',
      tag: 'ACCOMMODATIONS',
      tagBg: 'bg-red-50 text-[#E1392A]',
      icon: MapPin,
      iconBg: 'bg-[#E1392A]',
      description: 'Rent verified rooms, shared flats, or apartments hosted by established community members. Navigate housing with cultural ease.',
      browsePath: '/search',
      actionLabel: 'Post Ad',
      actionPath: getHostPath('accommodations', isAuthenticated)
    },
    {
      id: 'marketplace',
      title: 'Trusted Marketplace',
      tag: 'BUY & SELL',
      tagBg: 'bg-emerald-50 text-[#10B981]',
      icon: ShoppingBag,
      iconBg: 'bg-[#10B981]',
      description: 'Buy or sell furniture, appliances, and cultural items securely within your network. Free listings and no commission fees.',
      browsePath: '/marketplace',
      actionLabel: 'Post Ad',
      actionPath: getHostPath('marketplace', isAuthenticated)
    },
    {
      id: 'events',
      title: 'Cultural Events',
      tag: 'FESTIVALS & MEETUPS',
      tagBg: 'bg-amber-50 text-[#D97706]',
      icon: Calendar,
      iconBg: 'bg-[#F59E0B]',
      description: 'Attend local festivals, professional meetups, and language exchanges. Build a reliable local community close to home.',
      browsePath: '/events',
      actionLabel: 'Post Ad',
      actionPath: getHostPath('events', isAuthenticated)
    },
    {
      id: 'travel',
      title: 'Travel Matching',
      tag: 'SHARED TRAVEL',
      tagBg: 'bg-blue-50 text-[#3B82F6]',
      icon: Plane,
      iconBg: 'bg-[#3B82F6]',
      description: 'Connect with co-travelers flying the same route. Share international flights, coordinate airport rides, and organize shared trips.',
      browsePath: '/travel',
      actionLabel: 'Post Ad',
      actionPath: getHostPath('travel', isAuthenticated)
    },
    {
      id: 'careers',
      title: 'Expat Placement',
      tag: 'CAREERS & JOBS',
      tagBg: 'bg-purple-50 text-[#8B5CF6]',
      icon: Briefcase,
      iconBg: 'bg-[#8B5CF6]',
      description: 'Discover professional expat opportunities and contracting assignments from leading tier-1 industry clients.',
      browsePath: '/career',
      actionLabel: 'Contact Support',
      actionPath: '/contact'
    },
    {
      id: 'people',
      title: 'People Directory',
      tag: 'EXPERT CONSULTATIONS',
      tagBg: 'bg-pink-50 text-[#EC4899]',
      icon: Users,
      iconBg: 'bg-[#EC4899]',
      description: 'Find verified relocation experts, local immigration lawyers, visa consultants, tax advisors, and local expat guides.',
      browsePath: '/people',
      actionLabel: 'Become Expert',
      actionPath: '/people/register'
    }
  ];

  /* -------------------------------
     Community Listings Tabs Config (Screenshot 3)
  -------------------------------- */
  const communityTabs = [
    { id: 'stays', label: 'Accommodations', icon: MapPin },
    { id: 'marketplace', label: 'Buy/Sell', icon: ShoppingBag },
    { id: 'travel', label: 'Travel Partners', icon: Plane },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="bg-[#FAF9F6] font-sans text-[#222222] pt-14 pb-20">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12 space-y-20">

        {/* ========================================================
            SECTION 1: 6 Service Cards Grid (Exact Screenshot 2)
           ======================================================== */}
        <section aria-labelledby="services-grid-title">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {serviceCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div>
                    {/* Top Row: Icon + Tag */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <CardIcon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-3 py-1 rounded-full ${card.tagBg}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#00162D] mb-2 tracking-tight">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  {/* Dual Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => navigate(card.browsePath)}
                      className="w-full h-11 rounded-xl border border-slate-900 text-slate-900 font-extrabold text-xs flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Browse Listings
                    </button>
                    <button
                      onClick={() => navigate(card.actionPath)}
                      className="w-full h-11 rounded-xl bg-[#E1392A] hover:bg-[#CB2A26] text-white font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      {card.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            SECTION 2: Real-Time Community Listings (Exact Screenshot 3)
           ======================================================== */}
        <section aria-labelledby="community-listings-title" className="text-left pt-4">

          {/* Header */}
          <div className="space-y-2 mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-[#E1392A] text-xs font-extrabold uppercase tracking-wider">
              MARKETPLACE & MATCHES
            </span>
            <h2 id="community-listings-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#00162D] tracking-tight">
              Real–Time Community Listings
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-3xl">
              Explore active properties, travel matches, local celebrations, and items submitted by verified members.
            </p>
          </div>

          {/* Dark Navy Capsule Tab Bar */}
          <div className="bg-[#00162D] rounded-2xl sm:rounded-full p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full sm:max-w-fit mb-8 shadow-md">
            {communityTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? 'bg-white text-[#00162D] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <TabIcon className="w-4 h-4 stroke-[2.2]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-header & Action for Active Tab */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#00162D]">
                {activeTab === 'stays' && 'Available Stays'}
                {activeTab === 'travel' && 'Available Travel Matches'}
                {activeTab === 'events' && 'Upcoming Community Events'}
                {activeTab === 'marketplace' && 'Marketplace Items'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {activeTab === 'stays' && 'Browse vetted flats and rooms listed directly by expat hosts.'}
                {activeTab === 'travel' && 'Connect with verified co-travelers flying your destination route.'}
                {activeTab === 'events' && 'Join local meetups, cultural festivals, and networking socials.'}
                {activeTab === 'marketplace' && 'Buy and sell furniture, electronics, and goods from fellow expats.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (activeTab === 'stays') navigate(getHostPath('accommodations', isAuthenticated));
                  if (activeTab === 'travel') navigate(getHostPath('travel', isAuthenticated));
                  if (activeTab === 'events') navigate(getHostPath('events', isAuthenticated));
                  if (activeTab === 'marketplace') navigate(getHostPath('marketplace', isAuthenticated));
                }}
                className="px-4 py-2.5 rounded-xl bg-[#E1392A] hover:bg-[#CB2A26] text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {activeTab === 'stays' && 'Host a Stay'}
                  {activeTab === 'travel' && 'Post Travel'}
                  {activeTab === 'events' && 'Host Event'}
                  {activeTab === 'marketplace' && 'Post Item'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (activeTab === 'stays') navigate('/search');
                  if (activeTab === 'travel') navigate('/travel');
                  if (activeTab === 'events') navigate('/events');
                  if (activeTab === 'marketplace') navigate('/marketplace');
                }}
                className="text-xs font-extrabold text-[#E1392A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {activeTab === 'stays' && 'View All Stays'}
                  {activeTab === 'travel' && 'View All Trips'}
                  {activeTab === 'events' && 'View All Events'}
                  {activeTab === 'marketplace' && 'View All Items'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Tab Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTab === 'stays' && (
              propertiesLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading stays...</div>
              ) : allProperties.length > 0 ? (
                allProperties.slice(0, 4).map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">No active stays available in this region.</div>
              )
            )}

            {activeTab === 'travel' && (
              tripsLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading travel matches...</div>
              ) : tripsList.length > 0 ? (
                tripsList.slice(0, 4).map((trip) => (
                  <TravelPartnerCard key={trip.id} plan={trip} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">No travel matches listed yet.</div>
              )
            )}

            {activeTab === 'events' && (
              eventsLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading events...</div>
              ) : approvedEvents.length > 0 ? (
                approvedEvents.slice(0, 4).map((evt) => (
                  <EventCard
                    key={evt.id || evt._id}
                    event={evt}
                    onViewDetails={(id) => navigate(`/events/${id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">No upcoming events scheduled.</div>
              )
            )}

            {activeTab === 'marketplace' && (
              marketplaceLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading marketplace items...</div>
              ) : marketplaceListings.length > 0 ? (
                marketplaceListings.slice(0, 4).map((item) => (
                  <MarketplaceCard key={item.id} product={item} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">No marketplace items listed yet.</div>
              )
            )}
          </div>

        </section>

      </div>
    </div>
  );
}

export default HomeFeatured;
