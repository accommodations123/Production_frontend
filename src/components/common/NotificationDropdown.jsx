import React, { useState, useEffect } from "react";
import { 
    Bell, Check, X, Trash2, Home, Calendar, ShoppingBag, 
    ShieldCheck, MessageSquare, Briefcase, Mail, ExternalLink, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getSocket } from "@/lib/socket";
import { useNavigate } from "react-router-dom";
import {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation
} from "@/hooks/data/useNotificationHooks";
import { useDispatch, useSelector } from "react-redux";
import { useTimeAgo } from "../../hooks/useTimeAgo";
import { 
    clearNotifications as clearLocalNotifications,
    markAllAsRead as markAllLocalAsRead,
    markAsRead as markLocalAsRead,
    removeNotification as removeLocalNotification
} from "@/store/slices/notificationSlice";
import { useGetMeQuery } from "@/hooks/data/useAuthHooks";
import { realtimeNotificationManager } from "@/lib/notifications/realtimeService";
import { NOTIFICATION_TYPES } from "@/shared/constants/notificationTypes";

export function NotificationDropdown({ minimal = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside(() => setIsOpen(false));
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Check auth status from Redux state immediately, fallback to useGetMeQuery
    const authUser = useSelector((state) => state.auth?.user);
    const reduxUser = authUser?.user !== undefined ? authUser.user : authUser;
    const { data: userData, isError } = useGetMeQuery(undefined, {
        skip: !!reduxUser?.id
    });
    const activeUser = reduxUser || userData;
    const isAuthenticated = Boolean(activeUser && (activeUser.id || activeUser.email)) && !isError;
    const userId = activeUser?.id || activeUser?._id || activeUser?.user?.id;

    // Fetch notifications from API
    const { data: notifications = [], isLoading, refetch } = useGetNotificationsQuery(userId ? { userId } : undefined, {
        skip: !isAuthenticated
    });
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

    // Safely derive notifications array
    const notificationList = Array.isArray(notifications)
        ? notifications
        : (Array.isArray(notifications?.notifications) ? notifications.notifications : (Array.isArray(notifications?.data) ? notifications.data : []));

    // Calculate real unread count
    const unreadCount = notificationList.filter(n => !n.is_read && !n.read).length;

    // Supabase Realtime, DOM Custom Events & Socket Listener
    useEffect(() => {
        const handleNewNotification = () => {
            refetch();
        };

        window.addEventListener("nxt:new_notification", handleNewNotification);

        // Supabase Realtime channel subscription with reconnect reconciliation
        let unsubscribeRealtime = () => {};
        if (userId) {
            unsubscribeRealtime = realtimeNotificationManager.subscribe(userId, handleNewNotification, handleNewNotification);
        }

        try {
            const socket = getSocket();
            if (socket) {
                socket.on("notification", handleNewNotification);
            }
        } catch (err) {
            console.warn("Socket notification listener note:", err);
        }

        return () => {
            window.removeEventListener("nxt:new_notification", handleNewNotification);
            unsubscribeRealtime();
            try {
                const socket = getSocket();
                if (socket) socket.off("notification", handleNewNotification);
            } catch {}
        };
    }, [refetch, userId]);

    const handleItemClick = async (notif) => {
        const notifId = notif.id;
        const targetUrl = notif.action_url || notif.link || '/account-v2';

        if (!notif.is_read && !notif.read) {
            try {
                await markAsRead(notifId).unwrap();
                dispatch(markLocalAsRead(notifId));
            } catch (err) {
                console.warn("Could not mark read on click:", err);
            }
        }
        setIsOpen(false);
        navigate(targetUrl);
    };

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        try {
            await markAsRead(id).unwrap();
            dispatch(markLocalAsRead(id));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await markAllAsRead().unwrap();
            dispatch(markAllLocalAsRead());
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id).unwrap();
            dispatch(removeLocalNotification(id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications().unwrap();
            dispatch(clearLocalNotifications());
        } catch (err) {
            console.error("Failed to delete all notifications:", err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.PROPERTY_SUBMITTED:
            case NOTIFICATION_TYPES.PROPERTY_APPROVED:
            case NOTIFICATION_TYPES.PROPERTY_REJECTED:
                return <Home className="w-3.5 h-3.5 text-sky-400" />;
            case NOTIFICATION_TYPES.EVENT_SUBMITTED:
            case NOTIFICATION_TYPES.EVENT_APPROVED:
            case NOTIFICATION_TYPES.EVENT_REJECTED:
                return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
            case NOTIFICATION_TYPES.BUY_SELL_SUBMITTED:
            case NOTIFICATION_TYPES.BUY_SELL_APPROVED:
            case NOTIFICATION_TYPES.BUY_SELL_REJECTED:
                return <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />;
            case NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED:
            case NOTIFICATION_TYPES.HOST_APPROVED:
            case NOTIFICATION_TYPES.HOST_REJECTED:
                return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
            case NOTIFICATION_TYPES.CONNECTION_REQUEST_RECEIVED:
            case NOTIFICATION_TYPES.CONNECTION_REQUEST_ACCEPTED:
                return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
            case NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED:
                return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
            case NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED:
                return <Mail className="w-3.5 h-3.5 text-teal-400" />;
            default:
                return <Sparkles className="w-3.5 h-3.5 text-blue-300" />;
        }
    };

    const NotificationItem = ({ notif }) => {
        const timeAgo = useTimeAgo(notif.created_at || notif.createdAt);
        const isRead = notif.is_read || notif.read;

        return (
            <div
                onClick={() => handleItemClick(notif)}
                className={cn(
                    "relative group p-3 rounded-xl transition-all border cursor-pointer",
                    isRead 
                        ? "bg-transparent border-transparent hover:bg-white/5 text-white/60" 
                        : "bg-white/[0.07] border-white/10 hover:bg-white/10 text-white shadow-sm"
                )}
            >
                <div className="flex gap-3 items-start">
                    <div className="mt-0.5 p-2 rounded-xl bg-white/10 shrink-0 border border-white/5 flex items-center justify-center">
                        {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate text-white">{notif.title}</p>
                            {!isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 animate-pulse" />
                            )}
                        </div>
                        <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1.5 font-medium">
                            {timeAgo}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {!isRead && (
                            <button
                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-sky-400"
                                title="Mark as read"
                                aria-label="Mark as read"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={(e) => handleDeleteNotification(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all text-white/60 hover:text-red-400"
                            title="Delete notification"
                            aria-label="Delete notification"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full ring-2 ring-[#0A1A2F] animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-[#0F2238]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] z-50 border border-white/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-white/60 hover:text-white transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notificationList.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="text-xs text-white/50 hover:text-red-400 transition-colors flex items-center gap-1"
                                        title="Delete all notifications"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div
                            className="max-h-[60vh] overflow-y-auto p-2 space-y-1"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {isLoading ? (
                                <div className="py-8 text-center text-white/40 text-sm">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-sky-400 rounded-full animate-spin mx-auto mb-2" />
                                    Loading notifications...
                                </div>
                            ) : notificationList.length === 0 ? (
                                <div className="py-8 text-center text-white/40 text-sm">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No new notifications
                                </div>
                            ) : (
                                notificationList.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notif={notif}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notificationList.length > 0 && (
                            <div className="p-2 border-t border-white/5 bg-white/[0.02] text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/account-v2?tab=notifications');
                                    }}
                                    className="w-full py-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors flex items-center justify-center gap-1.5"
                                >
                                    View Notification Center
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
