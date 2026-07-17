import React, { useState, useEffect } from "react";
import { Bell, Check, X, Trash2 } from "lucide-react";
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
                    "relative group p-3 rounded-xl transition-all border border-transparent hover:border-white/5",
notif.is_read
    ? "bg-white text-gray-500"
    : "bg-blue-50 text-gray-900"                )}
            >
                <div className="flex gap-3">
                    <div
                        className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0"
                        style={{ opacity: notif.is_read ? 0 : 1 }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{notif.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                            {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5">
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
  className="relative p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
>
  <Bell className="w-6 h-6 stroke-[2]" />

  {unreadCount > 0 && (
    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 border border-white" />
    </span>
  )}
</button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                       className="
absolute
top-full
right-0
mt-3
w-80
sm:w-96
rounded-2xl
bg-white
border
border-gray-200
shadow-xl
overflow-hidden
z-50
"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray/200 bg-gray/50 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
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
                                <div className="py-8 text-center text-gray-400 text-sm">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">
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
