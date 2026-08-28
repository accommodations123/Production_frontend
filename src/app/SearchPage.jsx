import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/home/featured/PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, MapPin, Globe, AlignLeft, Filter, X, Plus } from 'lucide-react';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { useCountry } from "@/context/CountryContext";
import { COUNTRIES } from "@/lib/mock-data";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { getHostPath } from '@/lib/navigationUtils';

import { useGetApprovedHostDetailsQuery, useGetAllPropertiesQuery } from '@/store/api/hostApi';
import { useGetPublicStayRequestsQuery } from '@/store/api/stayRequestApi';
import { UserCheck, User } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/Pagination';
import { StayRequestCard } from '@/components/search/StayRequestCard';
import PostStayRequestModal from '@/components/search/PostStayRequestModal';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("recommended")

    // Seekers / Offered listing selection tab
    const [listingTab, setListingTab] = useState(() => searchParams.get("tab") === "seekers" ? "seeker" : "offered");

    // Modal state for posting stay requests
    const [isPostRequestModalOpen, setIsPostRequestModalOpen] = useState(false);

    // Mobile State
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCountryOpen, setCountryOpen] = useState(false);
    const { activeCountry, setCountry } = useCountry();

    // Queries
    const { data: allProperties } = useGetAllPropertiesQuery({ country: activeCountry?.name });
    const { data: stayRequestsData } = useGetPublicStayRequestsQuery({ country: activeCountry?.name });

    // Auto-prompt post stay request modal if URL query param action=request is active
    useEffect(() => {
        if (searchParams.get('action') === 'request') {
            setIsPostRequestModalOpen(true);
            setListingTab('seeker');
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('action');
            setSearchParams(nextParams, { replace: true });
        } else if (searchParams.get('tab') === 'seekers') {
            setListingTab('seeker');
        }
    }, [searchParams, setSearchParams]);



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
        const params = new URLSearchParams();

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            }
        });
        setSearchParams(params, { replace: true });
    };

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                let baseItems = [];

                if (listingTab === 'seeker') {
                    const rawRequests = Array.isArray(stayRequestsData)
                        ? stayRequestsData
                        : (stayRequestsData?.items || []);

                    baseItems = rawRequests.map((req) => {
                        const mergedHost = {
                            full_name: req.seekerName || "Stay Seeker",
                            email: req.email || "",
                            phone: req.phone || "",
                            whatsapp: req.whatsappNumber || req.phone || "",
                            linkedin: req.linkedin || "",
                            instagram: req.instagram || "",
                            User: {
                                profile_image: req.profile_image || ""
                            }
                        };

                        return {
                            ...req,
                            _id: req.id,
                            id: req.id,
                            title: req.title || "Stay Request",
                            location: req.city ? `${req.city}, ${req.country || ''}` : req.country || "Location Info",
                            fullAddress: `${req.city || ''} ${req.state || ''} ${req.country || ''}`,
                            price: req.budget || req.price_per_month || 0,
                            currency: req.currency || 'EUR',
                            type: req.stayType || "Seeker Request",
                            category: "seeker_request",
                            property_type: "seeker_request",
                            isVerified: req.status === 'approved' || req.is_approved !== false,
                            status: req.status || 'approved',
                            furnishing: req.furnishing || "Furnished",
                            stayType: req.stayType || req.stay_type || "Long Term",
                            description: req.description || "",
                            Host: mergedHost,
                            host: mergedHost
                        };
                    });
                } else {
                    if (allProperties) {
                        baseItems = allProperties.map((property) => {
                            const rawHost = property.Host || property.host || {};
                            const mergedHost = {
                                ...rawHost,
                                instagram: rawHost.instagram || property.instagram || "",
                                facebook: rawHost.facebook || property.facebook || "",
                                whatsapp: rawHost.whatsapp || property.whatsapp || rawHost.phone || property.phone || "",
                                twitter: rawHost.twitter || rawHost.x || property.twitter || property.x || "",
                                email: rawHost.email || rawHost.User?.email || property.email || ""
                            };

                            return {
                                ...property,
                                _id: property.id || property._id,
                                id: property.id || property._id,
                                title: property.title || "Untitled Property",
                                location: property.city || "Unknown Location",
                                fullAddress: property.address || "",
                                price: property.price_per_month || property.price_per_night || 0,
                                currency: property.currency || 'INR',
                                image: (property.photos && property.photos.length > 0)
                                    ? property.photos[0]
                                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
                                type: property.property_type || "Apartment",
                                category: property.category || property.property_type || "Apartment",
                                rating: 4.8,
                                reviews: 12,
                                isVerified: property.status === 'approved',
                                status: property.status,
                                furnishing: property.furnishing || "Unfurnished",
                                stayType: property.stay_type || "Flexible",
                                tags: property.amenities || [],
                                Host: mergedHost,
                                host: mergedHost
                            };
                        }).filter(item => {
                            const isVisible = item.status === 'approved' || item.status === 'pending';
                            const isActive = !item.is_expired;
                            const notExpired = !item.listing_expires_at || new Date(item.listing_expires_at) > new Date();
                            return isVisible && isActive && notExpired && item.property_type !== 'seeker_request';
                        });
                    }
                }

                let mapped = baseItems;

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

                if (category?.length > 0 && listingTab !== 'seeker') {
                    mapped = mapped.filter(item =>
                        category.some(cat => {
                            const targetCategory = cat.toLowerCase().trim();
                            const itemType = (item.type || "").toLowerCase().trim();
                            const itemCategory = (item.category || "").toLowerCase().trim();
                            return targetCategory === itemType || targetCategory === itemCategory;
                        })
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
                    mapped = mapped.filter(item => (item.stayType || "").toLowerCase() === stayType.toLowerCase());
                }

                // Apply Sorting
                if (sortBy === "low-to-high") {
                    mapped = [...mapped].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
                } else if (sortBy === "high-to-low") {
                    mapped = [...mapped].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
                }

                setListings(mapped);
                setTotal(mapped.length);
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
    }, [searchParams, allProperties, stayRequestsData, sortBy, listingTab]);

    // ✅ Pagination Logic
    const {
        currentItems: paginatedListings,
        currentPage,
        totalPages,
        goToPage
    } = usePagination(listings, 12); // 12 items per page

    return (
        <div className="min-h-screen bg-transparent pb-20 lg:pb-0">
            {/* Desktop Navbar - Removed double navbar, assuming layout handles it or we need it transparent */}
            <div>
                <Navbar />
            </div>

            {/* Mobile Header (Sticky) - Removed as it's now global in RootLayout */}
            {/* <div className="md:hidden sticky top-0 z-40 bg-white shadow-sm">
                ... contents removed ...
            </div> */}

            <div className="max-w-[1600px] mx-auto pt-4 lg:pt-24 px-4 sm:px-5 lg:px-6">
                {/* Mobile Header & Filter Toggle */}
                <div className="lg:hidden space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">
                            {total > 0 ? `${total} Stays` : 'Access Stays'}
                        </h1>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSidebarOpen(true)}
                            className="gap-2 border-gray-300 h-9"
                        >
                            <Filter size={16} /> Filters
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => navigate(getHostPath('property', !!localStorage.getItem("user")))}
                            className="flex-1 gap-1.5 bg-[#C93A30] hover:bg-[#C93A30]/90 text-white rounded-xl font-bold h-9 px-3 text-xs cursor-pointer justify-center"
                        >
                            <Plus size={14} /> List Stay
                        </Button>
                        <Button
                            onClick={() => navigate("/accommodations/post-request")}
                            className="flex-1 gap-1.5 bg-[#00162D] hover:bg-[#00162D]/90 text-white rounded-xl font-bold h-9 px-3 text-xs cursor-pointer justify-center border border-slate-700"
                        >
                            <Plus size={14} /> Post Stay Request
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="w-full lg:w-80 hidden lg:block shrink-0">
                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Listings Grid */}
                    <main className="flex-1">

                        <div className="flex items-center justify-between mb-6 hidden lg:flex">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {total > 0 ? `${total} Stays found` : 'Find your requested stay'}
                                {filters.location && <span className="text-gray-500 font-normal ml-2">in {filters.location}</span>}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => navigate(getHostPath('property', !!localStorage.getItem("user")))}
                                    className="gap-2 bg-[#C93A30] hover:bg-[#C93A30]/90 text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg h-10 px-5 text-sm cursor-pointer"
                                >
                                    <Plus size={16} /> List Stay
                                </Button>
                                <Button
                                    onClick={() => navigate("/accommodations/post-request")}
                                    className="gap-2 bg-[#00162D] hover:bg-[#00162D]/90 text-white border border-slate-700 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg h-10 px-5 text-sm cursor-pointer"
                                >
                                    <Plus size={16} /> Post Stay Request
                                </Button>
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer"
                                    >
                                        <option value="recommended">
                                            Recommended
                                        </option>
                                        <option value="low-to-high">
                                            Price: Low to High
                                        </option>
                                        <option value="high-to-low">
                                            Price: High to Low
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Segment Tab Toggle */}
                        <div className="flex border-b border-slate-200 mb-6">
                            <button
                                onClick={() => setListingTab('offered')}
                                className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                                    listingTab === 'offered'
                                        ? 'border-[#CB2A26] text-[#00162D]'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Offered Stays
                            </button>
                            <button
                                onClick={() => setListingTab('seeker')}
                                className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                                    listingTab === 'seeker'
                                        ? 'border-[#CB2A26] text-[#00162D]'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Stay Requests (Looking for Stay)
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl h-[380px] animate-pulse" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                    {listingTab === 'seeker' ? (
                                        paginatedListings.map(item => (
                                            <StayRequestCard key={item._id} request={item} />
                                        ))
                                    ) : (
                                        paginatedListings.map(item => (
                                            <PropertyCard key={item._id} property={item} />
                                        ))
                                    )}
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
                                    onClick={() => setSearchParams({})}
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
                            className="fixed inset-y-0 right-0 w-[85vw] sm:w-[65vw] md:w-[50vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col"
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
            {/* Post Stay Request Modal */}
            {isPostRequestModalOpen && (
                <PostStayRequestModal
                    onClose={() => setIsPostRequestModalOpen(false)}
                    onAdd={() => {
                        setIsPostRequestModalOpen(false);
                        setListingTab("seeker");
                    }}
                />
            )}

            {/* Footer at bottom of Accommodations page */}
            <div className="mt-16">
                <Footer />
            </div>
        </div>
    );
}
