'use client';

import React, { useState } from 'react';
import { useGetWishlistQuery } from '@/store/api/hostApi';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { EventCard } from '@/app/events/components/EventCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import TripCard from '@/components/travel/TripCard';
import { Loader2, Heart, ShoppingBag, Calendar, Home, Plane, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CommunityGroupCard } from '@/components/home/featured/CommunityGroupCard';
import { Footer } from '@/components/layout/Footer';

export default function WishlistPage() {
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
        { id: 'buysell', label: 'Marketplace', icon: ShoppingBag },
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
                    <Link to="/" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
                        Start Exploring
                    </Link>
                </div>
            );
        }

        return (
            <div className={`grid gap-6 ${activeTab === 'trip' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {data.wishlist.map((item) => {
                    const details = item.details;
                    if (!details) return null; // Skip if details missing (deleted item)

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
                            return <EventCard key={item.id} event={details} />; // Default viewMode

                        case 'buysell':
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
        <div className="min-h-screen bg-gray-50/30">
            <Navbar />
            <main className="container mx-auto px-4 py-8 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            Your Wishlist <Heart className="text-red-500 fill-red-500" />
                        </h1>
                        <p className="text-gray-500">Manage and view all your saved items in one place</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 pb-2 mask-gradient-right">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border ${isActive
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

                {/* Pagination (Simple) */}
                {data?.pagination?.totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-6 py-2 border rounded-xl font-bold disabled:opacity-50 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center font-bold text-gray-500">
                            Page {page} of {data.pagination.totalPages}
                        </span>
                        <button
                            disabled={page === data.pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 border rounded-xl font-bold disabled:opacity-50 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
