import { useState, useEffect, useMemo } from 'react';
import { useCountry } from "@/context/CountryContext";
import { useParams, useLocation } from "react-router-dom";
import {
    Heart, CheckCircle,
    Bed, Bath, Users, Square, Wifi, Car, Utensils, Tv,
    Wind, Droplets, Shield, Building, Dumbbell, Waves as Pool, Sun, Flower, X
} from "lucide-react";
import { DirectContactModal } from "@/shared/ui/DirectContactModal";
import { useGetPropertyByIdQuery, useGetMyListingsQuery, useGetHostProfileQuery } from '@/store/api/propertyApi';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { extractSocials } from "@/shared/utils/socialExtract";

import { ImageGallery } from "./room-detail/ImageGallery";
import { PropertyInfo } from "./room-detail/PropertyInfo";
import { HostSidebar } from "./room-detail/HostSidebar";

export default function RoomPage() {
    const { id } = useParams();
    const { formatPrice } = useCountry();
    const location = useLocation();

    // State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Embla Carousel Setup for Mobile view
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 4000, stopOnInteraction: true })
    ]);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => {
            setCurrentImageIndex(emblaApi.selectedScrollSnap());
        };
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);

    // Data Fetching
    const { data: apiData, isLoading: isApiLoading, isError: isApiError, refetch } = useGetPropertyByIdQuery(id, { skip: !id });
    const { data: myListings } = useGetMyListingsQuery();
    const { data: hostProfile } = useGetHostProfileQuery();

    // Refresh Data
    useEffect(() => {
        if (id) refetch();
    }, [id, refetch]);

    // Data Resolution Logic
    const resolvedData = useMemo(() => {
        if (apiData?.property) return apiData;
        if (location.state?.property) return { property: location.state.property, host: hostProfile };
        if (myListings && Array.isArray(myListings)) {
            const found = myListings.find(p => String(p._id) === String(id) || String(p.id) === String(id));
            if (found) return { property: found, host: hostProfile };
        }
        return null;
    }, [apiData, location.state, myListings, id, hostProfile]);

    const data = resolvedData;
    const isLoading = (isApiLoading && !data) || (!data && !isApiError && !myListings);

    // Process Listing Data
    const listing = useMemo(() => {
        if (!data || !data.property) return null;
        const p = data.property;

        // Host Data Resolution:
        // 1. Try p.Host (from API property details)
        // 2. Try data.host (from HostProfile when viewing own listing)
        const sourceHost = p.Host || data.host || {};
        const sourceUser = sourceHost.User || sourceHost || {}; // Some endpoints nest user in .User, others flatten it

        const hostName = sourceHost.full_name || sourceUser.full_name || "Host";
        const hostAvatar = sourceUser.profile_image || sourceHost.profile_image || sourceHost.selfie_photo || null;
        const hostInitials = (hostName || "PH").slice(0, 2).toUpperCase();

        // Socials extraction via shared util
        const socials = extractSocials(p);

        const amenities = Array.isArray(p.amenities) ? p.amenities : [];
        const photos = Array.isArray(p.photos) && p.photos.length > 0 ? p.photos : [];

        // Amenity Categorization
        const amenityIcons = {
            'Wifi': Wifi, 'Parking': Car, 'Air Conditioning': Wind, 'TV': Tv,
            'Kitchen': Utensils, 'Pool': Pool, 'Gym': Dumbbell, 'Pet Friendly': Heart,
            'Security': Shield, 'Elevator': Building, 'Laundry': Droplets,
            'Balcony': Sun, 'Garden': Flower
        };

        const processedAmenities = {
            essentials: [], comfort: [], luxury: [], safety: []
        };

        amenities.forEach(amenity => {
            const name = typeof amenity === 'string' ? amenity : amenity.name || '';
            const icon = amenityIcons[name] || CheckCircle;
            const item = { name, icon };

            if (['Wifi', 'TV', 'Air Conditioning', 'Kitchen', 'Laundry', 'Heating', 'Internet'].includes(name)) processedAmenities.essentials.push(item);
            else if (['Pool', 'Gym', 'Parking', 'Balcony', 'Garden'].includes(name)) processedAmenities.comfort.push(item);
            else if (['Security', 'Fire Extinguisher'].includes(name)) processedAmenities.safety.push(item);
            else processedAmenities.luxury.push(item);
        });

        // Highlights
        const highlights = [];
        if (p.guests) highlights.push({ icon: Users, text: `${p.guests} Guests`, label: 'Capacity' });
        if (p.bedrooms) highlights.push({ icon: Bed, text: `${p.bedrooms} Bedrooms`, label: 'Sleeping' });
        if (p.bathrooms) highlights.push({ icon: Bath, text: `${p.bathrooms} Baths`, label: 'Bathroom' });
        if (p.area) highlights.push({ icon: Square, text: `${p.area} sq.ft`, label: 'Area' });

        return {
            id: p.id,
            title: p.title || `${p.property_type} in ${p.city}`,
            description: p.description || "A wonderful place to stay.",
            location: {
                city: p.city || "",
                country: p.country || "",
                address: p.address || "",
            },
            price: {
                nightly: parseFloat(p.price_per_night) || 0,
                hourly: parseFloat(p.price_per_hour) || 0,
                monthly: parseFloat(p.price_per_month) || 0,
                currency: p.currency || 'USD',
            },
            host: {
                name: hostName,
                avatar: hostAvatar,
                initials: hostInitials,
                isVerified: sourceHost.status === "approved",
                socials: socials,
                whatsapp: socials.whatsapp || "",
                phone: socials.phone || "",
                email: socials.email || "",
            },
            photos,
            amenities: [
                ...processedAmenities.essentials,
                ...processedAmenities.comfort,
                ...processedAmenities.luxury,
                ...processedAmenities.safety
            ],
            highlights,
            isVerified: p.status === 'approved',
            isSeekerRequest: (p.property_type || p.type || '').toLowerCase() === 'seeker_request',
            type: p.property_type || 'Property',
            rating: 0,
            reviews: 0
        };
    }, [data]);

    // Handlers
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" /></div>;
    if (!listing) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

    return (
        <div className="bg-white min-h-screen">

            {/* Breadcrumb & Gallery Section */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 mt-2 lg:mt-4 space-y-4">
                <Breadcrumb
                    items={[
                        { label: "Accommodations", path: "/search" },
                        { label: listing.title || "Room Details" }
                    ]}
                />
                <ImageGallery
                    photos={listing.photos}
                    listingId={listing.id}
                    emblaRef={emblaRef}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    onShare={copyLink}
                />
            </div>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] gap-8 md:gap-10 lg:gap-12">
                    <PropertyInfo
                        listing={listing}
                        onShare={copyLink}
                        onShowAllAmenities={() => setIsAmenitiesOpen(true)}
                    />
                    <HostSidebar
                        listing={listing}
                        formatPrice={formatPrice}
                        onContact={() => setIsContactModalOpen(true)}
                    />
                </div>
            </main>

            <DirectContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                contact={listing.host}
                listingTitle={listing.title}
            />

            {/* Amenities Modal */}
            <AnimatePresence>
                {isAmenitiesOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setIsAmenitiesOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-bold text-gray-900">What this place offers</h3>
                                <button
                                    onClick={() => setIsAmenitiesOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#484848] hover:text-gray-900"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">All Amenities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                            {listing.amenities.map((am, i) => (
                                                <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                        <am.icon className="w-5 h-5 text-[#222222]" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">{am.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
