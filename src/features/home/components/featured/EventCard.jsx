import React from 'react';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getEventStatus } from '@/shared/utils/eventUtils';
import WishlistButton from '@/shared/ui/WishlistButton';

const HostPhoto = ({ host, name }) => {
    const photoUrl =
        host?.User?.profile_image ||
        host?.profile_image ||
        host?.selfie_photo ||
        host?.photo ||
        host?.avatar_image ||
        host?.image;

    return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name || "Organizer"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <span className="text-xs font-bold text-gray-500 uppercase">
                    {(name || "O").charAt(0)}
                </span>
            )}
        </div>
    );
};

export const EventCard = ({ event, viewMode = "grid", onViewDetails }) => {
    const status = getEventStatus(event);
    const isExpired = status === "expired";
    const isLive = status === "happening-now";

    // Helper function for formatting time
    const formatTime = (timeString) => {
        if (!timeString) return "";
        if (timeString.includes(':') && (timeString.includes('AM') || timeString.includes('PM'))) {
            return timeString;
        }
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minutes || '00'} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    const getOrganizerName = () => {
        const host = event.Host || event.host || event.creator || event.organizer;
        if (host?.full_name) return host.full_name;
        if (host?.name) return host.name;
        if (host?.User?.full_name) return host.User.full_name;
        if (typeof host === 'string') return host;
        if (event.host_name) return event.host_name;
        return "Organizer";
    };

    const getDateParts = (dateString) => {
        if (!dateString) return { month: "TBA", day: "" };
        const cleanDateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const date = new Date(`${cleanDateStr}T00:00:00Z`);
        if (isNaN(date.getTime())) {
            const fallbackDate = new Date(dateString);
            if (!isNaN(fallbackDate.getTime())) {
                return {
                    month: fallbackDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
                    day: fallbackDate.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
                };
            }
            return { month: "TBA", day: "" };
        }
        return {
            month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
            day: date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
        };
    };

    const { month, day } = getDateParts(event.date || event.start_date || event.event_date);

    return (
        <div className={`group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border overflow-hidden ${
            isExpired ? "border-gray-200 opacity-75 grayscale-[20%]" : "border-neutral-100"
        } ${viewMode === "list" ? "flex h-auto" : "h-[350px] flex flex-col"}`}>
            {/* Event Image */}
            {viewMode !== "list" && (
                <div className={`relative h-[150px] overflow-hidden shrink-0 ${!(event.banner_image || event.image) ? 'bg-gradient-to-br from-slate-700 to-slate-900' : ''}`}>
                    {(event.banner_image || event.image) ? (
                        <img
                            src={event.banner_image || event.image}
                            alt={event.title}
                            className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${isExpired ? "brightness-75" : ""}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Date Block Overlay */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-1.5 text-center min-w-[3rem] shadow-lg border border-white/20">
                        <span className="block text-[10px] font-bold text-[#CB2A25] uppercase tracking-wider">{month}</span>
                        <span className="block text-lg font-black text-[#00142E] leading-none mt-0.5">{day}</span>
                    </div>

                    {/* Status Badges & Wishlist Overlay */}
                    <div className="absolute top-3 right-3 flex items-start gap-2 z-10">
                        <div className="flex flex-col gap-1.5 items-end">
                            {isExpired && (
                                <span className="px-2 py-1 bg-gray-800/90 backdrop-blur-sm text-gray-200 text-[10px] font-bold rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-wide">
                                    <Clock className="h-3 w-3" />
                                    Ended
                                </span>
                            )}
                            {isLive && (
                                <span className="px-2 py-1 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg flex items-center gap-1 animate-pulse uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    Live
                                </span>
                            )}
                        </div>
                        <WishlistButton
                            itemId={event.id || event._id}
                            itemType="event"
                            className="w-7 h-7 bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 rounded-full"
                            iconSize={14}
                            outlineColor="text-white"
                        />
                    </div>
                </div>
            )}

            <div className={`p-3.5 flex-grow flex flex-col gap-2 min-h-0 min-w-0 ${viewMode === "list" ? "flex-grow flex flex-col justify-between" : ""}`}>
                {/* Category Badge */}
                <div className="flex items-center">
                    <span className="inline-block bg-[#CB2A25] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
                        {event.category || "Community"}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-[#00142E] group-hover:text-[#CB2A25] transition-colors min-h-[2.5rem]" title={event.title}>
                    {event.title}
                </h3>

                {/* Location & Time */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#CB2A25] shrink-0" />
                    <span className="line-clamp-1">{event.city ? `${event.city}, ${event.country || ""}` : event.location || "Location TBA"}</span>
                    {(event.time || event.start_time) && (
                        <span className="text-[10px] text-gray-400 ml-auto">
                            {formatTime(event.time || event.start_time)}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed border-l-2 border-gray-100 pl-3">
                    {event.description}
                </p>

                {/* Footer: Organizer & Actions aligned */}
                <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100 h-[60px] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <HostPhoto host={event.Host || event.host || event.creator} name={getOrganizerName()} />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-none">Hosted by</p>
                            <p className="text-xs font-bold text-[#00142E] truncate w-24 sm:w-28 mt-0.5" title={getOrganizerName()}>
                                {getOrganizerName()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 shadow-inner">
                            <Users className="h-3 w-3 text-[#CB2A25]" />
                            <span className="text-[10px] font-bold text-[#00142E]">{event.attendees_count || 0}</span>
                        </div>
                        <Button
                            onClick={() => onViewDetails(event.id || event._id)}
                            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer ${
                                isExpired ? "bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200" : "bg-[#CB2A25] hover:bg-[#A9201C] text-white"
                            }`}
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};