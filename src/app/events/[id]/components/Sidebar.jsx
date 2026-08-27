import React, { useState, useEffect, useMemo, memo } from "react"
import { Users, Check, Star, MessageCircle, UserPlus, MapPin, Video, Monitor, Clock, Mail, Phone, ExternalLink } from "lucide-react"
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "../hooks/useAuth"
import { getSocialUrl } from "@/shared/utils/socialUtils"
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from "@/store/api/connectionApi"

export const Sidebar = memo(({ event }) => {
    const { user: currentUser } = useAuth();
    const currentUserId = currentUser?.id || currentUser?.user_id || currentUser?._id;
    const currentUserEmail = (currentUser?.email || "").trim().toLowerCase();
    const currentUserName = (currentUser?.full_name || currentUser?.name || "").trim().toLowerCase();
    const currentUserHostId = currentUser?.host_id || currentUser?.Host?.id || currentUser?.host?.id;

    const host = event?.Host || event?.host || {};
    const hostUserId =
        host?.user_id ||
        event?.host_user_id ||
        host?.id ||
        event?.host_id ||
        event?.user_id ||
        host?.User?.id ||
        host?.User?.user_id;

    const currentItemId = event?.id || event?._id;
    const { data: statusRes } = useGetConnectionStatusQuery(
        { targetUserId: hostUserId, itemId: currentItemId, itemType: "events" },
        {
            skip: (!hostUserId && !currentItemId) || !currentUserId || (hostUserId && String(hostUserId) === String(currentUserId)),
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true
        }
    );
    const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

    const connStatus = statusRes?.status || statusRes?.data?.status || "none";
    const hostEmail = (host?.email || host?.User?.email || "").trim().toLowerCase();
    const rawHostName = host?.full_name || host?.name || "";
    const hostNormalizedName = rawHostName.trim().toLowerCase();

    const isOwner = Boolean(
        currentUser && (
            (currentUserId && (
                String(host?.user_id) === String(currentUserId) ||
                String(event?.host_user_id) === String(currentUserId) ||
                String(event?.user_id) === String(currentUserId) ||
                String(host?.User?.id) === String(currentUserId) ||
                (hostUserId && String(hostUserId) === String(currentUserId))
            )) ||
            (currentUserHostId && (
                String(currentUserHostId) === String(host?.id) ||
                String(currentUserHostId) === String(event?.host_id)
            )) ||
            (currentUserEmail && hostEmail && currentUserEmail === hostEmail) ||
            (currentUserName && hostNormalizedName && (
                currentUserName === hostNormalizedName ||
                currentUserName.replace(/[\s.]+/g, '') === hostNormalizedName.replace(/[\s.]+/g, '')
            ))
        )
    );
    const isUnlocked = isOwner || connStatus === "accepted";

    const [imageError, setImageError] = useState(false)
    const handleImageError = () => setImageError(true)

    const hostName = (isOwner ? (currentUser?.full_name || currentUser?.name || rawHostName) : rawHostName) || "Host";
    const hostPhone = host?.phone || host?.phone_number || host?.whatsapp || (isOwner ? (currentUser?.phone || "") : "");
    const hostWhatsapp = host?.whatsapp || host?.phone || host?.phone_number || (isOwner ? (currentUser?.whatsapp || currentUser?.phone || "") : "");
    const hostInstagram = host?.instagram || (isOwner ? (currentUser?.instagram || "") : "");
    const hostFacebook = host?.facebook || (isOwner ? (currentUser?.facebook || "") : "");
    const displayHostEmail = host?.email || host?.User?.email || (isOwner ? (currentUser?.email || "") : "");
    const isApprovedHost = host?.status === 'approved' || host?.is_verified || host?.is_approved || isOwner;

    const handleConnectHost = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUserId) {
            toast.error("Please sign in to send a connection request.");
            return;
        }
        try {
            await sendReq({
                targetUserId: hostUserId,
                targetName: hostName,
                itemId: event?.id || event?._id,
                itemTitle: event?.title || "Event",
                itemType: "events",
                requesterPhone: currentUser?.phone || "",
                requesterEmail: currentUser?.email || ""
            }).unwrap();
            toast.success(`Connection request sent to ${hostName}!`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to send connection request.");
        }
    };
    const hostPhoto = useMemo(() => {
        if (!host) return null
        return host.selfie_photo || host.profile_photo || host.avatar || host.profile_image || host.photo || host.image || host.profileImage
    }, [host])

    const handleContactHost = () => {
        if (hostWhatsapp) {
            const cleanPhone = hostWhatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else if (displayHostEmail) {
            window.location.href = `mailto:${displayHostEmail}`;
        } else {
            toast.error("Host contact number not available");
        }
    }

    const getMapsUrl = () => {
        return event.googleMapsUrl || null;
    };

    const handleOpenMaps = () => {
        const url = getMapsUrl();
        if (url) {
            window.open(url, '_blank');
        } else {
            toast.error("Event location details not available");
        }
    };

    const handleInviteFriends = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Check out this event: ${event.title}`,
                    url: window.location.href,
                });
            } catch {
                toast.error("Unable to share event link");
            }
            return;
        }

        navigator.clipboard.writeText(window.location.href);
        toast.success("Event link copied to clipboard!");
    };

    return (
        <aside className="space-y-6 md:sticky md:top-24">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:hover:shadow-2xl transition-all duration-300 md:hover:scale-105 border border-gray-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 bg-accent rounded-full overflow-hidden shadow-lg">
                            {hostPhoto && !imageError ? (
                                <img
                                    src={hostPhoto}
                                    alt={hostName}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    onLoad={() => setImageError(false)}
                                />
                            ) : (
                                <div className="w-full h-full bg-accent flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {hostName?.charAt(0)?.toUpperCase() || 'H'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {isApprovedHost && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-lg truncate">{hostName}</p>
                        <p className="text-sm text-gray-500">Event Organizer</p>
                        {isUnlocked ? (
                            <div className="mt-2 space-y-1">
                                {hostPhone && (
                                    <p className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>{hostPhone}</span>
                                    </p>
                                )}
                                {displayHostEmail && (
                                    <p className="text-xs text-slate-700 flex items-center gap-1.5 truncate font-medium">
                                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="truncate">{displayHostEmail}</span>
                                    </p>
                                )}

                                {/* Unlocked Social Media Channels */}
                                <div className="flex items-center gap-2 pt-2">
                                    {hostWhatsapp && (
                                        <a
                                            href={getSocialUrl("whatsapp", hostWhatsapp)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Chat on WhatsApp"
                                            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-emerald-100"
                                        >
                                            <FaWhatsapp className="w-4 h-4" />
                                        </a>
                                    )}
                                    {hostInstagram && (
                                        <a
                                            href={getSocialUrl("instagram", hostInstagram)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Follow on Instagram"
                                            className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-pink-100"
                                        >
                                            <FaInstagram className="w-4 h-4" />
                                        </a>
                                    )}
                                    {hostFacebook && (
                                        <a
                                            href={getSocialUrl("facebook", hostFacebook)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Facebook"
                                            className="w-8 h-8 rounded-xl bg-blue-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all shadow-xs border border-blue-100"
                                        >
                                            <FaFacebookF className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    {displayHostEmail && (
                                        <a
                                            href={`mailto:${displayHostEmail}`}
                                            title="Send Email"
                                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all shadow-xs border border-slate-200"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    )}
                                    {hostPhone && (
                                        <a
                                            href={`tel:${hostPhone}`}
                                            title="Call Phone"
                                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all shadow-xs border border-slate-200"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : connStatus === "pending" ? (
                            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Connection request pending
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 mt-1 italic">Connect to view contacts</p>
                        )}
                    </div>
                </div>

                {isOwner ? (
                    <div className="w-full py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-xs">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>You are Hosting this Event</span>
                    </div>
                ) : isUnlocked ? (
                    <Button
                        onClick={handleContactHost}
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg rounded-2xl cursor-pointer font-bold"
                    >
                        <MessageCircle className="h-4 w-4" />
                        {hostWhatsapp ? "Chat on WhatsApp" : "Contact Host"}
                    </Button>
                ) : connStatus === "pending" ? (
                    <Button
                        disabled
                        className="w-full gap-2 bg-amber-50 border border-amber-200 text-amber-800 transition-all duration-300 rounded-2xl cursor-not-allowed text-xs font-bold shadow-xs"
                    >
                        <Clock className="h-4 w-4 text-amber-600" />
                        Pending Approval
                    </Button>
                ) : (
                    <Button
                        onClick={handleConnectHost}
                        disabled={isSending}
                        className="w-full gap-2 bg-[#CB2A26] text-white hover:bg-[#CB2A26]/90 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-2xl cursor-pointer font-bold"
                    >
                        <UserPlus className="h-4 w-4" />
                        {isSending ? "Sending Request..." : "Connect with Host"}
                    </Button>
                )}
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 md:hover:shadow-2xl transition-all duration-300 md:hover:scale-105 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Who's Going
                </h3>
                {(event?.attendeesCount || 0) > 0 && (
                    <div className="flex -space-x-4 mb-6 justify-center">
                        <div className="w-12 h-12 bg-accent rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold">
                            {event.attendeesCount}
                        </div>
                    </div>
                )}
                <p className="text-sm text-gray-600 mb-6 text-center">{event?.attendeesCount || 0} people attending</p>
                <Button
                    onClick={handleInviteFriends}
                    className="w-full gap-2 bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-2xl"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite Friends
                </Button>
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:hover:shadow-2xl transition-all duration-300 md:hover:scale-105 border border-gray-100">
                <div className={`relative h-48 ${event.event_mode === 'online' ? 'bg-gradient-to-br from-blue-200 to-blue-300' :
                    event.event_mode === 'hybrid' ? 'bg-gradient-to-br from-purple-200 to-purple-300' :
                        'bg-gradient-to-br from-gray-200 to-gray-300'
                    } flex items-center justify-center`}>
                    {event.event_mode === 'online' ? <Video className="h-16 w-16 text-blue-600" /> :
                        event.event_mode === 'hybrid' ? <Monitor className="h-16 w-16 text-purple-600" /> :
                            <MapPin className="h-16 w-16 text-gray-600" />}
                </div>
                <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 capitalize">{event.event_mode} Event</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        {event.event_mode === 'online' ? 'Join from anywhere in the world' :
                            event.event_mode === 'hybrid' ? 'In-person and online options available' :
                                'Held at the venue location'}
                    </p>
                    {event.event_mode === 'online' && event.event_url && (
                        <Button
                            onClick={() => window.open(event.event_url.trim(), '_blank')}
                            className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                        >
                            Join Event
                        </Button>
                    )}
                    {event.event_mode === 'hybrid' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={handleOpenMaps}
                                className="bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                            >
                                In-Person
                            </Button>
                            <Button
                                onClick={() => event.event_url && window.open(event.event_url.trim(), '_blank')}
                                className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                            >
                                Online
                            </Button>
                        </div>
                    )}
                    {event.event_mode === 'offline' && (
                        <Button
                            onClick={handleOpenMaps}
                            className="w-full bg-accent text-white hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-xl rounded-2xl"
                        >
                            Get Directions
                        </Button>
                    )}
                </div>
            </div>
        </aside>
    )
})
Sidebar.displayName = "Sidebar"
