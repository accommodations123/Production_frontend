import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart, Star, MapPin, Users, Wifi, Car, Utensils, Tv,
    Thermometer, Bed, CheckCircle, ShieldCheck, Dumbbell, ArrowRight, ExternalLink, Bath, MessageCircle,
    Globe, Twitter
} from 'lucide-react';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { MdEmail } from "react-icons/md";
import {
    FaWhatsapp,
    FaInstagram,
    FaFacebookF,
    FaLinkedinIn,
    FaYoutube,
    FaLink,
    FaXTwitter
} from "react-icons/fa6";
import { useCountry } from '@/context/CountryContext';
import { toast } from 'sonner';
import WishlistButton from '@/components/ui/WishlistButton';

export const CardContainer = ({ children, linkTo, className = "" }) => (
    <Link to={linkTo} className="group block h-full select-none focus:outline-none" aria-label="View details">
        <div className={`bg-white rounded-[1.5rem] border border-[#E5E7EB] hover:border-[#CB2A25]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative ${className}`}>
            {children}
        </div>
    </Link>
);

export const PropertyCard = ({ property }) => {
    const { formatPrice } = useCountry();
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    if (!property) return null;

    // Helper to normalize image URLs
    const getValidImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
    };

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
            amount: property.price_per_night || property.price_per_month || property.price_per_hour || property.pricing?.perNight || property.pricing?.perMonth || 0,
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
                ""
        }


    };

    const handleSocialClick = (e, platform, value) => {
        e.preventDefault();
        e.stopPropagation();
        if (!value) return;

        let url;

        switch (platform) {
            case "whatsapp": {
                const phone = value.replace(/\D/g, "");
                if (!phone) return;
                url = `https://wa.me/${phone}`;
                break;
            }

            case "instagram":
                url = value.startsWith("http")
                    ? value
                    : `https://instagram.com/${value.replace(/^@/, "")}`;
                break;

            case "facebook":
                url = value.startsWith("http")
                    ? value
                    : `https://facebook.com/${value}`;
                break;

            case "twitter":
                url = value.startsWith("http")
                    ? value
                    : `https://twitter.com/${value.replace(/^@/, "")}`;
                break;

            default:
                return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };


    return (
        <CardContainer key={propertyData.id} linkTo={`/rooms/${propertyData.id}`}>
            {/* Image Section */}
            <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100">
                <img
                    src={propertyData.image}
                    alt={propertyData.title}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
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
                    {propertyData.isVerified ? (
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
                                {propertyData.price.amount > 0 ? formatPrice(propertyData.price.amount) : "On Request"}
                            </span>
                            {propertyData.price.amount > 0 && (
                                <span className="text-xs font-medium text-[#00142E]/50">/{propertyData.price.period}</span>
                            )}
                        </div>
                    </div>

                    {/* Social Media Quick Connect (Price Section) */}
                    <div className="flex gap-2 items-center justify-end">

                        {propertyData.socials.whatsapp && (
                            <button
                                onClick={(e) =>
                                    handleSocialClick(e, "whatsapp", propertyData.socials.whatsapp)
                                }
                                className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition"
                                title="WhatsApp"
                            >
                                <FaWhatsapp className="w-4 h-4" />
                            </button>
                        )}

                        {propertyData.socials.instagram && (
                            <button
                                onClick={(e) =>
                                    handleSocialClick(e, "instagram", propertyData.socials.instagram)
                                }
                                className="w-7 h-7 rounded-full bg-gray-100 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition"
                                title="Instagram"
                            >
                                <FaInstagram className="w-4 h-4" />
                            </button>
                        )}

                        {propertyData.socials.facebook && (
                            <button
                                onClick={(e) =>
                                    handleSocialClick(e, "facebook", propertyData.socials.facebook)
                                }
                                className="w-7 h-7 rounded-full bg-gray-100 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition"
                                title="Facebook"
                            >
                                <FaFacebookF className="w-3.5 h-3.5" />
                            </button>
                        )}




                        {propertyData.socials.twitter && (
                            <button
                                onClick={(e) =>
                                    handleSocialClick(e, "twitter", propertyData.socials.twitter)
                                }
                                className="w-7 h-7 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-black hover:text-white transition"
                                title="X (Twitter)"
                            >
                                <FaXTwitter className="w-3.5 h-3.5" />
                            </button>
                        )}

                    </div>

                </div>
            </div>
        </CardContainer>
    );
};