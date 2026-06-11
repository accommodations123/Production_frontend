import React, { useState } from "react";
import { Plane, MapPin, Calendar, Globe, Shield } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import { SocialQuickConnect } from "@/components/ui/SocialConnect";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatUTCDate } from "../../utils/timezone";

export default function TripCard({ plan }) {
    if (!plan || !plan.user) return null;

    const formatTime12h = (t) => {
        if (!t) return "";
        const [h, m] = t.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) return t;
        const period = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
    };

    const formattedDate = plan.date ? formatUTCDate(plan.date) : "";

    const [imageError, setImageError] = useState(false);

    const profileImage = React.useMemo(() => {
        const candidates = [
            plan.host?.profile_image,
            plan.host?.User?.profile_image,
            plan.host?.user?.profile_image,
            plan.user?.profile_image,
            plan.user?.User?.profile_image,
            plan.user?.user?.profile_image,
            plan.user?.image,
        ];
        // First, try to find one that's already a full URL starting with http
        // But since plan.user.image is processed by resolveImageUrl, it might already be the broken cloudfront URL.
        // So we should try to find a full URL that is NOT a cloudfront URL first!
        const CLOUDFRONT_BASE = 'https://d3dqp3l6ug81j3.cloudfront.net';
        const rawUrl = candidates.find(img => img && typeof img === 'string' && img.startsWith('http') && !img.startsWith(CLOUDFRONT_BASE));
        if (rawUrl) return rawUrl;

        // Otherwise, any full URL (including cloudfront)
        const fullUrl = candidates.find(img => img && typeof img === 'string' && img.startsWith('http'));
        if (fullUrl) return fullUrl;

        // Fallback: use resolveImageUrl on whichever key is available
        const rawKey = candidates.find(img => img && typeof img === 'string' && !img.startsWith('http'));
        if (rawKey) {
            return resolveImageUrl(rawKey);
        }

        return plan.user?.image || null;
    }, [plan]);

    const fromCity = (plan.flight?.from || plan.flight?.from_country || "").split(',')[0].trim();
    const toCity = (plan.flight?.to || plan.destination || "").split(',')[0].trim();
    const depTime = formatTime12h(plan.flight?.departureTime);
    const arrTime = formatTime12h(plan.flight?.arrivalTime);
    const airline = [plan.flight?.airline, plan.flight?.flightNumber]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="group bg-white rounded-2xl border border-gray-200/80 hover:border-[#CB2A25]/25 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
            {/* Flight Route Header — compact gradient banner */}
            <div className="relative bg-gradient-to-br from-[#00142E] to-[#0A2847] px-4 pt-4 pb-5 text-white">
                {/* Wishlist top-right */}
                <div className="absolute top-3 right-3 z-10">
                    <WishlistButton
                        itemId={plan.id || plan._id}
                        itemType="trip"
                        className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm border border-white/15 bg-white/10 hover:bg-white group/btn"
                        iconSize={14}
                        outlineColor="text-white/70 group-hover/btn:text-[#CB2A25]"
                        filledColor="fill-[#CB2A25] text-[#CB2A25]"
                    />
                </div>

                {/* Route visual */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                            From
                        </span>
                        <span className="text-sm font-bold truncate leading-tight mt-0.5">
                            {fromCity}
                        </span>
                        {depTime && (
                            <span className="text-[10px] text-[#CB2A25] font-semibold mt-0.5">
                                {depTime}
                            </span>
                        )}
                    </div>

                    {/* Flight path line */}
                    <div className="flex items-center gap-1 shrink-0 px-1">
                        <div className="w-2 h-2 rounded-full border-2 border-white/40" />
                        <div className="w-8 sm:w-12 h-px bg-white/25 relative">
                            <Plane
                                size={12}
                                className="absolute -top-[5px] left-1/2 -translate-x-1/2 text-white/80 rotate-0"
                            />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#CB2A25]" />
                    </div>

                    <div className="flex flex-col items-end min-w-0 flex-1 pr-10">
                        <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                            To
                        </span>
                        <span className="text-sm font-bold truncate leading-tight mt-0.5 text-right">
                            {toCity}
                        </span>
                        {arrTime && (
                            <span className="text-[10px] text-blue-300 font-semibold mt-0.5">
                                {arrTime}
                            </span>
                        )}
                    </div>
                </div>

                {/* Airline tag */}
                {airline && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] bg-white/10 backdrop-blur-sm text-white/70 px-2 py-0.5 rounded-full font-medium border border-white/10">
                            {airline}
                        </span>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4 flex-grow flex flex-col gap-3">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    {profileImage && !imageError ? (
                        <img
                            src={profileImage}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shrink-0"
                            alt={plan.user.fullName}
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CB2A25] to-[#E04642] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {plan.user.fullName?.[0] || "U"}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm text-[#00142E] leading-tight truncate">
                            {plan.user.fullName || "Traveler"}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {plan.user.age && (
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {plan.user.age} yrs
                                </span>
                            )}
                            {plan.user.gender && (
                                <span className="text-[11px] text-gray-400">
                                    • {plan.user.gender}
                                </span>
                            )}
                            {plan.user.verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full">
                                    <Shield size={8} className="fill-blue-100" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Destination */}
                {plan.destination && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <Globe size={14} className="text-[#CB2A25] shrink-0" />
                        <span className="text-xs font-semibold text-[#00142E] truncate">
                            {plan.destination}
                        </span>
                    </div>
                )}

                {/* Language tags */}
                {plan.user.languages && plan.user.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {plan.user.languages.slice(0, 3).map((lang, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold"
                            >
                                {lang}
                            </span>
                        ))}
                        {plan.user.languages.length > 3 && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                +{plan.user.languages.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer: Date & Social Icons */}
                <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
                    {formattedDate && (
                        <div className="flex items-center gap-1.5">
                            <Calendar
                                size={13}
                                className="text-[#CB2A25] shrink-0"
                            />
                            <span className="text-xs font-bold text-[#00142E]">
                                {formattedDate}
                            </span>
                        </div>
                    )}
                    <SocialQuickConnect socials={plan.socials} />
                </div>
            </div>
        </div>
    );
}
