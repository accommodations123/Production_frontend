import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicTripsQuery } from "@/store/api/authApi";
import { useCountry } from "@/context/CountryContext";
import { Loader2, ExternalLink, MapPin, Calendar, MessageCircle, ShieldCheck, User } from 'lucide-react';
import { SectionHeader } from '../home/featured/SectionHeader';
import { resolveImageUrl } from '@/lib/imageUtils';

const CommunityCard = ({ match, onConnect }) => {
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);

    return (
        <div className="group block h-full select-none focus:outline-none">
            <div className="bg-white rounded-[1.5rem] border border-[#E5E7EB] hover:border-[#CB2A25]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden relative">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                    {match.image ? (
                        <img
                            src={match.image}
                            alt={match.name}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIsImageLoaded(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <User className="w-16 h-16 text-gray-400" />
                        </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <div className="bg-blue-500/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-blue-400/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">Verified Traveler</span>
                        </div>
                    </div>

                    {/* Host/Traveler Profile Image overlay style from PropertyCard */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="w-10 h-10 rounded-full p-0.5 bg-white shadow-lg flex items-center justify-center">
                            {match.image ? (
                                <img
                                    src={match.image}
                                    alt="Traveler"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow flex flex-col gap-4">
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 text-[#00142E] group-hover:text-[#CB2A25] transition-colors">
                            {match.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[#00142E]/60 text-sm font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{match.location || match.country}</span>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="bg-[#F8F9FA] p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CB2A25]" />
                            <span className="font-bold text-sm text-[#00142E] line-clamp-1">{match.tripTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#00142E]/60 ml-3.5">
                            <Calendar className="w-3 h-3" />
                            <span>{match.date}</span>
                        </div>
                    </div>

                    <p className="text-sm text-[#00142E]/70 italic line-clamp-2 leading-relaxed mt-1">
                        "Looking forward to this trip! Connect with me if you're traveling the same way."
                    </p>

                    {/* Action Button */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={() => onConnect(match)}
                            className="w-full py-2.5 bg-[#00142E] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#CB2A25] transition-all shadow-md active:scale-95 text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Connect Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TravelCommunity = ({ onConnect }) => {
    const { activeCountry } = useCountry();
    // Helper to ensure backend gets the full name it likely expects for USA
    const getBackendCountryName = (c) => {
        if (!c) return c;
        const lower = c.toLowerCase().trim();
        if (lower === "united states" || lower === "usa" || lower === "us") {
            return "United States of America";
        }
        return c;
    };

    const { data, isLoading } = useGetPublicTripsQuery({
        page: 1,
        limit: 20,
        country: getBackendCountryName(activeCountry?.name)
    });

    const communityMatches = data?.results?.map(trip => {
        // Map trip data handling both flat DB structure and nested flight object
        const fromCountry = trip.from_country || trip.fromCountry || trip.flight?.fromCountry || trip.host?.country || "India";
        const fromCity = trip.from_city || trip.fromCity || trip.flight?.from || trip.host?.city || "Unknown";
        const toCity = trip.to_city || trip.toCity || trip.destination || trip.flight?.to || "Unknown Dest";
        const tripDate = trip.travel_date || trip.travelDate || trip.date || trip.flight?.departureDate;

        return {
            id: trip.id,
            name: trip.host?.full_name || "Traveler",
            location: fromCity,
            country: fromCountry,
            image: resolveImageUrl(trip.host?.profile_image) || null,
            tripTitle: toCity,
            date: new Date(tripDate).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
            })
        };
    }).filter(match => {
        // Double check country matching if backend doesn't filter strictly enough
        if (!activeCountry?.name) return true;

        const hostCountry = match.country?.toLowerCase().trim();
        const searchCountry = activeCountry.name.toLowerCase().trim();

        // Handle USA/United States variations
        const isUSA = (c) => c === 'usa' || c === 'united states' || c === 'united states of america' || c === 'us';

        // Debugging logs
        // console.log("Filtering:", { hostCountry, searchCountry, match: isUSA(searchCountry) && isUSA(hostCountry) });

        if (isUSA(searchCountry) && isUSA(hostCountry)) return true;

        return hostCountry === searchCountry ||
            match.tripTitle?.toLowerCase().includes(searchCountry);
    }) || [];

    if (isLoading) {
        return (
            <div className="py-8 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
            </div>
        );
    }

    if (communityMatches.length === 0) return null;

    return (
        <section className="py-6 sm:py-8 lg:py-12 relative overflow-hidden bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <SectionHeader
                    title="Travel partner"
                    subtitle={`Connect with fellow travelers and explore ${activeCountry?.name || "the world"} together`}
                    linkText="View All Trips"
                    linkTo="/travel"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {communityMatches.map(match => (
                        <CommunityCard key={match.id} match={match} onConnect={onConnect} />
                    ))}
                </div>
            </div>
        </section>
    );
};
