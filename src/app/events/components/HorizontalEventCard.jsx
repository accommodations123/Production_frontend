import { memo } from "react"
import { Calendar, MapPin, Users, Share2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HostPhoto } from "./HostPhoto"
import { COUNTRIES } from "@/lib/mock-data"
import WishlistButton from "@/components/ui/WishlistButton"
import { useCountry } from "@/context/CountryContext"
import { getEventStatus } from "@/lib/eventUtils"
import { formatUTCDate } from "../../../utils/timezone"

export const HorizontalEventCard = memo(({ event, onViewDetails, index }) => {
    const status = getEventStatus(event)
    const isExpired = status === "expired"
    const isLive = status === "happening-now"
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Date TBA";
        return formatUTCDate(dateString);
    };

    // Get organizer name with fallback
    const getOrganizerName = () => {
        if (event.host?.full_name) return event.host.full_name;
        if (event.organizer) return event.organizer;
        return "Unknown Organizer";
    };

    // Get event image with fallback
    const getEventImage = () => {
        if (event.image) return event.image;
        if (event.banner_image) return event.banner_image;
        if (event.gallery_images && event.gallery_images.length > 0) return event.gallery_images[0];
        return null;
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
            className="w-72 sm:w-80 flex-shrink-0"
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl border shadow-sm bg-white h-full transition-all duration-300 hover:shadow-md ${
                isExpired ? "border-gray-200 opacity-70 grayscale-[30%]" : "border-gray-100"
            }`}>
                {/* Event Image */}
                <div className={`relative h-40 sm:h-48 overflow-hidden ${!eventImage ? 'bg-gradient-to-br from-slate-700 to-slate-900' : ''}`}>
                    {eventImage ? (
                        <img
                            src={eventImage}
                            alt={event.title}
                            className={`w-full h-full object-cover ${isExpired ? "brightness-75" : ""}`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="px-2 sm:px-3 py-1 bg-[#00142E] text-white text-xs font-bold rounded-full shadow-lg">
                            {event.type || "Event"}
                        </span>
                        {isExpired && (
                            <span className="px-2 sm:px-3 py-1 bg-gray-800/90 backdrop-blur-sm text-gray-200 text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Event Ended
                            </span>
                        )}
                        {isLive && (
                            <span className="px-2 sm:px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                Happening Now
                            </span>
                        )}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                        <WishlistButton
                            itemId={event.id || event._id}
                            itemType="event"
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30"
                            iconSize={16}
                            outlineColor="text-white"
                        />

                    </div>
                    {event.price && (
                        <div className="absolute bottom-3 left-3">
                            <span className="px-2 sm:px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 font-bold rounded-lg shadow-lg text-sm">
                                {currencySymbol}{event.price}
                            </span>
                        </div>
                    )}
                </div>

                {/* Event Content */}
                <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">
                            {event.city ? `${event.city}, ${event.country || ""}` : event.location || "Location TBA"}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{event.description}</p>

                    {/* Event Stats */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4 border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                                {formatDate(event.date || event.start_date)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                                {event.attendees_count || 0} attending
                            </span>
                        </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <HostPhoto host={event.host} />
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Organizer</p>
                            <p className="text-sm font-medium text-gray-900 break-words">{getOrganizerName()}</p>
                        </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isExpired ? (
                            <Button
                                onClick={() => onViewDetails(event.id)}
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-500 rounded-lg h-9 text-xs font-medium transition-all duration-200"
                            >
                                <Clock className="h-3 w-3 mr-1.5" />
                                View Recap
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onViewDetails(event.id)}
                                className="flex-1 bg-[#C93A30] hover:bg-[#b02e25] text-white rounded-lg h-9 text-xs font-medium transition-all duration-200"
                            >
                                View Details
                            </Button>
                        )}
                        <Button variant="outline" className="w-9 h-9 p-0 border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg shrink-0">
                            <Share2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
})
HorizontalEventCard.displayName = "HorizontalEventCard"