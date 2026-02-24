import React from 'react';
import { Heart, MapPin, Phone, Maximize, Instagram, Facebook, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';
import { FaWhatsapp, FaXTwitter, FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaLink } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { useCountry } from '@/context/CountryContext';

export function ListingCard({ listing, layout = "grid" }) {
    const { formatPrice } = useCountry();
    if (!listing) return null;

    const {
        _id,
        images = [],
        title,
        location,
        price,
        currency,
        category,
        badges = [],
        area = "",
        postedTime = "",
        tags = [],
        isVerified = false,
        type = "",

        host: propHost = null, // Renamed to avoid alias conflict if we need it
        Host = null // Add capitalized Host
    } = listing;

    // Normalize Host Object
    const host = propHost || Host || {};

    // Contact Details & Socials (Perfect & Robust Mapping)
    const socials = {
        whatsapp: host?.whatsapp || listing.whatsapp || host?.phone || listing.phone || "",
        instagram: host?.instagram || listing.instagram || "",
        facebook: host?.facebook || listing.facebook || "",
        linkedin: host?.linkedin || listing.linkedin || "",
        twitter: host?.twitter || host?.x || listing.twitter || listing.x || "",
        youtube: host?.youtube || listing.youtube || "",
        website: host?.website || listing.website || ""
    };

    const normalizedSocials = {
        whatsapp: socials?.whatsapp?.trim() || null,
        instagram: socials?.instagram?.trim() || null,
        facebook: socials?.facebook?.trim() || null,
    };

    const handleSocialClick = (e, platform, handle) => {
        e.preventDefault();
        e.stopPropagation();
        if (!handle) return;

        let url = handle;
        if (platform === 'whatsapp' && !url.startsWith('http') && !url.includes('wa.me')) {
            url = `https://wa.me/${handle.replace(/\D/g, '')}`;
        } else if (!url.startsWith('http')) {
            if (platform === 'instagram') url = `https://instagram.com/${handle.replace('@', '')}`;
            else if (platform === 'facebook') url = `https://facebook.com/${handle}`;
            else if (platform === 'twitter') url = `https://twitter.com/${handle.replace('@', '')}`;
            else if (platform === 'linkedin') url = `https://linkedin.com/in/${handle}`;
            else if (platform === 'youtube') url = `https://youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
            else if (platform === 'website') url = `https://${handle}`;
        }
        window.open(url, '_blank');
    };

    // Handle Title Fallback (if title is null or "Untitled Property")
    const displayTitle = (title && title !== "Untitled Property")
        ? title
        : (type ? `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : "Accommodation");


    // Normalize Location (Handle New vs Old Schema)
    const displayLocation = (() => {
        if (typeof location === 'string') return location;
        if (typeof location === 'object' && location) {
            return `${location.city || ''}, ${location.country?.name || location.country || ''}`.replace(/^, /, '') || "Unknown Location";
        }
        return "Unknown Location";
    })();

    // Normalize Price
    const displayPrice = price || (listing.pricing?.perMonth) || 0;

    return (
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow font-sans start-animation">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Link to={`/rooms/${_id}`}>
                    <img
                        src={images[0] || null}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            e.target.className = "w-1/3 h-1/3 object-contain mx-auto my-auto opacity-30";
                            e.target.parentElement.classList.add("flex", "items-center", "justify-center", "bg-gray-100");
                        }}
                    />
                </Link>

                {/* Verification Badge (Top Left) */}
                <div className="absolute top-3 left-3 z-10">
                    <VerificationBadge isVerified={isVerified} />
                </div>

                {/* Top Right Heart */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/30 transition-colors z-10">
                    <Heart className="w-5 h-5 text-white" />
                </button>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="bg-[#FF385C] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {category || "Stay"}
                    </span>
                    {postedTime && (
                        <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-medium px-3 py-1 rounded-full shadow-sm">
                            {postedTime}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* Header: Title & Price */}
                <div className="flex justify-between items-start mb-1">
                    <Link to={`/rooms/${_id}`} className="flex-1 pr-2">
                        <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">
                            {displayTitle}
                        </h3>
                    </Link>
                    <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-gray-900 leading-tight">
                            {formatPrice(displayPrice)}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            Ready to move
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="text-xs text-gray-500 mb-4 pb-0.5 line-clamp-1">
                    {displayLocation}
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar mask-gradient-right pb-1">
                    {/* Combine backend amenities or mock tags */}
                    {(listing.amenities?.length ? listing.amenities : tags).length > 0 && (listing.amenities?.length ? listing.amenities : tags).slice(0, 5).map((tag, idx) => (
                        <span
                            key={idx}
                            className="bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Area & Social Icons */}
                <div className="flex flex-col gap-2">
                    {area && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1.5 bg-gray-50 rounded-md">
                                <Maximize className="w-3 h-3 text-gray-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block leading-none mb-0.5">Area</span>
                                <span className="text-xs font-bold leading-none">{area} {String(area).includes('sq') ? '' : 'sqft'}</span>
                            </div>
                        </div>
                    )}

                    {/* Social Quick Links */}
                    <div className="flex gap-1.5 items-center">
                        {normalizedSocials.whatsapp && (
                            <button
                                onClick={(e) => handleSocialClick(e, 'whatsapp', normalizedSocials.whatsapp)}
                                className="w-5.5 h-5.5 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm"
                            >
                                <FaWhatsapp className="w-3 h-3" />
                            </button>
                        )}

                        {normalizedSocials.instagram && (
                            <button
                                onClick={(e) => handleSocialClick(e, 'instagram', normalizedSocials.instagram)}
                                className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition-all border border-gray-100"
                            >
                                <FaInstagram className="w-3 h-3" />
                            </button>
                        )}

                        {normalizedSocials.facebook && (
                            <button
                                onClick={(e) => handleSocialClick(e, 'facebook', normalizedSocials.facebook)}
                                className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all border border-gray-100"
                            >
                                <FaFacebookF className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>

                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl"
                    >
                        View Number
                    </Button>
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-200"
                    >
                        <Phone className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}