import React from 'react';
import { Heart, MapPin, Phone, Maximize } from 'lucide-react';
import WishlistButton from '@/components/ui/WishlistButton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { useCountry } from '@/context/CountryContext';

export function ListingCard({ listing, layout = "grid" }) {
    const { formatPrice } = useCountry();
    if (!listing) return null;

    const {
        _id,
        id,
        images = [],
        media = [],
        photos = [],
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
        city,
        address,
        country
    } = listing;

    // Handle Title Fallback (if title is null or "Untitled Property")
    const displayTitle = (title && title !== "Untitled Property")
        ? title
        : (type ? `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : "Accommodation");


    // Normalize Location (Handle New vs Old Schema)
    const displayLocation = (() => {
        if (typeof location === 'string') return location;
        if (city) return `${city}, ${country?.name || country || ''}`.replace(/^, /, '');
        if (address) return address;
        if (typeof location === 'object' && location) {
            return `${location.city || ''}, ${location.country?.name || location.country || ''}`.replace(/^, /, '') || "Unknown Location";
        }
        return "Unknown Location";
    })();

    // Normalize Images
    const displayImage = images[0] || media?.[0]?.url || photos[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80";

    // Normalize Price
    const displayPrice = price || (listing.pricing?.perMonth) || 0;

    return (
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow font-sans start-animation">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Link to={`/rooms/${_id || id}`}>
                    <img
                        src={displayImage}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop";
                        }}
                    />
                </Link>

                {/* Verification Badge (Top Left) */}
                <div className="absolute top-3 left-3 z-10">
                    <VerificationBadge isVerified={isVerified} />
                </div>

                {/* Top Right Heart */}
                {/* Top Right Heart */}
                <div className="absolute top-3 right-3 z-10">
                    <WishlistButton
                        itemId={id || _id}
                        itemType="property"
                        className="w-8 h-8 bg-black/20 backdrop-blur-md hover:bg-black/30 flex items-center justify-center"
                        iconSize={20}
                    />
                </div>

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
                    <Link to={`/rooms/${_id || id}`} className="flex-1 pr-2">
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

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-100">
                    {/* Area */}
                    {area ? (
                        <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1.5 bg-gray-50 rounded-md">
                                <Maximize className="w-3 h-3 text-gray-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block leading-none mb-0.5">Area</span>
                                <span className="text-xs font-bold leading-none">{area} {String(area).includes('sq') ? '' : 'sqft'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

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
        </div>
    );
}