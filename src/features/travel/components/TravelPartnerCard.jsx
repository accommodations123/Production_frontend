import React, { useState } from "react";
import { Plane, Calendar, MapPin, Shield } from "lucide-react";
import WishlistButton from "@/shared/ui/WishlistButton";
import { SocialQuickConnect } from "@/shared/ui/SocialConnect";
import { resolveImageUrl, CLOUDFRONT_BASE } from "@/shared/utils/imageUtils";
import { formatUTCDate } from "@/shared/utils/timezone";

const TravelPartnerCard = React.memo(({ plan }) => {
  const [imageError, setImageError] = useState(false);

  const profileImage = React.useMemo(() => {
    if (!plan) return null;
    const candidates = [
      plan.host?.profile_image,
      plan.host?.User?.profile_image,
      plan.host?.user?.profile_image,
      plan.user?.profile_image,
      plan.user?.User?.profile_image,
      plan.user?.user?.profile_image,
      plan.user?.image,
    ];
    const rawUrl = candidates.find(img => img && typeof img === 'string' && img.startsWith('http') && !img.startsWith(CLOUDFRONT_BASE));
    if (rawUrl) return rawUrl;

    const fullUrl = candidates.find(img => img && typeof img === 'string' && img.startsWith('http'));
    if (fullUrl) return fullUrl;

    const rawKey = candidates.find(img => img && typeof img === 'string' && !img.startsWith('http'));
    if (rawKey) {
      return resolveImageUrl(rawKey);
    }

    return plan.user?.image || null;
  }, [plan]);

  if (!plan) return null;

  const user = plan.user || {
    fullName: plan.host?.full_name || plan.user?.fullName || plan.user?.name || "Traveler",
    verified: plan.host?.verified ?? plan.user?.verified ?? false,
    age: plan.trip_meta?.age || plan.user?.age || null,
    languages: plan.trip_meta?.languages || plan.user?.languages || [],
  };

  const formatTime12h = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return t;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const formattedDate = plan.date || plan.travel_date ? formatUTCDate(plan.date || plan.travel_date) : "";

  const fromCity = (plan.flight?.from || plan.flight?.from_country || plan.from_city || plan.origin || "").split(',')[0].trim();
  const toCity = (plan.flight?.to || plan.destination || plan.to_city || "").split(',')[0].trim();
  const depTime = formatTime12h(plan.flight?.departureTime || plan.time);
  const arrTime = formatTime12h(plan.flight?.arrivalTime);
  const airline = [plan.flight?.airline, plan.flight?.flightNumber]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 shadow-sm h-[350px] flex flex-col bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none text-left">
      
      {/* Card Header (Matching EventCard & MarketplaceCard Header Dimensions & Gradient) */}
      <div className="w-full h-[150px] shrink-0 relative overflow-hidden bg-gradient-to-br from-[#00142E] via-[#071F3B] to-slate-900 p-3.5 flex flex-col justify-between">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Status badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2 sm:px-3 py-1 bg-[#00142E] text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
            Travel Match
          </span>
          {user.verified && (
            <span className="px-2 sm:px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Shield className="h-3 w-3 fill-white" />
              Verified
            </span>
          )}
        </div>

        {/* Wishlist top-right */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <WishlistButton
            itemId={plan.id || plan._id}
            itemType="trip"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 rounded-full"
            iconSize={16}
            outlineColor="text-white"
          />
        </div>

        {/* Route Pill at bottom of header (Matching EventCard Price Badge position) */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2 sm:px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 font-bold rounded-lg shadow-lg text-xs sm:text-sm flex items-center gap-1.5">
            <span>{fromCity || 'Origin'}</span>
            <Plane size={11} className="text-[#E1392A]" />
            <span className="text-[#E1392A]">{toCity || 'Destination'}</span>
          </span>
        </div>
      </div>

      {/* Card Content (Matching EventCard & MarketplaceCard Content Padding & Font Scale) */}
      <div className="p-3.5 flex-grow flex flex-col gap-2 min-h-0 min-w-0">
        
        {/* Location & Date */}
        <div className="flex items-center gap-1.5 text-[#484848] text-xs sm:text-sm font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#E1392A] shrink-0" />
          <span className="truncate">
            {fromCity && toCity ? `${fromCity} ➔ ${toCity}` : plan.destination || "Location TBA"}
          </span>
          {formattedDate && (
            <span className="text-[10px] text-[#717171] ml-auto">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-sm sm:text-base font-bold text-gray-900 leading-snug truncate group-hover:text-[#E1392A] transition-colors"
          title={user.fullName}
        >
          {user.fullName ? `Travel with ${user.fullName}` : `Flight from ${fromCity} to ${toCity}`}
        </h3>

        {/* Quote / Details snippet (Matching EventCard description format) */}
        <p className="text-[#222222] text-xs line-clamp-2 leading-relaxed border-l-2 border-gray-100 pl-3">
          {airline ? `Airline: ${airline}` : 'Flight Path Match'} {user.age ? `• ${user.age} yrs` : ''} {user.languages?.length > 0 ? `• Languages: ${user.languages.join(', ')}` : ''}
        </p>

        {/* Footer: Traveler Profile & Social Quick Connect */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100 h-[60px] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {profileImage && !imageError ? (
              <img
                src={profileImage}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 shrink-0"
                alt={user.fullName}
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00142E] flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user.fullName?.[0] || "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-[#717171] font-bold leading-none">
                Traveler
              </p>
              <p
                className="text-xs font-bold text-gray-900 truncate w-24 sm:w-28 mt-0.5"
                title={user.fullName}
              >
                {user.fullName || 'Traveler'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <SocialQuickConnect socials={plan.socials} />
          </div>
        </div>

      </div>

    </div>
  );
});

export default TravelPartnerCard;