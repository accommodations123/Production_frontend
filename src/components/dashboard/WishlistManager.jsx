'use client';

import React, { useState } from 'react';
import { useGetWishlistQuery } from '@/hooks/data/useWishlistHooks';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { StayRequestCard } from '@/components/search/StayRequestCard';
import { EventCard } from '@/app/events/components/EventCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import TripCard from '@/components/travel/TripCard';
import { Loader2, Heart, ShoppingBag, Calendar, Home, Plane, Users, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PeopleCard } from '@/features/people/components/PeopleCard';
import { cn } from "@/lib/utils";
import { resolveImageUrl } from '@/lib/imageUtils';

export function WishlistManager() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch all saved items so all tabs and counts work seamlessly without redundant network calls
  const { data, isLoading, isFetching } = useGetWishlistQuery({
    type: 'all',
    page: 1,
    limit: 100
  });

  const normalizeItemType = (t) => {
    const clean = (t || '').toLowerCase().replace(/[-_\s]/g, '');
    if (clean === 'buysell' || clean === 'marketplace' || clean === 'product') return 'buy-sell';
    if (clean === 'property' || clean === 'stay' || clean === 'stays') return 'property';
    if (clean === 'stayrequest' || clean === 'stayrequests') return 'stay-request';
    if (clean === 'event' || clean === 'events') return 'event';
    if (clean === 'trip' || clean === 'travel' || clean === 'traveltrip' || clean === 'trips') return 'trip';
    if (clean === 'expert' || clean === 'people' || clean === 'profile' || clean === 'professional' || clean === 'experts') return 'expert';
    return clean;
  };

  const tabs = [
    { id: 'all', label: 'All Items', icon: Heart },
    { id: 'property', label: 'Stays', icon: Home },
    { id: 'stay-request', label: 'Stay Requests', icon: FileText },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag },
    { id: 'trip', label: 'Travel Plans', icon: Plane },
    { id: 'expert', label: 'People', icon: Users },
  ];

  const allWishlist = Array.isArray(data?.wishlist) ? data.wishlist : [];

  // Compute live count per tab
  const tabCounts = React.useMemo(() => {
    const counts = { all: allWishlist.length };
    for (const item of allWishlist) {
      const norm = normalizeItemType(item.type);
      counts[norm] = (counts[norm] || 0) + 1;
    }
    return counts;
  }, [allWishlist]);

  // Filter items matching active tab
  const displayedItems = React.useMemo(() => {
    if (activeTab === 'all') return allWishlist;
    const targetNorm = normalizeItemType(activeTab);
    return allWishlist.filter((item) => normalizeItemType(item.type) === targetNorm);
  }, [allWishlist, activeTab]);

  const renderContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[350px] py-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-xs text-gray-500 font-medium animate-pulse">Loading saved favourites...</p>
        </div>
      );
    }

    if (displayedItems.length === 0) {
      return (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-9 h-9 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No Saved Items Here</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Explore stays, stay requests, marketplace products, events, travel routes, and mentors to add them to your wishlists.
            </p>
          </div>
          <Link to="/" className="inline-block">
            <button className="bg-[#0A1A2F] hover:bg-blue-600 text-white rounded-xl px-6 h-11 font-semibold transition-all shadow-sm">
              Start Exploring
            </button>
          </Link>
        </div>
      );
    }

    return (
      <div className={`grid gap-6 ${activeTab === 'trip' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} animate-in fade-in duration-300`}>
        {displayedItems.map((item) => {
          const details = item.details;
          if (!details) return null;

          const itemType = normalizeItemType(item.type || activeTab);

          // Wrap individual cards in a custom container
          return (
            <div key={item.id || item._id} className="relative group">
              {(() => {
                switch (itemType) {
                  case 'stay-request':
                    return <StayRequestCard request={details} />;

                  case 'property':
                    const normalizedProperty = {
                      ...details,
                      id: details.id || details._id,
                      host_id: details.host_id || details.hostId || details.user_id || details.host?.user_id || details.host?.id || details.Host?.user_id || details.Host?.id,
                      photos: details.photos || details.images || [],
                      status: (details.isVerified || details.verified || details.status === 'approved') ? 'approved' : 'pending',
                      price_per_month: details.price_per_month || details.price || 0,
                      bedrooms: details.bedrooms || details.stats?.bedrooms || 0,
                      bathrooms: details.bathrooms || details.stats?.bathrooms || 0,
                      guests: details.guests || details.stats?.guests || 0,
                      area: details.area || details.stats?.area || "",
                      city: details.city || details.location?.city || details.location,
                      host: {
                        ...(details.host || details.Host || details.creator || {}),
                        user_id: details.host_id || details.hostId || details.user_id || details.host?.user_id || details.Host?.user_id,
                        full_name: details.host_name || details.hostName || details.user_name || details.host?.full_name || details.Host?.full_name,
                        whatsapp: details.whatsapp || details.phone || details.contact || details.host?.whatsapp || details.Host?.whatsapp,
                        phone: details.phone || details.contact || details.host?.phone || details.Host?.phone
                      }
                    };
                    return <PropertyCard property={normalizedProperty} />;

                  case 'event':
                    const normalizedEvent = {
                      ...details,
                      id: details.id || details._id || item.id,
                      title: details.title || details.event_name || "Event",
                      image: details.image || details.banner_image || (details.gallery_images?.[0]) || "",
                      banner_image: details.banner_image || details.image || (details.gallery_images?.[0]) || "",
                      date: details.date || details.start_date,
                      host: {
                        ...(details.host || details.Host || details.creator || {}),
                        full_name: details.hostName || details.host?.full_name || details.creator?.full_name || "Organizer",
                        profile_photo: details.host?.profile_photo || details.Host?.profile_photo || details.creator?.profile_photo || details.host?.profile_image,
                        avatar: details.host?.avatar || details.Host?.avatar || details.host?.avatar_url,
                        image: details.host?.image || details.Host?.image || details.host?.profile_image
                      },
                      organizer: details.organizer || details.hostName || details.host?.full_name || "Organizer",
                      city: details.city || details.location?.city || "TBA",
                      country: details.country || details.location?.country || ""
                    };
                    return (
                      <EventCard
                        event={normalizedEvent}
                        onViewDetails={(id) => window.location.href = `/events/${id}`}
                      />
                    );

                  case 'buy-sell':
                    return <ProductCard product={details} />;

                  case 'trip':
                    const normalizeCountry = (c) => {
                      if (!c) return "";
                      const lower = c.toLowerCase().trim();
                      if (lower === "united states" || lower === "usa" || lower === "us" || lower === "united states of america") {
                        return "United States of America";
                      }
                      return c;
                    };

                    const getVal = (val) => {
                      if (val === undefined || val === null) return "";
                      return String(val).trim();
                    };

                    const socials = {
                      whatsapp: getVal(
                        details.host?.whatsapp ||
                        details.host?.phone ||
                        details.host?.User?.phone ||
                        details.user?.whatsapp ||
                        details.user?.phone ||
                        details.user?.User?.phone ||
                        details.whatsapp ||
                        details.phone ||
                        ""
                      ),
                      email: getVal(
                        details.host?.email ||
                        details.host?.User?.email ||
                        details.user?.email ||
                        details.user?.User?.email ||
                        details.email ||
                        ""
                      ),
                      instagram: getVal(
                        details.host?.instagram ||
                        details.host?.User?.instagram ||
                        details.user?.instagram ||
                        details.user?.User?.instagram ||
                        details.instagram ||
                        ""
                      ),
                      facebook: getVal(
                        details.host?.facebook ||
                        details.host?.User?.facebook ||
                        details.user?.facebook ||
                        details.user?.User?.facebook ||
                        details.facebook ||
                        ""
                      ),
                      twitter: getVal(
                        details.host?.twitter ||
                        details.host?.x ||
                        details.host?.User?.twitter ||
                        details.user?.twitter ||
                        details.user?.x ||
                        details.user?.User?.twitter ||
                        details.twitter ||
                        ""
                      )
                    };

                    let fullName = "Traveler";
                    if (details.host?.full_name) {
                      fullName = details.host.full_name;
                    } else if (details.user?.full_name) {
                      fullName = details.user.full_name;
                    } else if (details.user?.fullName) {
                      fullName = details.user.fullName;
                    } else if (details.host?.user?.full_name) {
                      fullName = details.host.user.full_name;
                    }

                    const normalizedTrip = {
                      ...details,
                      id: details.id || details._id,
                      matches: details.matches || [],
                      date: details.travel_date || details.date,
                      destination: details.destination || (details.to_city ? `${details.to_city}${details.to_country ? `, ${normalizeCountry(details.to_country)}` : ''}` : ""),
                      flight: details.flight ? {
                        ...details.flight,
                        from_country: normalizeCountry(details.flight.from_country || details.from_country || details.host?.country || details.user?.country)
                      } : {
                        airline: details.airline || "",
                        flightNumber: details.flight_number || "",
                        from: details.from_city || "",
                        to: details.to_city || "",
                        from_country: normalizeCountry(details.from_country || details.user?.country || details.host?.country),
                        departureDate: details.travel_date || details.date,
                        departureTime: details.departure_time || details.departureTime,
                        arrivalDate: details.arrival_date || details.arrivalDate,
                        arrivalTime: details.arrival_time || details.arrivalTime
                      },
                      user: details.user ? {
                        fullName: details.user.fullName || details.user.full_name || fullName,
                        age: details.user.age || details.age || "",
                        gender: details.user.gender || details.gender || "",
                        country: normalizeCountry(details.user.country || details.country),
                        state: details.user.state || details.state || "",
                        city: details.user.city || details.city || "",
                        languages: Array.isArray(details.user.languages) ? details.user.languages : (details.user.languages ? details.user.languages.split(',').map(l => l.trim()) : []),
                        image: resolveImageUrl(details.user.image || details.user.profile_image || details.user.User?.profile_image || details.user.user?.profile_image || null),
                        verified: details.user.verified || false
                      } : {
                        fullName: fullName,
                        age: details.age || details.host?.age || details.trip_meta?.age || "",
                        gender: details.gender || details.host?.gender || "",
                        country: normalizeCountry(details.host?.country || details.from_country),
                        state: details.host?.city || "",
                        city: details.host?.city || "",
                        languages: details.trip_meta?.languages || details.host?.languages || [],
                        image: resolveImageUrl(details.host?.image || details.host?.profile_image || details.host?.User?.profile_image || details.host?.user?.profile_image || null),
                        verified: details.host?.user?.verified || details.host?.verified || false
                      },
                      socials: socials
                    };
                    return <TripCard plan={normalizedTrip} isSelected={false} />;

                  case 'expert':
                    return <PeopleCard person={{ ...details, id: details.id || details._id }} />;

                  default:
                    return null;
                }
              })()}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-rose-600 tracking-wider uppercase block">Your Collection ❤️</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Wishlists</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your saved properties, community boards, marketplace products, events, and travel routes.
          </p>
        </div>
      </div>

      {/* Tabs list row */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1.5 border-b border-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={cn(
                  "flex items-center gap-2 px-4.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-[#0A1A2F] text-white border-transparent shadow-md"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={14} className={isActive ? 'text-rose-400' : 'text-gray-400'} />
                <span>{tab.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5",
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Saved Items grid panel */}
        {renderContent()}
      </div>

    </div>
  );
}

