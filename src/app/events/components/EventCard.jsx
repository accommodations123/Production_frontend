import React, { memo } from "react"
import { Calendar, MapPin, Users, Share2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatUTCDate } from "@/lib/timezone"
import { HostPhoto } from "./HostPhoto"
import { COUNTRIES } from "@/lib/mock-data"
import WishlistButton from "@/components/ui/WishlistButton"
import { useCountry } from "@/context/CountryContext"
import { getEventStatus } from "@/lib/eventUtils"
import { resolveImageUrl } from "@/lib/imageUtils"

export const EventCard = memo(({ event, viewMode, onViewDetails, index }) => {
    const status = getEventStatus(event)
    const isExpired = status === "expired"
    const isLive = status === "happening-now"

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Date TBA";
        return formatUTCDate(dateString);
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    // Get organizer name with fallback
    const getOrganizerName = () => {
        if (event.host?.full_name) return event.host.full_name;
        if (event.organizer) return event.organizer;
        if (event.organizer_name) return event.organizer_name;
        if (event.hostName) return event.hostName;
        return "Host";
    };

    // Get event image with fallback
    const getEventImage = () => {
        const raw = event.banner_image || event.image || (event.gallery_images && event.gallery_images.length > 0 ? event.gallery_images[0] : null) || (Array.isArray(event.images) ? event.images[0] : null);
        return resolveImageUrl(raw);
    };

    const eventImage = getEventImage();

    const getCurrencySymbol = (countryName) => {
        if (!countryName) return '$';
        const normalized = (countryName === "United States" || countryName === "United States of America") ? "United States of America" : countryName;
        const country = COUNTRIES.find(c => c.name === normalized || c.code === normalized);
        if (!country || !country.currency) return '$';

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: country.currency,
            }).formatToParts(0).find(part => part.type === 'currency')?.value || country.currency;
        } catch (e) {
            return country.currency;
        }
    };

    const { activeCountry } = useCountry();
    const targetCountryName = event.country || activeCountry?.name;
    const currencySymbol = getCurrencySymbol(targetCountryName);

    return (
        <div
            className={`${viewMode === "list" ? "flex flex-col sm:flex-row gap-4" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Card className={`relative overflow-hidden rounded-2xl border shadow-xs hover:shadow-md transition-all duration-300 ${viewMode === "list" ? "flex-1 flex" : ""} bg-card ${
                isExpired ? "border-border opacity-75 grayscale-[20%]" : "border-border/80 hover:border-accent/30"
            }`}>
                {/* Card Image */}
                <div className={`relative ${viewMode === "list" ? "w-full sm:w-1/3 h-48 sm:h-auto" : "w-full h-48 sm:h-52 md:h-56"} overflow-hidden bg-slate-900`}>
                    {eventImage ? (
                        <img
                            src={eventImage}
                            alt={event.title}
                            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isExpired ? "brightness-75" : ""}`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-white/20" />
                        </div>
                    )}

                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        <Badge variant="default" className="shadow-xs font-semibold">
                            {event.type || "Event"}
                        </Badge>
                        {isExpired && (
                            <Badge variant="secondary" className="shadow-xs gap-1">
                                <Clock className="h-3 w-3" />
                                Event Ended
                            </Badge>
                        )}
                        {isLive && (
                            <Badge variant="success" className="shadow-xs gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Happening Now
                            </Badge>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 flex gap-2 z-20 pointer-events-auto">
                        <WishlistButton
                            itemId={event.id || event._id}
                            itemType="event"
                            className="w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-md"
                            iconSize={15}
                            outlineColor="text-white"
                        />
                    </div>
                    {event.price && (
                        <div className="absolute bottom-3 left-3 z-10">
                            <Badge variant="secondary" className="bg-background/95 backdrop-blur-md text-foreground font-bold px-2.5 py-1 text-xs shadow-xs">
                                {currencySymbol}{event.price}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className={`p-4 sm:p-5 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 text-muted-foreground text-xs font-medium">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                            <span className="truncate">
                                {event.city ? `${event.city}, ${event.country || ""}` : event.location || "Location TBA"}
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 line-clamp-2 leading-snug">
                            {event.title}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                            {event.description}
                        </p>

                        {/* Event Stats */}
                        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    {formatDate(event.date || event.start_date)}
                                    {event.time && ` · ${formatTime(event.time)}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{event.attendees_count || 0} attended</span>
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="flex items-center gap-3 mb-4 pt-3 border-t border-border/60">
                            <HostPhoto host={event.host} />
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">Organized by</p>
                                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{getOrganizerName()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        {isExpired ? (
                            <Button
                                onClick={() => typeof onViewDetails === 'function' ? onViewDetails(event.id) : (window.location.href = `/events/${event.id}`)}
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm gap-1.5"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span>View Recap</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={() => typeof onViewDetails === 'function' ? onViewDetails(event.id) : (window.location.href = `/events/${event.id}`)}
                                variant="accent"
                                className="flex-1 text-xs sm:text-sm font-semibold"
                            >
                                View Details
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            aria-label="Share event"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
})

EventCard.displayName = "EventCard"
