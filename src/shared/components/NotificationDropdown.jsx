import React, { useState, useEffect } from "react";
import { Bell, Check, X, Trash2, Clock, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/utils";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { getSocket } from "@/shared/utils/socket";
import {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation
} from "@/store/api/hostApi";
import { useDispatch } from "react-redux";
import { useTimeAgo } from "@/shared/hooks/useTimeAgo";
import {
    clearNotifications as clearLocalNotifications,
    markAllAsRead as markAllLocalAsRead,
    markAsRead as markLocalAsRead,
    removeNotification as removeLocalNotification
} from "@/store/slices/notificationSlice";

import { useGetMeQuery } from "@/store/api/authApi";

export function NotificationDropdown({ minimal = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside(() => setIsOpen(false));
    const dispatch = useDispatch();

    // Check auth status to avoid unnecessary notification requests
    const { data: userData, isError } = useGetMeQuery();
    const isAuthenticated = !!userData && !isError;

    // Fetch notifications from API (only if authenticated)
    const { data: notifications = [], isLoading, refetch } = useGetNotificationsQuery(undefined, {
        skip: !isAuthenticated
    });
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Socket Listener for real-time notifications
    useEffect(() => {
        try {
            const socket = getSocket();

            const handleNotification = (payload) => {
                // Refetch notifications to get the latest data
                refetch();
            };

            socket.on("notification", handleNotification);

            return () => {
                socket.off("notification", handleNotification);
            };
        } catch (err) {
            console.error("Socket not ready for notifications:", err);
        }
    }, [refetch]);

    const handleMarkAsRead = async (id) => {
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

    const handleDeleteNotification = async (id) => {
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

    const NotificationItem = ({ notif, onRead, onDelete }) => {
        const timeAgo = useTimeAgo(notif.createdAt);

        return (
            <div
                className={cn(
                    "relative group p-3.5 rounded-xl transition-all duration-200 border-l-3 flex gap-3.5 hover:shadow-xs",
                    notif.is_read
                        ? "bg-white border-transparent text-slate-600"
                        : "bg-blue-50/40 border-[#CB2A26] text-[#00162D]"
                )}
            >
                {/* Dot Status Indicator */}
                {!notif.is_read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#CB2A26] animate-pulse" />
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className={cn("text-xs tracking-tight truncate", notif.is_read ? "font-semibold text-slate-700" : "font-black text-[#00162D]")}>
                            {notif.title}
                        </p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-2 font-semibold">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{timeAgo}</span>
                    </div>
                </div>

                {/* Inline Hover Action Controls */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 self-start pt-0.5">
                    {!notif.is_read && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRead(notif.id);
                            }}
                            className="p-1 hover:bg-slate-100/80 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Mark as read"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notif.id);
                        }}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-[#CB2A26] rounded-lg transition-colors cursor-pointer"
                        title="Delete notification"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-slate-750 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            >
                <Bell className="w-5.5 h-5.5 stroke-[2.2]" />

                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#CB2A26] opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#CB2A26] border border-white" />
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden z-50 py-1.5"
                    >
                        {/* Header block with sand tinted accent */}
                        <div className="px-4.5 py-3 border-b border-slate-100 bg-[#FCFAF6]/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-black text-[#00162D] uppercase tracking-wider">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-[#CB2A26] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2.5">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-[10px] font-bold text-slate-500 hover:text-[#CB2A26] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <CheckSquare className="w-3 h-3" />
                                        Mark read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="text-[10px] font-bold text-slate-500 hover:text-[#CB2A26] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Delete all notifications"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications list workspace */}
                        <div
                            className="max-h-[50vh] overflow-y-auto p-2 space-y-1.5"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {isLoading ? (
                                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-[#CB2A26] rounded-full animate-spin mx-auto mb-2.5" />
                                    Updating inbox...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                                    <Bell className="w-8 h-8 opacity-15 text-[#00162D] animate-bounce" />
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-[#00162D]">Your inbox is clear</p>
                                        <p className="text-[10px] text-slate-400">relocation updates will show up here</p>
                                    </div>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notif={notif}
                                        onRead={handleMarkAsRead}
                                        onDelete={handleDeleteNotification}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
