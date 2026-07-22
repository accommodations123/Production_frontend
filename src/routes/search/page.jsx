import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FilterSidebar } from '@/features/search/components/FilterSidebar';
import PostStayRequestModal from '@/features/search/components/PostStayRequestModal';

import { PropertyCard } from '@/features/home/components/featured/PropertyCard';
import { Button } from '@/shared/ui/button';
import { Filter, X, Plus } from 'lucide-react';
import { useCountry } from "@/context/CountryContext";
import { AnimatePresence, motion } from 'framer-motion';
import { getHostPath } from '@/shared/utils/navigationUtils';
import { COUNTRIES } from "@/shared/utils/mock-data";

import { useGetAllPropertiesQuery } from '@/store/api/hostApi';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/ui/Pagination';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("recommended");

    // Seekers / Offered listing selection tab
    const [listingTab, setListingTab] = useState("offered");

    // Modal state for posting stay requests
    const [isPostRequestModalOpen, setIsPostRequestModalOpen] = useState(false);

    // Mobile Sidebar filter State
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { activeCountry, setCountry } = useCountry();

    // Use getAllProperties to show pending/unverified listings too
    const { data: allProperties } = useGetAllPropertiesQuery({ country: activeCountry?.name });

    // Synchronize activeCountry context with URL location search parameters
    useEffect(() => {
        const urlLocation = searchParams.get('location');
        if (urlLocation) {
            const matched = COUNTRIES.find(c =>
                c.name.toLowerCase() === urlLocation.toLowerCase() ||
                c.code.toLowerCase() === urlLocation.toLowerCase()
            );
            if (matched && matched.name !== activeCountry?.name) {
                const t = setTimeout(() => {
                    setCountry(matched);
                }, 0);
                return () => clearTimeout(t);
            }
        }
    }, [searchParams, activeCountry, setCountry]);

    // Auto-prompt post stay request modal if URL query param action=request is active
    useEffect(() => {
        if (searchParams.get('action') === 'request') {
            const t = setTimeout(() => {
                setIsPostRequestModalOpen(true);
                setListingTab('seeker');
            }, 0);
            // Remove the parameter so it doesn't reopen on subsequent filter adjustments
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('action');
            setSearchParams(nextParams, { replace: true });
            return () => clearTimeout(t);
        }
    }, [searchParams, setSearchParams]);

    // Extract filters from URL
    const filters = useMemo(() => ({
        location: searchParams.get('location') || '',
        category: searchParams.getAll('category'),
        accommodationType: searchParams.getAll('accommodationType'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        stayType: searchParams.get('stayType'),
        furnishing: searchParams.get('furnishing'),
    }), [searchParams]);

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
                if (allProperties) {
                    let mapped = allProperties.map((property) => {
                        // Resolve Host object (check Host, host, and property root for fallback socials)
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
                            type: property.property_type || "Apartment",
                            category:
                                property.category ||
                                property.property_type ||
                                "Apartment",
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

                    // Filter based on tab: offered vs seeker
                    if (listingTab === 'seeker') {
                        mapped = mapped.filter(item => (item.type || item.property_type || '').toLowerCase() === 'seeker_request');
                    } else {
                        mapped = mapped.filter(item => (item.type || item.property_type || '').toLowerCase() !== 'seeker_request');
                    }

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

                    if (category?.length > 0) {
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
                    
                    // Apply Sorting AFTER filtering
                    if (sortBy === "low-to-high") {
                        mapped = [...mapped].sort(
                            (a, b) => Number(a.price || 0) - Number(b.price || 0)
                        );
                    }

                    if (sortBy === "high-to-low") {
                        mapped = [...mapped].sort(
                            (a, b) => Number(b.price || 0) - Number(a.price || 0)
                        );
                    }

                    if (sortBy === "recommended") {
                        mapped = [...mapped];
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
        window.scrollTo(0, 0);
    }, [searchParams, allProperties, sortBy, listingTab, filters]);

    // Pagination Logic
    const {
        currentItems: paginatedListings,
        currentPage,
        totalPages,
        goToPage
    } = usePagination(listings, 12); // 12 items per page

    return (
        <>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                
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
                            className="flex-1 gap-1.5 bg-[#E1392A] hover:bg-[#E1392A]/90 text-white rounded-xl font-bold h-9 px-3 text-xs cursor-pointer justify-center"
                        >
                            <Plus size={14} /> List Stay
                        </Button>
                        <Button
                            onClick={() => {
                                if (!localStorage.getItem("user")) {
                                    navigate("/signin");
                                } else {
                                    setIsPostRequestModalOpen(true);
                                }
                            }}
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
                                {filters.location && <span className="text-[#484848] font-normal ml-2">in {filters.location}</span>}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => navigate(getHostPath('property', !!localStorage.getItem("user")))}
                                    className="gap-2 bg-[#E1392A] hover:bg-[#E1392A]/90 text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg h-10 px-5 text-sm cursor-pointer"
                                >
                                    <Plus size={16} /> List Stay
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!localStorage.getItem("user")) {
                                            navigate("/signin");
                                        } else {
                                            setIsPostRequestModalOpen(true);
                                        }
                                    }}
                                    className="gap-2 bg-[#00162D] hover:bg-[#00162D]/90 text-white border border-slate-700 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg h-10 px-5 text-sm cursor-pointer"
                                >
                                    <Plus size={16} /> Post Stay Request
                                </Button>
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-sm text-[#484848]">Sort by:</span>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl h-[380px] animate-pulse" />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-8">
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
                                <p className="text-[#484848]">Try adjusting your filters or search for a different location.</p>
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
                                <Button className="flex-1 bg-[#E1392A] hover:bg-[#C82E20]" onClick={() => setSidebarOpen(false)}>
                                    Show {total} Results
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Seeker Stay Request Modal */}
            <AnimatePresence>
                {isPostRequestModalOpen && (
                    <PostStayRequestModal
                        onClose={() => setIsPostRequestModalOpen(false)}
                        onAdd={(newPost) => setListings((prev) => [newPost, ...prev])}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
