import React from 'react';
import { Users, MapPin, BadgeCheck, Flame } from 'lucide-react';

/**
 * CommunityGroupCardV2 - A premium, reusable card for groups.
 * 
 * @param {Object} props
 * @param {Object} props.group - Group data object
 * @param {string} props.group.name - Name of the group
 * @param {string} props.group.image - URL for the group image
 * @param {string} props.group.location - Location or topic tag
 * @param {number} props.group.memberCount - Number of members
 * @param {boolean} props.group.isVerified - Whether the group is verified
 * @param {boolean} props.group.isActive - Whether the group is active (trending)
 * @param {string} props.group.type - Type label for the group
 * @param {Function} props.onJoin - Callback for the "Join Group" button
 */
const CommunityGroupCardV2 = ({ group, onJoin }) => {
    const {
        name,
        image,
        location,
        memberCount,
        isVerified,
        isActive,
        type
    } = group;

    return (
        <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Group Image */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <Users size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Type Badge */}
                {type && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                        {type}
                    </div>
                )}

                {/* Active Indicator */}
                {isActive && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame size={12} fill="currentColor" />
                        Active
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {name}
                    </h3>
                    {isVerified && (
                        <BadgeCheck size={18} className="text-blue-500 flex-shrink-0 ml-2" />
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                    <MapPin size={12} />
                    <span className="truncate">{location}</span>
                </div>

                {/* Footer info & CTA */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-medium">Members</span>
                        <span className="text-sm font-bold text-gray-700">
                            {memberCount.toLocaleString()}+
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onJoin && onJoin();
                        }}
                        className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-gray-200"
                    >
                        Join Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityGroupCardV2;
