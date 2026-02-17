import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, MapPin, Globe, AlignLeft, Filter, X } from 'lucide-react';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { useCountry } from "@/context/CountryContext";
import { COUNTRIES } from "@/lib/mock-data";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useGetApprovedHostDetailsQuery, useGetAllPropertiesQuery } from '@/store/api/hostApi';
import { UserCheck, User } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/Pagination';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Mobile State
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCountryOpen, setCountryOpen] = useState(false);
    const { activeCountry, setCountry } = useCountry();

    // Use getAllProperties to show pending/unverified listings too
    const { data: allProperties } = useGetAllPropertiesQuery({ country: activeCountry?.name });



    // Extract filters from URL
    const filters = {
        location: searchParams.get('location') || '',
        category: searchParams.getAll('category'),
        accommodationType: searchParams.getAll('accommodationType'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        stayType: searchParams.get('stayType'),
        furnishing: searchParams.get('furnishing'),
    };

    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        // Clear existing keys handled by filters to avoid duplicates/mess
        ['location', 'category', 'accommodationType', 'minPrice', 'maxPrice', 'stayType', 'furnishing'].forEach(k => params.delete(k));

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.append(key, value);
                }
            }
        });
        navigate(`/search?${params.toString()}`);
    };

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                if (allProperties) {
                    let mapped = allProperties.map((property) => {
                        // Resolve Host object (check Host, host, and property root for fallback socials)
                        const rawHost = property.Host || property.host || {};
                        const mergedHost = {
                            ...rawHost,
                            // Aggressively find available socials
                            instagram: rawHost.instagram || property.instagram || "",
                            facebook: rawHost.facebook || property.facebook || "",
                            whatsapp: rawHost.whatsapp || property.whatsapp || rawHost.phone || property.phone || "",
                            twitter: rawHost.twitter || rawHost.x || property.twitter || property.x || ""
                        };

                        return {
                            ...property, // Preserve original fields for PropertyCard
                            _id: property.id || property._id, // Prefer SQL ID for wishlist, fallback to Mongo
                            id: property.id || property._id,
                            title: property.title || "Untitled Property",
                            location: property.city || "Unknown Location",
                            fullAddress: property.address || "", // For location filtering
                            price: property.price_per_month || property.price_per_night || 0,
                            currency: property.currency || 'INR',
                            image: (property.photos && property.photos.length > 0)
                                ? property.photos[0]
                                : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
                            type: property.property_type || "Stays", // Matches 'House', 'Apartment', etc.
                            category: property.category_id || "Apartment", // Should probably match type
                            rating: 4.8, // Mock
                            reviews: 12, // Mock
                            isVerified: property.status === 'approved',
                            status: property.status, // Pass status for UI badge
                            furnishing: property.furnishing || "Unfurnished", // Backend field
                            stayType: property.stay_type || "Flexible", // Backend field
                            tags: property.amenities || [],
                            Host: mergedHost, // Explicitly pass merged host
                            host: mergedHost // Pass as lowercase too for compatibility
                        };
                    }).filter(item => {                            // Filter out expired properties, but allow Pending + Approved
                        const isVisible = item.status === 'approved' || item.status === 'pending';
                        const isActive = !item.is_expired;
                        const notExpired = !item.listing_expires_at || new Date(item.listing_expires_at) > new Date();
                        return isVisible && isActive && notExpired;
                    });

                    // Apply Filters
                    const { location, category, minPrice, maxPrice, stayType, furnishing } = filters;

                    if (location) {
                        const locLower = location.toLowerCase();
                        mapped = mapped.filter(item =>
                            item.location.toLowerCase().includes(locLower) ||
                            item.fullAddress.toLowerCase().includes(locLower) ||
                            item.title.toLowerCase().includes(locLower)
                        );
                    }

                    if (category && category.length > 0) {
                        // category in Sidebar comes as ['Apartment', 'House'] etc.
                        // property.category_id or type should match. 
                        // Backend might retain lowercase or IDs. We'll try flexible matching.
                        mapped = mapped.filter(item =>
                            category.some(cat =>
                                cat.toLowerCase() === (item.category || "").toLowerCase() ||
                                cat.toLowerCase() === (item.type || "").toLowerCase()
                            )
                        );
                    }

                    if (minPrice) {
                        mapped = mapped.filter(item => item.price >= Number(minPrice));
                    }

                    if (maxPrice) {
                        mapped = mapped.filter(item => item.price <= Number(maxPrice));
                    }

                    if (furnishing) {
                        mapped = mapped.filter(item => (item.furnishing || "").toLowerCase() === furnishing.toLowerCase());
                    }

                    if (stayType) {
                        // Sidebar uses 'ShortTerm', 'LongTerm'. Backend might use different.
                        mapped = mapped.filter(item => (item.stayType || "").toLowerCase() === stayType.toLowerCase());
                    }

                    setListings(mapped);
                    setTotal(mapped.length);
                }
            } catch (err) {
                console.error("Error filtering listings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
        // Scroll only on initial load or severe changes, not every filter tweak to keep context? 
        // User likely wants to see results at top if list refreshes.
        window.scrollTo(0, 0);
    }, [searchParams, allProperties]); // Dependencies correct as searchParams change on filter change

    // ✅ Pagination Logic
    const {
        currentItems: paginatedListings,
        currentPage,
        totalPages,
        goToPage
    } = usePagination(listings, 12); // 12 items per page

    return (
        <div className="min-h-screen bg-transparent pb-20 md:pb-0">
            {/* Desktop Navbar - Removed double navbar, assuming layout handles it or we need it transparent */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* Mobile Header (Sticky) - Removed as it's now global in RootLayout */}
            {/* <div className="md:hidden sticky top-0 z-40 bg-white shadow-sm">
                ... contents removed ...
            </div> */}

            <div className="container mx-auto pt-4 md:pt-24 px-4 md:px-4">
                {/* Mobile Header & Filter Toggle */}
                <div className="md:hidden flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        {total > 0 ? `${total} Stays` : 'Access Stays'}
                    </h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="gap-2 border-gray-300"
                    >
                        <Filter size={16} /> Filters
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="w-full md:w-80 hidden md:block shrink-0">
                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Listings Grid */}
                    <main className="flex-1">

                        <div className="flex items-center justify-between mb-6 hidden md:flex">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {total > 0 ? `${total} Stays found` : 'Find your requested stay'}
                                {filters.location && <span className="text-gray-500 font-normal ml-2">in {filters.location}</span>}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer">
                                    <option>Recommended</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl h-[380px] animate-pulse" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                    {paginatedListings.map(item => (
                                        <PropertyCard key={item._id} property={item} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                />
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search for a different location.</p>
                                <Button
                                    variant="link"
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-primary font-bold"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Sheet */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b flex items-center justify-between bg-white shrink-0">
                                <h2 className="font-bold text-lg">Filters</h2>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <FilterSidebar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    className="block w-full h-auto static border-none p-4 shadow-none"
                                />
                            </div>
                            <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
                                <Button variant="outline" className="flex-1" onClick={() => handleFilterChange({})}>
                                    Clear
                                </Button>
                                <Button className="flex-1 bg-[#C93A30] hover:bg-[#b02e25]" onClick={() => setSidebarOpen(false)}>
                                    Show {total} Results
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
