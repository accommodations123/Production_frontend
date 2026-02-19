import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { useCountry } from "@/context/CountryContext";
import { Footer } from "@/components/layout/Footer";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ContactModal } from "@/components/contact/ContactModal";
import {
    MapPin, Star, Heart, Share2, ArrowLeft, CheckCircle,
    Bed, Bath, Users, Square, Wifi, Car, Utensils, Tv,
    Wind, Droplets, Shield, Sparkles, Phone, MessageCircle,
    ChevronLeft, ChevronRight, ShieldCheck, Mail,
    Home, Building, Key, Lock, Zap, Coffee, Dumbbell, Waves,
    Camera, Maximize2, Award, Crown, Thermometer, Wine,
    TreePine, Cloud, Waves as Pool, Sun, Moon,
    Sparkle, Gem, Flower, Trees, Mountain,
    Calendar, Clock, User, X, Copy, CopyCheck,
    Instagram, Facebook, Linkedin, Twitter, Youtube, Globe, Monitor, ExternalLink
} from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import { useGetPropertyByIdQuery, useGetMyListingsQuery, useGetHostProfileQuery } from '@/store/api/hostApi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const normalizeSocialUrl = (platform, value) => {
    if (!value) return null;
    let v = value.trim();
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    v = v.replace(/^@/, "");

    switch (platform) {
        case "whatsapp":
            const num = v.replace(/\D/g, "");
            return num ? `https://wa.me/${num}` : null;
        case "instagram": return `https://instagram.com/${v}`;
        case "facebook": return `https://facebook.com/${v}`;
        case "twitter": return `https://twitter.com/${v}`;
        case "linkedin": return `https://linkedin.com/in/${v}`;
        case "youtube": return `https://youtube.com/@${v}`;
        case "website": return `https://${v}`;
        default: return null;
    }
};

export default function RoomPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formatPrice, activeCountry } = useCountry();
    const location = useLocation();

    // State
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactType, setContactType] = useState('inquiry');
    // const [isFavorite, setIsFavorite] = useState(false); // Removed local state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);

    // Data Fetching
    const { data: apiData, isLoading: isApiLoading, isError: isApiError, refetch } = useGetPropertyByIdQuery(id, { skip: !id });
    const { data: myListings } = useGetMyListingsQuery();
    const { data: hostProfile } = useGetHostProfileQuery();

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

        // Socials extraction
        const socials = {
            whatsapp: sourceHost.whatsapp || sourceHost.phone || sourceUser.phone,
            instagram: sourceHost.instagram,
            facebook: sourceHost.facebook,
        };

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
            },
            host: {
                name: hostName,
                avatar: hostAvatar,
                initials: hostInitials,
                isVerified: sourceHost.status === "approved",
                socials: socials
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
            type: p.property_type || 'Property',
            rating: 0, // Removed static 4.8
            reviews: 0  // Removed static 12
        };
    }, [data]);

    // Handlers
    const handleContact = (type) => {
        setContactType(type);
        setIsContactOpen(true);
    };

    const handleSocialClick = (platform, value) => {
        const url = normalizeSocialUrl(platform, value);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        else toast.error("Link not available");
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" /></div>;
    if (!listing) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

    // Gallery Modal
    const GalleryModal = () => (
        <AnimatePresence>
            {isFullscreen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col"
                >
                    <div className="absolute top-4 right-4 z-10 flex gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10 rounded-full w-12 h-12 p-0"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4 md:p-10 relative">
                        <Button
                            variant="ghost"
                            className="absolute left-4 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 hidden md:flex"
                            onClick={() => setCurrentImageIndex(prev => (prev - 1 + listing.photos.length) % listing.photos.length)}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>

                        <motion.img
                            key={currentImageIndex}
                            src={listing.photos[currentImageIndex]}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-h-full max-w-5xl object-contain rounded-lg shadow-2xl"
                        />

                        <Button
                            variant="ghost"
                            className="absolute right-4 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 hidden md:flex"
                            onClick={() => setCurrentImageIndex(prev => (prev + 1) % listing.photos.length)}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </Button>
                    </div>

                    <div className="h-24 p-4 flex gap-2 overflow-x-auto justify-center">
                        {listing.photos.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={cn(
                                    "h-full aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                    i === currentImageIndex ? "border-rose-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                                )}
                            >
                                <img src={p} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            {/* Gallery Section - Full Width on Mobile, Grid on Desktop */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="relative rounded-xl md:rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[3/1] shadow-sm group">
                    {listing.photos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
                            {/* Main Photo */}
                            <div className="md:col-span-2 h-full relative cursor-pointer" onClick={() => setIsFullscreen(true)}>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                <img src={listing.photos[0]} alt="Property" className="w-full h-full object-cover" />
                            </div>

                            {/* Secondary Photos (Desktop Only) */}
                            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                                {[1, 2].map(i => (
                                    <div key={i} className="relative h-full cursor-pointer" onClick={() => { setCurrentImageIndex(i); setIsFullscreen(true); }}>
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors z-10" />
                                        <img src={listing.photos[i] || listing.photos[0]} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                                {[3, 4].map(i => (
                                    <div key={i} className="relative h-full cursor-pointer" onClick={() => { setCurrentImageIndex(i); setIsFullscreen(true); }}>
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors z-10" />
                                        <img src={listing.photos[i] || listing.photos[0]} className="w-full h-full object-cover" alt="" />
                                        {i === 4 && (
                                            <Button
                                                variant="secondary"
                                                className="absolute bottom-4 right-4 z-20 font-medium shadow-md hover:bg-white"
                                                onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
                                            >
                                                <Maximize2 className="w-4 h-4 mr-2" />
                                                Show all photos
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            No photos available
                        </div>
                    )}

                    {/* Mobile "See All" overlay */}
                    <button
                        className="md:hidden absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm"
                        onClick={() => setIsFullscreen(true)}
                    >
                        1/{listing.photos.length}
                    </button>

                    {/* Share/Save floating buttons (Mobile) */}
                    <div className="absolute top-4 right-4 flex gap-2 md:hidden">
                        <button onClick={copyLink} className="p-2 bg-white rounded-full shadow-md"><Share2 className="w-4 h-4" /></button>
                        <div className="bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center">
                            <WishlistButton
                                itemId={listing.id}
                                itemType="property"
                                className="w-full h-full flex items-center justify-center"
                                iconSize={16}
                                outlineColor="text-gray-400"
                                filledColor="fill-rose-500 text-rose-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] gap-8 md:gap-10 lg:gap-12">

                    {/* Left Column: Details (Expanded) */}
                    <div className="min-w-0 space-y-10">

                        {/* Title Header */}
                        <div className="border-b border-slate-100 pb-8">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
                                            {listing.type}
                                        </Badge>
                                        {listing.isVerified && (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2 hover:bg-emerald-100">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                            </Badge>
                                        )}
                                        {/* Removed static rating/reviews display */}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                                        {listing.title}
                                    </h1>
                                    <div className="flex items-center text-slate-500 text-base">
                                        <MapPin className="w-4 h-4 mr-1.5 text-rose-500" />
                                        {listing.location.city}, {listing.location.country}
                                    </div>
                                </div>

                                {/* Desktop Share/Save */}
                                <div className="hidden md:flex gap-2">
                                    <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 text-slate-700">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <div className="flex items-center">
                                        <WishlistButton
                                            itemId={listing.id}
                                            itemType="property"
                                            className="h-9 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-100 flex items-center gap-2 transition-colors"
                                            iconSize={16}
                                            outlineColor="text-slate-700"
                                            filledColor="fill-rose-500 text-rose-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Host Promo Card */}
                        <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-white border border-rose-100/50">
                            <div className="relative">
                                {listing.host.avatar ? (
                                    <img src={listing.host.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={listing.host.name} />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl border-2 border-white shadow-sm">
                                        {listing.host.initials}
                                    </div>
                                )}
                                {listing.host.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">Hosted by {listing.host.name}</h3>
                                <p className="text-slate-500 text-sm">Superhost · Very responsive</p>
                            </div>
                            <div className="flex gap-2">
                                {listing.host.socials.whatsapp && (
                                    <button onClick={() => handleSocialClick('whatsapp', listing.host.socials.whatsapp)} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                        <FaWhatsapp className="w-5 h-5" />
                                    </button>
                                )}
                                {listing.host.socials.instagram && (
                                    <button onClick={() => handleSocialClick('instagram', listing.host.socials.instagram)} className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Highlights Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {listing.highlights.map((h, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-sm transition-shadow">
                                    <h.icon className="w-6 h-6 text-slate-700 mb-2" />
                                    <span className="font-semibold text-slate-900">{h.text.split(' ')[0]}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wide">{h.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">About this place</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                                {listing.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="border-t border-slate-200 pt-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">What this place offers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {listing.amenities.slice(0, 10).map((am, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <am.icon className="w-6 h-6 text-slate-500" />
                                        <span className="text-slate-700">{am.name}</span>
                                    </div>
                                ))}
                            </div>
                            {listing.amenities.length > 10 && (
                                <Button variant="outline" className="mt-6 w-full md:w-auto" onClick={() => setIsAmenitiesOpen(true)}>
                                    Show all {listing.amenities.length} amenities
                                </Button>
                            )}
                        </div>

                        {/* Map */}
                        <div className="border-t border-slate-200 pt-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Where you’ll be</h2>
                            <div className="h-[400px] w-full rounded-2xl overflow-hidden relative group">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${listing.location.city}, ${listing.location.country}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                    frameBorder="0"
                                    className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                                    title="Location"
                                />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.location.city}, ${listing.location.country}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/90 backdrop-blur pointer-events-auto px-6 py-3 rounded-full shadow-lg font-semibold text-slate-900 flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all"
                                    >
                                        <MapPin className="w-4 h-4 text-rose-600" /> Open in Maps
                                    </a>
                                </div>
                            </div>
                            <div className="mt-4 text-slate-500 text-sm flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>{listing.location.city}, {listing.location.country}. Exact location provided after booking.</p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="">
                        <div className="sticky top-28">
                            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
                                <div className="flex flex-col gap-3 mb-6">
                                    {listing.price.nightly > 0 && (
                                        <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-slate-900">{formatPrice(listing.price.nightly)}</span>
                                                <span className="text-slate-500 font-medium">/ night</span>
                                            </div>
                                        </div>
                                    )}

                                    {listing.price.hourly > 0 && (
                                        <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`${listing.price.nightly > 0 ? 'text-xl text-slate-700' : 'text-3xl text-slate-900'} font-bold`}>
                                                    {formatPrice(listing.price.hourly)}
                                                </span>
                                                <span className="text-slate-500 font-medium">/ hour</span>
                                            </div>
                                        </div>
                                    )}

                                    {listing.price.monthly > 0 && (
                                        <div className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`${(listing.price.nightly > 0 || listing.price.hourly > 0) ? 'text-xl text-slate-700' : 'text-3xl text-slate-900'} font-bold`}>
                                                    {formatPrice(listing.price.monthly)}
                                                </span>
                                                <span className="text-slate-500 font-medium">/ month</span>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Guests</div>
                                                <div className="text-sm font-medium text-slate-900 mt-0.5">{listing.highlights.find(h => h.label === 'Capacity')?.text || '1 Guest'}</div>
                                            </div>
                                            <Users className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </div>



                                    <p className="text-center text-xs text-slate-400 mt-4">
                                        You won't be charged yet
                                    </p>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                listing={listing}
                type={contactType}
                onSuccess={() => {
                    toast.success("Message sent successfully!");
                    setIsContactOpen(false);
                }}
            />
            <GalleryModal />

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
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
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
                                                        <am.icon className="w-5 h-5 text-gray-600" />
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
            <Footer />
        </div>
    );
}