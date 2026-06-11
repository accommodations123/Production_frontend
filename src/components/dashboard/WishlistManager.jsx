'use client';

import React, { useState } from 'react';
import { useGetWishlistQuery } from '@/store/api/hostApi';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { EventCard } from '@/app/events/components/EventCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import TripCard from '@/components/travel/TripCard';
import { Loader2, Heart, ShoppingBag, Calendar, Home, Plane, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommunityGroupCard } from '@/components/home/featured/CommunityGroupCard';
import { cn } from "@/lib/utils";

export function WishlistManager() {
  const [activeTab, setActiveTab] = useState('property');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetWishlistQuery({
    type: activeTab,
    page,
    limit: 20
  });

  const tabs = [
    { id: 'property', label: 'Stays', icon: Home },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag },
    { id: 'trip', label: 'Travel Plans', icon: Plane },
    { id: 'community', label: 'Communities', icon: Users },
  ];

  const renderContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[350px] py-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-xs text-gray-500 font-medium animate-pulse">Loading saved favourites...</p>
        </div>
      );
    }

    if (!data?.wishlist || data.wishlist.length === 0) {
      return (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-9 h-9 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No Saved Items Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Explore stays, marketplace products, travel match itineraries, and communities to save them to your custom collections.
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
        {data.wishlist.map((item) => {
          const details = item.details;
          if (!details) return null;

          // Wrap individual cards in a custom container to overlay a red heart icon
          return (
            <div key={item.id || item._id} className="relative group">
              {/* Floating Heart Overlay indicator */}
              <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
                <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
              </div>

              {(() => {
                switch (activeTab) {
                  case 'property':
                    const normalizedProperty = {
                      ...details,
                      id: details.id || details._id,
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
                        whatsapp: details.whatsapp || details.phone || details.contact || details.host?.whatsapp,
                        phone: details.phone || details.contact || details.host?.phone
                      }
                    };
                    return <PropertyCard property={normalizedProperty} />;

                  case 'event':
                    const normalizedEvent = {
                      ...details,
                      id: details.id || details._id,
                      title: details.title || details.event_name,
                      image: details.image || details.banner_image || (details.gallery_images?.[0]) || "",
                      date: details.date || details.start_date,
                      host: {
                        ...(details.host || details.Host || details.creator || {}),
                        full_name: details.hostName || details.host?.full_name || details.creator?.full_name || "Organizer",
                        profile_photo: details.host?.profile_photo || details.Host?.profile_photo || details.creator?.profile_photo,
                        avatar: details.host?.avatar || details.Host?.avatar,
                        image: details.host?.image || details.Host?.image
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
                    return <TripCard plan={{ ...details, id: details.id || details._id }} isSelected={false} />;

                  case 'community':
                    return <CommunityGroupCard group={{ ...details, id: details.id || details._id }} />;

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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Saved Items grid panel */}
        {renderContent()}

        {/* Tab Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4 border-t border-gray-50 pt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-gray-50 transition-all text-gray-600"
            >
              Previous
            </button>
            <span className="font-extrabold text-gray-400 text-xs uppercase tracking-wider">
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-gray-50 transition-all text-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
