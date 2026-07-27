import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, ShieldCheck, Bath } from 'lucide-react';
import { SocialQuickConnect } from '@/shared/ui/SocialConnect';
import { useCountry } from '@/context/CountryContext';
import WishlistButton from '@/shared/ui/WishlistButton';
import { CLOUDFRONT_BASE } from '@/shared/utils/imageUtils';

export const CardContainer = ({ children, linkTo, className = "" }) => {
    const navigate = useNavigate();
    const handleNavigate = (e) => {
        // Ignore clicks on buttons/icons
        if (e.target.closest("button")) return;

        navigate(linkTo);
    };

    return (
        <div
            onClick={handleNavigate}
            className={`group block h-full cursor-pointer select-none focus:outline-none`}
        >
            <div className={`bg-white rounded-3xl border border-border hover:border-accent/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-[350px] flex flex-col overflow-hidden relative ${className}`}>
                {children}
            </div>
        </div>
    );
};

export const PropertyCard = React.memo(({ property }) => {
    const { formatPrice } = useCountry();
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    if (!property) return null;

    // Helper to normalize image URLs
    const getValidImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const CLOUDFRONT = CLOUDFRONT_BASE;
        return `${CLOUDFRONT}/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
    };

    const isSeekerRequest = (property.property_type || property.type || '').toLowerCase() === 'seeker_request';

    // Normalize property domain fields across host listings and seeker stay requests
    const propertyData = {
        id: property.id || property._id || 'unknown',
        isSeekerRequest,
        title: (property.title && !property.title.toLowerCase().includes("untitled"))
            ? property.title
            : (property.name && !property.name.toLowerCase().includes("untitled"))
                ? property.name
                : (property.property_type ? property.property_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Stay"),
        location: property.city || property.location?.city || property.address || "Location Info",
        hostPreference: property.host_preference || "",
        image: getValidImageUrl((Array.isArray(property.photos) && property.photos.length > 0)
            ? property.photos[0]
            : (property.image || property.property_images?.[0])),
        isVerified: property.status === 'approved',
        status: property.status || 'pending',
        rating: property.rating || property.Host?.rating || property.host?.rating || 0,
        reviews: property.reviews || property.Host?.review_count || property.host?.review_count || 0,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        bedrooms: property.bedrooms || property.stats?.bedrooms || 0,
        bathrooms: property.bathrooms || property.stats?.bathrooms || 0,
        area: property.area || property.stats?.area || "",
        guests: property.guests || property.stats?.guests || 0,
        price: {
            amount: (property.price_per_month || property.pricing?.perMonth) || 
                    (property.price_per_night || property.pricing?.perNight) || 
                    (property.price_per_hour || property.pricing?.perHour) || 0,
            currency: property.currency || property.pricing?.currency || 'INR',
            period: (property.price_per_month || property.pricing?.perMonth) ? 'month' : (property.price_per_night || property.pricing?.perNight) ? 'night' : 'hour'
        },
        host: property.host || property.Host || property.creator || {},
        hostImage: getValidImageUrl(property.host?.User?.profile_image || property.Host?.User?.profile_image || property.host?.profile_image || property.Host?.profile_image || property.host?.image || property.creator?.profile_image),
        // Contact Details & Socials (Perfect & Robust Mapping)
        socials: {
            whatsapp:
                property.Host?.whatsapp ||
                property.host?.whatsapp ||
                property.Host?.phone ||
                property.host?.phone ||
                property.phone ||
                "",

            instagram:
                property.Host?.instagram ||
                property.host?.instagram ||
                property.Host?.User?.instagram ||
                property.creator?.instagram ||
                "",

            facebook:
                property.Host?.facebook ||
                property.host?.facebook ||
                property.Host?.User?.facebook ||
                property.creator?.facebook ||
                "",

            twitter:
                property.Host?.twitter ||
                property.host?.twitter ||
                property.Host?.x ||
                property.Host?.User?.twitter ||
                "",

            email:
                property.Host?.email ||
                property.host?.email ||
                property.Host?.User?.email ||
                property.host?.User?.email ||
                property.creator?.email ||
                property.email ||
                ""
        }
    };

    // If seeker request, override main image to be seeker's avatar/photo
    const cardImage = propertyData.isSeekerRequest
        ? (propertyData.hostImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80")
        : (propertyData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop");

    return (
        <CardContainer key={propertyData.id} linkTo={`/rooms/${propertyData.id}`}>
            {/* Image Section */}
            <div className="relative h-[150px] overflow-hidden bg-muted shrink-0">
                <img
                    src={cardImage}
                    alt={propertyData.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'%3E%3C/path%3E%3Cpolyline points='9 22 9 12 15 12 15 22'%3E%3C/polyline%3E%3C/svg%3E"; // SVG Home Icon
                        e.target.className = "w-1/2 h-1/2 object-contain mx-auto my-auto opacity-50";
                        e.target.classList.remove('opacity-0');
                    }}
                    loading="lazy"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {propertyData.isSeekerRequest ? (
                        <div className="bg-[#00162D] backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-700">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Room Wanted</span>
                        </div>
                    ) : propertyData.isVerified ? (
                        <div className="bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-green-400/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">Verified</span>
                        </div>
                    ) : (
                        <div className="bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-red-400/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">Unverified</span>
                        </div>
                    )}
                </div>

                {/* Top Right Heart */}
                <div className="absolute top-4 right-4 z-20">
                    <WishlistButton
                        itemId={propertyData.id}
                        itemType="property"
                        className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm border border-white/20 bg-black/20 hover:bg-white group"
                        iconSize={16}
                        outlineColor="text-white group-hover:text-[#E1392A]"
                        filledColor="fill-[#E1392A] text-[#E1392A]"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3.5 flex-grow flex flex-col gap-2 min-h-0">
                {/* Title & Location */}
                <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-[#00142E] group-hover:text-[#E1392A] transition-colors min-h-[2.5rem]" title={propertyData.title}>
                        {propertyData.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[#00142E]/60 text-xs sm:text-sm font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#E1392A]" />
                        <span className="line-clamp-1">{propertyData.location}</span>
                    </div>
                </div>

                {/* Stats Row */}
                {propertyData.isSeekerRequest ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 min-h-[1.5rem]">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {property.stay_type || property.stayType || 'Long Term'}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {property.furnishing || 'Furnished'}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-sm text-[#00142E]/70">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#E1392A]" />
                            <span className="font-medium">{propertyData.guests}</span>
                        </div>
                        <div className="w-px h-3 bg-[#00142E]/10" />
                        <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-[#E1392A]" />
                            <span className="font-medium">{propertyData.bedrooms}</span>
                        </div>
                        {propertyData.bathrooms > 0 && (
                            <>
                                <div className="w-px h-3 bg-[#00142E]/10" />
                                <div className="flex items-center gap-1.5">
                                    <Bath className="w-4 h-4 text-[#E1392A]" />
                                    <span className="font-medium">{propertyData.bathrooms}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Price & Actions Row */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 h-[60px] shrink-0">
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-[#00142E]/60 mr-1">
                            {propertyData.isSeekerRequest ? "Budget:" : ""}
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#00142E]">
                            {propertyData.price.amount > 0 ? formatPrice(propertyData.price.amount, propertyData.price.currency) : "On Request"}
                        </span>
                        {propertyData.price.amount > 0 && (
                            <span className="text-[10px] sm:text-xs font-semibold text-[#00142E]/50">/{propertyData.price.period}</span>
                        )}
                    </div>

                    {/* Social Media Quick Connect (Price Section) */}
                    <SocialQuickConnect socials={propertyData.socials} />
                </div>
            </div>
        </CardContainer>
    );
});
