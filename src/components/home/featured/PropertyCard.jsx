import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, ShieldCheck, ShieldAlert, Bath, Home } from 'lucide-react';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { SocialQuickConnect } from '@/components/ui/SocialConnect';
import { useCountry } from '@/context/CountryContext';
import { toast } from 'sonner';
import WishlistButton from '@/components/ui/WishlistButton';
import { resolveImageUrl, normalizeImages } from '@/lib/imageUtils';

export const CardContainer = ({ children, linkTo, className = "" }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        // Ignore clicks on buttons/icons/links
        if (e.target.closest("button") || e.target.closest("a")) return;

        if (linkTo) {
            navigate(linkTo);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group block h-full cursor-pointer select-none focus:outline-none`}
        >
            <div className={`bg-white rounded-[1.5rem] border border-[#E5E7EB] hover:border-[#CB2A25]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative ${className}`}>
                {children}
            </div>
        </div>
    );
};

export const PropertyCard = React.memo(({ property }) => {
    const { formatPrice } = useCountry();
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!property) return null;

    // Helper to normalize image URLs
    const getValidImageUrl = (imagePath) => {
        return resolveImageUrl(imagePath);
    };

    const resolvedImage = useMemo(() => {
        if (!property) return null;
        const normalized = normalizeImages([
            property.photos,
            property.images,
            property.image,
            property.banner_image,
            property.banner,
            property.photo,
            property.property_images,
            property.pictures
        ]);
        return normalized[0] || null;
    }, [property]);

    // Safely get property data
    const propertyData = {
        id: property.id || property._id || 'unknown',
        title: (property.title && !property.title.toLowerCase().includes("untitled"))
            ? property.title
            : (property.name && !property.name.toLowerCase().includes("untitled"))
                ? property.name
                : (property.property_type ? property.property_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Stay"),
        location: property.city || property.location?.city || property.address || "Location Info",
        hostPreference: property.host_preference || "",
        image: resolvedImage,
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




    return (
        <CardContainer key={propertyData.id} linkTo={`/rooms/${propertyData.id}`}>
            {/* Image Section */}
            <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-slate-100 flex items-center justify-center">
                {propertyData.image && !imageError ? (
                    <img
                        src={propertyData.image}
                        alt={propertyData.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-90'}`}
                        onLoad={() => setIsImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setIsImageLoaded(false);
                        }}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 select-none">
                        <Home className="w-12 h-12 stroke-[1.25] text-slate-300 mb-1" />
                        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">No Image Uploaded</span>
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {propertyData.isVerified ? (
                        <div className="bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-green-400/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">Verified</span>
                        </div>
                    ) : (
                        <div className="bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-400/50">
                            <ShieldAlert className="w-3.5 h-3.5 text-white" />
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
                        outlineColor="text-white group-hover:text-[#CB2A25]"
                        filledColor="fill-[#CB2A25] text-[#CB2A25]"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3.5 sm:p-4 md:p-5 flex-grow flex flex-col gap-3 sm:gap-4">
                {/* Title & Location */}
                <div className="space-y-1">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1 text-[#00142E] group-hover:text-[#CB2A25] transition-colors">
                        {propertyData.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[#00142E]/60 text-sm font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{propertyData.location}</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-sm text-[#00142E]/70">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#CB2A25]" />
                        <span className="font-medium">{propertyData.guests}</span>
                    </div>
                    <div className="w-px h-3 bg-[#00142E]/10" />
                    <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-[#CB2A25]" />
                        <span className="font-medium">{propertyData.bedrooms}</span>
                    </div>
                    {propertyData.bathrooms > 0 && (
                        <>
                            <div className="w-px h-3 bg-[#00142E]/10" />
                            <div className="flex items-center gap-1.5">
                                <Bath className="w-4 h-4 text-[#CB2A25]" />
                                <span className="font-medium">{propertyData.bathrooms}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Price & Actions Row */}
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-[#00142E]">
                                {propertyData.price.amount > 0 ? formatPrice(propertyData.price.amount, propertyData.price.currency) : "On Request"}
                            </span>
                            {propertyData.price.amount > 0 && (
                                <span className="text-xs font-medium text-[#00142E]/50">/{propertyData.price.period}</span>
                            )}
                        </div>
                    </div>

                    {/* Social Media Quick Connect (Price Section) */}
                    <SocialQuickConnect
                        socials={propertyData.socials}
                        ownerId={property.host_id || property.hostId || property.user_id || property.Host?.user_id || property.host?.user_id || property.Host?.User?.id || property.host?.User?.id || property.host?.id || property.Host?.id || property.creator?.id || property.owner_id || property.ownerId || propertyData.host?.user_id || propertyData.host?.id}
                        ownerName={propertyData.host?.full_name || propertyData.host?.name || property.host_name || property.hostName || property.user_name || property.Host?.full_name || property.host?.full_name || "Host"}
                        itemId={propertyData.id}
                        itemTitle={propertyData.title}
                        itemType="accommodations"
                    />

                </div>
            </div>
        </CardContainer>
    );
});