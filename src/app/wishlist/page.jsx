'use client';

import React, { useState } from 'react';
import { useGetWishlistQuery } from '@/store/api/hostApi';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { EventCard } from '@/app/events/components/EventCard';
import { ProductCard } from '@/components/marketplace/ProductCard';
import TripCard from '@/components/travel/TripCard';
import PeopleCard from '@/features/people/components/PeopleCard';
import { Loader2, Heart, ShoppingBag, Calendar, Home, Plane, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CommunityGroupCard } from '@/components/home/featured/CommunityGroupCard';
import { Footer } from '@/components/layout/Footer';
import { resolveImageUrl } from '@/lib/imageUtils';

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
        { id: 'expert', label: 'People', icon: Users },
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
            <div className={`grid gap-4 sm:gap-5 md:gap-6 ${activeTab === 'trip' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
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
                            return <TripCard key={item.id} plan={normalizedTrip} isSelected={false} />;

                        case 'expert':
                        case 'people':
                            return <PeopleCard key={item.id} person={details} />;

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
            <main className="container mx-auto px-4 sm:px-5 md:px-6 py-6 sm:py-8 mt-16 sm:mt-18 md:mt-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                            Your Wishlist <Heart className="text-red-500 fill-red-500" />
                        </h1>
                        <p className="text-gray-500">Manage and view all your saved items in one place</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 mb-6 sm:mb-8 pb-2 mask-gradient-right">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 border ${isActive
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
