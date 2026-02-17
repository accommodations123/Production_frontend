'use client';

import React, { useState } from 'react';
import { useGetWishlistQuery } from '@/store/api/hostApi';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { EventCard } from '@/app/events/components/EventCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import TripCard from '@/components/travel/TripCard';
import { Loader2, Heart, ShoppingBag, Calendar, Home, Plane, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommunityGroupCard } from '@/components/home/featured/CommunityGroupCard';

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
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-gray-500 mt-4 animate-pulse">Loading your favourites...</p>
                </div>
            );
        }

        if (!data?.wishlist || data.wishlist.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No favourites yet</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                        Start exploring and save items you love to create your personal collection.
                    </p>
                    <Link to="/search" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
                        Start Exploring
                    </Link>
                </div>
            );
        }

        return (
            <div className={`grid gap-6 ${activeTab === 'trip' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {data.wishlist.map((item) => {
                    const details = item.details;
                    if (!details) return null;

                    switch (activeTab) {
                        case 'property':
                            // Normalize data for PropertyCard
                            const normalizedProperty = {
                                ...details,
                                id: details.id || details._id,
                                photos: details.photos || details.images || [],
                                // Robust check for verification
                                status: (details.isVerified || details.verified || details.status === 'approved' || details.verificationStatus === 'approved') ? 'approved' : 'pending',
                                price_per_month: details.price_per_month || details.price || 0,
                                bedrooms: details.bedrooms || details.stats?.bedrooms || 0,
                                bathrooms: details.bathrooms || details.stats?.bathrooms || 0,
                                guests: details.guests || details.stats?.guests || 0,
                                area: details.area || details.stats?.area || "",
                                city: details.city || details.location?.city || details.location,
                                // Ensure host object has necessary social fields
                                host: {
                                    ...(details.host || details.Host || details.creator || {}),
                                    whatsapp: details.whatsapp || details.phone || details.contact || details.mobile || details.host?.whatsapp || details.Host?.whatsapp,
                                    phone: details.phone || details.contact || details.mobile || details.host?.phone
                                },
                                // Top level fallbacks
                                phone: details.phone || details.contact || details.mobile,
                                whatsapp: details.whatsapp || details.phone || details.contact
                            };
                            return <PropertyCard key={item.id} property={normalizedProperty} />;

                        case 'event':

                            // Normalize data for EventCard
                            const normalizedEvent = {
                                ...details,
                                id: details.id || details._id,
                                title: details.title || details.event_name,
                                image: details.image || details.banner_image || (details.gallery_images?.[0]) || "",
                                date: details.date || details.start_date,
                                // Ensure detailed host object for "Organized by" and HostPhoto
                                host: {
                                    ...(details.host || details.Host || details.creator || {}),
                                    full_name: details.hostName || details.host?.full_name || details.Host?.full_name || details.creator?.full_name || details.organizer || "Unknown Organizer",
                                    // Map all possible image fields HostPhoto checks for
                                    profile_photo: details.host?.profile_photo || details.Host?.profile_photo || details.creator?.profile_photo || details.host?.User?.profile_photo || details.organizer_image,
                                    avatar: details.host?.avatar || details.Host?.avatar || details.creator?.avatar,
                                    image: details.host?.image || details.Host?.image || details.organizer_image
                                },
                                organizer: details.organizer || details.hostName || details.host?.full_name || details.creator?.full_name || "Organizer",
                                city: details.city || details.location?.city || "Location TBA",
                                country: details.country || details.location?.country || ""
                            };
                            return (
                                <EventCard
                                    key={item.id}
                                    event={normalizedEvent}
                                    onViewDetails={(id) => window.location.href = `/events/${id}`}
                                />
                            );

                        case 'buy-sell':
                            return <ProductCard key={item.id} product={details} />;

                        case 'trip':
                            return <TripCard key={item.id} plan={{ ...details, id: details.id || details._id }} isSelected={false} />;

                        case 'community':
                            return <CommunityGroupCard key={item.id} group={{ ...details, id: details.id || details._id }} />;

                        default:
                            return null;
                    }
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                        My Wishlist <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                    </h2>
                    <p className="text-gray-500 text-sm">Manage your saved items</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mask-gradient-right">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 border ${isActive
                                ? 'bg-black text-white border-black shadow-lg transform scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <Icon size={16} className={isActive ? 'text-red-400' : 'text-gray-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {renderContent()}

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center font-bold text-gray-500 text-sm">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    <button
                        disabled={page === data.pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
