import React, { useState, useEffect } from "react";
import { Bell, Check, X, Trash2 } from "lucide-react";
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
    useDeleteAllNotificationsMutation,
    hostApi
} from "@/store/api/hostApi";
import { useDispatch } from "react-redux";
import { useTimeAgo } from "../../hooks/useTimeAgo";

import { useGetMeQuery } from "@/store/api/authApi";

export function NotificationDropdown({ minimal = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside(() => setIsOpen(false));
    const navigate = useNavigate();
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
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await deleteNotification(id).unwrap();
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications().unwrap();
        } catch (err) {
            console.error("Failed to delete all notifications:", err);
        }
    };

    const NotificationItem = ({ notif, onRead, onDelete }) => {
        const timeAgo = useTimeAgo(notif.createdAt);

        return (
            <div
                className={cn(
                    "relative group p-3 rounded-xl transition-all border border-transparent hover:border-white/5",
                    notif.is_read ? "bg-transparent text-white/60" : "bg-white/5 text-white"
                )}
            >
                <div className="flex gap-3">
                    <div
                        className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0"
                        style={{ opacity: notif.is_read ? 0 : 1 }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{notif.title}</p>
                        <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
                            {notif.message}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1.5">
                            {timeAgo}
                        </p>
                    </div>

                    <div className="flex items-start gap-1">
                        {!notif.is_read && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRead(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-accent"
                                title="Mark as read"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notif.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-full transition-all text-white/60 hover:text-red-400"
                            title="Delete notification"
                        >
                            <X className="w-3 h-3" />
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
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0A1A2F] animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-[#0F2238]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] z-50 border border-white/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-white/50 hover:text-white transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
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
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-white/40 text-sm">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No new notifications
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
