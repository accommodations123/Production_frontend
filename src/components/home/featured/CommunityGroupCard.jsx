import React from 'react';
import { MapPin, Calendar, Users as UsersIcon } from 'lucide-react';
import { CardContainer } from './PropertyCard.jsx';
import WishlistButton from '@/components/ui/WishlistButton';

const HostPhoto = ({ host }) => {
    const photoUrl =
        host?.avatar_image ||
        host?.selfie_photo ||
        host?.photo ||
        host?.image ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop";

    return (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
                src={photoUrl}
                alt="Creator"
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
};

export const CommunityGroupCard = ({ group, onJoin, isJoining }) => {
    const groupId = group.id || group._id;
    const groupName = group.name || group.title || "";
    const groupImage = group.avatar_image || group.cover_image || group.image || "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=400&h=200&fit=crop";
    const groupLocation = group.city ? `${group.city}, ${group.country || ""}` : group.location || "";
    const membersCount = group.members_count || 0;
    const upcomingEvents = group.upcoming_events_count || 0;
    const category = group.category || group.type || "Community";
    const creator = group.creator || group.host || group.admin || group.Creator || group.Host || group.Admin;
    const isJoined = !!(group.isJoined || group.is_member || group.isMember || group.member_role || group.is_joined || group.joined);

    return (
        <CardContainer linkTo={`/groups/${groupId}`}>
            {/* Group Image */}
            <div className="relative h-36 sm:h-40 md:h-44 overflow-hidden rounded-t-xl">
                <img
                    src={groupImage}
                    alt={groupName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                {/* Category - Bottom Left */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-white/90 text-gray-800 text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm">
                        {category}
                    </span>
                </div>

                {/* Members Count - Top Left */}
                <div className="absolute top-3 left-3 bg-white/90 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 shadow-sm h-7 sm:h-8">
                    <UsersIcon className="w-3 h-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-800">
                        {membersCount.toLocaleString()}
                    </span>
                </div>

                {/* Wishlist Button - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                    <WishlistButton
                        itemId={groupId}
                        itemType="community"
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-sm"
                        iconSize={16}
                        outlineColor="text-gray-400"
                        filledColor="fill-red-500 text-red-500"
                    />
                </div>
            </div>

            {/* Group Info */}
            <div className="p-4 sm:p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                    {groupName}
                </h3>

                {/* Creator Info */}
                {(creator?.full_name || creator?.name || creator?.User?.full_name) && (
                    <div className="flex items-center gap-2 mb-3">
                        <HostPhoto host={creator} />
                        <p className="text-xs text-gray-500 truncate">
                            Created by <span className="font-medium text-gray-700">{creator.full_name || creator.name || creator.User?.full_name}</span>
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-1 text-gray-600 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{groupLocation}</span>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{upcomingEvents} community events</span>
                    </div>
                    <button
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all w-full sm:w-auto bg-accent text-white hover:bg-[#B0241F] border border-transparent"
                        onClick={(e) => {
                            // Let the parent Link handle navigation
                        }}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </CardContainer>
    );
};