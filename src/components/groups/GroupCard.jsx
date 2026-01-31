"use client"

import { Button } from "@/components/ui/button"
import { Users, ArrowRight, Flame, MapPin, Hash, Calendar, MessageCircle, Home, Briefcase, Heart, UserCheck } from "lucide-react"

// Icon mapping for purpose-based communities to prevent rendering errors
const iconMap = {
    home: Home,
    work: Briefcase,
    social: Users,
    health: Heart,
    default: Hash
};

// This component now expects: type, data, onJoin, onLeave, isJoining, onCardClick
export function GroupCard({ type, data, onJoin, onLeave, isJoining, onCardClick }) {
    if (!data) {
        return null;
    }

    const isJoined = data.isJoined || data.is_member || data.isMember || false;

    // This function prevents the card click from firing when the button is clicked
    const handleButtonClick = (e) => {
        e.stopPropagation();
        // Redirect to details page instead of joining
        onCardClick();
    };

    // This function handles clicks on the card area (but not the button)
    const handleCardClick = () => {
        onCardClick();
    };

    // --- COUNTRY CARD ---
    if (type === "country") {
        return (
            <div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 min-w-[280px] flex flex-col items-center text-center group cursor-pointer transform hover:-translate-y-1"
                onClick={handleCardClick}
            >
                {data.avatar_image ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                        <img
                            src={data.avatar_image}
                            alt={data.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                        />
                    </div>
                ) : (
                    <div className="text-7xl mb-4 transform group-hover:scale-125 transition-all duration-500">
                        {data.flag || '🌍'}
                    </div>
                )}
                <h3 className="font-bold text-[#07182A] text-xl mb-2">
                    {data.name || data.title}
                </h3>
                {data.members_count && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <Users className="h-4 w-4" />
                        <span>{data.members_count} members</span>
                    </div>
                )}
                <Button
                    className={`w-full bg-[#C93A30] hover:bg-[#B82E28] text-white rounded-full font-semibold text-sm py-3 px-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}
                    onClick={handleButtonClick}
                >
                    View Details
                </Button>
            </div>
        )
    }

    // --- CITY CARD ---
    if (type === "city") {
        return (
            <div
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
                onClick={handleCardClick}
            >
                {data.avatar_image || data.cover_image ? (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={data.avatar_image || data.cover_image}
                            alt={data.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        {data.members_count && (
                            <div className="absolute bottom-4 left-4 text-white">
                                <div className="flex items-center gap-1 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit mb-2">
                                    <Users className="h-3 w-3" />
                                    {data.members_count}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-48 bg-gray-200"></div>
                )}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#07182A] text-xl mb-2">
                        {data.name || data.title}
                    </h3>
                    {data.city && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>{data.city}, {data.country}</span>
                        </div>
                    )}
                    {data.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                            {data.description}
                        </p>
                    )}
                    <Button
                        variant="outline"
                        className={`w-full border-[#C93A30] text-[#C93A30] hover:bg-[#C93A30] hover:text-white rounded-full font-semibold text-sm py-3 px-6 transition-all duration-300 hover:scale-105`}
                        onClick={handleButtonClick}
                    >
                        View Details
                    </Button>
                </div>
            </div>
        )
    }

    // --- PURPOSE CARD ---
    if (type === "purpose") {
        // Get the icon component based on the icon name from data
        const IconComponent = iconMap[data.icon] || iconMap.default;

        return (
            <div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-[#C93A30]/30 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-start gap-4 transform hover:translate-x-2"
                onClick={handleCardClick}
            >
                <div className="p-4 bg-gradient-to-br from-[#F1E7D6] to-[#E8D5C4] rounded-xl text-[#07182A] shadow-sm hover:shadow-md transition-all duration-300">
                    <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-[#07182A] text-lg mb-1">
                        {data.name || data.title}
                    </h3>
                    {data.topics && data.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {data.topics.slice(0, 3).map((topic, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    )}
                    {data.description && (
                        <p className="text-sm text-gray-600 mb-3">
                            {data.description}
                        </p>
                    )}
                    {data.members_count && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#C93A30]">
                                {data.members_count} members
                            </span>
                            <div className="w-1 h-1 bg-[#C93A30] rounded-full"></div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`mt-2 text-[#C93A30] hover:bg-transparent hover:underline p-0 h-auto font-normal`}
                        onClick={handleButtonClick}
                    >
                        View Details
                    </Button>
                </div>
            </div>
        )
    }

    // --- TRENDING CARD ---
    if (type === "trending") {
        return (
            <div
                className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={handleCardClick}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#07182A] via-[#07182A]/60 to-transparent opacity-90"></div>
                {data.avatar_image || data.cover_image ? (
                    <img
                        src={data.avatar_image || data.cover_image}
                        alt={data.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#07182A] to-[#C93A30]"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    {data.posts_count && (
                        <div className="flex items-center gap-2 text-[#C93A30] font-bold text-sm mb-2">
                            <Flame className="h-4 w-4 fill-current" />
                            <span>Trending • {data.posts_count} active posts</span>
                        </div>
                    )}
                    <h3 className="text-white font-bold text-2xl mb-4">
                        {data.name || data.title}
                    </h3>
                    <Button
                        size="lg"
                        className={`bg-white text-[#07182A] hover:bg-gray-100 rounded-full font-semibold shadow-md hover:shadow-lg w-full transition-all duration-300 hover:scale-105`}
                        onClick={handleButtonClick}
                    >
                        View Details
                    </Button>
                </div>
            </div>
        )
    }

    // --- RECOMMENDED CARD ---
    if (type === "recommended") {
        return (
            <div
                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex items-center justify-between gap-4 hover:shadow-xl transition-all duration-300 transform hover:translate-x-2"
                onClick={handleCardClick}
            >
                <div className="flex-1">
                    <p className="text-xs font-bold text-[#C93A30] uppercase tracking-wider mb-1">
                        {data.topics && data.topics.length > 0 ? data.topics[0] : "Community"}
                    </p>
                    <h3 className="font-bold text-[#07182A] text-lg">
                        {data.name || data.title}
                    </h3>
                    {data.city && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {data.city}
                        </p>
                    )}
                    {data.members_count && (
                        <p className="text-xs text-gray-500 mt-1">
                            {data.members_count} members
                        </p>
                    )}
                </div>
                <Button
                    size="icon"
                    variant={isJoined ? "default" : "ghost"}
                    className={`rounded-full ${isJoined ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'hover:bg-[#F1E7D6] text-[#07182A]'} h-10 w-10 transition-all duration-300 hover:scale-110`}
                    onClick={handleButtonClick}
                    disabled={isJoining}
                >
                    {isJoining ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : isJoined ? (
                        <UserCheck className="h-5 w-5" />
                    ) : (
                        <ArrowRight className="h-5 w-5" />
                    )}
                </Button>
            </div>
        )
    }

    // --- EVENT CARD ---
    if (type === "event") {
        return (
            <div
                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[#07182A] text-lg mb-2">
                            {data.name || data.title}
                        </h3>
                        {data.description && (
                            <p className="text-sm text-gray-600 mb-3">
                                {data.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            {data.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{data.location}</span>
                                </div>
                            )}
                            {data.date && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{data.date}</span>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`w-full ${isJoined ? 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'} rounded-full`}
                            onClick={handleButtonClick}
                            disabled={isJoining}
                        >
                            {isJoining ? 'Processing...' : isJoined ? 'Attending' : 'Attend Event'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Fallback for any other type
    return null;
}