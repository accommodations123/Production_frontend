import React, { useState, useMemo, useEffect } from 'react';
import { 
    Bell, Check, Trash2, Search, Filter, Home, Calendar, 
    ShoppingBag, ShieldCheck, MessageSquare, Briefcase, Mail, 
    Sparkles, ExternalLink, CheckCheck, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation
} from '@/hooks/data/useNotificationHooks';
import { 
    markAsRead as markLocalAsRead,
    markAllAsRead as markAllLocalAsRead,
    removeNotification as removeLocalNotification,
    clearNotifications as clearLocalNotifications
} from '@/store/slices/notificationSlice';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { realtimeNotificationManager } from '@/lib/notifications/realtimeService';
import { useGetMeQuery } from '@/hooks/data/useAuthHooks';

export function NotificationCenter() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: userData } = useGetMeQuery();
    const userId = userData?.id || userData?._id || userData?.user?.id;

    const { data: notifications = [], isLoading, isFetching, refetch } = useGetNotificationsQuery(userId ? { userId } : undefined);
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

    // Subscribe to realtime updates
    useEffect(() => {
        const handleNewNotification = () => {
            refetch();
        };
        window.addEventListener('nxt:new_notification', handleNewNotification);

        let unsubscribe = () => {};
        if (userId) {
            unsubscribe = realtimeNotificationManager.subscribe(userId, handleNewNotification);
        }

        return () => {
            window.removeEventListener('nxt:new_notification', handleNewNotification);
            unsubscribe();
        };
    }, [refetch, userId]);

    const notificationList = useMemo(() => {
        if (Array.isArray(notifications)) return notifications;
        if (Array.isArray(notifications?.notifications)) return notifications.notifications;
        if (Array.isArray(notifications?.data)) return notifications.data;
        return [];
    }, [notifications]);

    const unreadCount = useMemo(() => {
        return notificationList.filter(n => !n.is_read && !n.read).length;
    }, [notificationList]);

    // Filter categories
    const categories = [
        { id: 'all', label: 'All', count: notificationList.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
        { id: 'approvals', label: 'Approvals', count: notificationList.filter(n => n.type?.includes('APPROVED') || n.type?.includes('REJECTED')).length },
        { id: 'connections', label: 'Connections', count: notificationList.filter(n => n.type?.includes('CONNECTION')).length },
        { id: 'system', label: 'System & Inquiries', count: notificationList.filter(n => n.type === NOTIFICATION_TYPES.SYSTEM_NOTIFICATION || n.type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || n.type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED).length }
    ];

    // Filtered list
    const filteredNotifications = useMemo(() => {
        return notificationList.filter(notif => {
            // Category filter
            if (activeCategory === 'unread' && (notif.is_read || notif.read)) return false;
            if (activeCategory === 'approvals' && !notif.type?.includes('APPROVED') && !notif.type?.includes('REJECTED')) return false;
            if (activeCategory === 'connections' && !notif.type?.includes('CONNECTION')) return false;
            if (activeCategory === 'system' && notif.type !== NOTIFICATION_TYPES.SYSTEM_NOTIFICATION && notif.type !== NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED && notif.type !== NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED) return false;

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = (notif.title || '').toLowerCase().includes(query);
                const messageMatch = (notif.message || '').toLowerCase().includes(query);
                if (!titleMatch && !messageMatch) return false;
            }

            return true;
        });
    }, [notificationList, activeCategory, searchQuery]);

    const handleItemClick = async (notif) => {
        const notifId = notif.id;
        const targetUrl = notif.action_url || notif.link || '/account-v2';

        if (!notif.is_read && !notif.read) {
            try {
                await markAsRead(notifId).unwrap();
                dispatch(markLocalAsRead(notifId));
            } catch (err) {
                console.warn('Mark read error:', err);
            }
        }
        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    const handleMarkOneRead = async (e, id) => {
        e.stopPropagation();
        try {
            await markAsRead(id).unwrap();
            dispatch(markLocalAsRead(id));
        } catch (err) {
            console.error('Failed to mark notification read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
            dispatch(markAllLocalAsRead());
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const handleDeleteOne = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id).unwrap();
            dispatch(removeLocalNotification(id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications().unwrap();
            dispatch(clearLocalNotifications());
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.PROPERTY_SUBMITTED:
            case NOTIFICATION_TYPES.PROPERTY_APPROVED:
            case NOTIFICATION_TYPES.PROPERTY_REJECTED:
                return <Home className="w-4 h-4 text-sky-600" />;
            case NOTIFICATION_TYPES.EVENT_SUBMITTED:
            case NOTIFICATION_TYPES.EVENT_APPROVED:
            case NOTIFICATION_TYPES.EVENT_REJECTED:
                return <Calendar className="w-4 h-4 text-emerald-600" />;
            case NOTIFICATION_TYPES.BUY_SELL_SUBMITTED:
            case NOTIFICATION_TYPES.BUY_SELL_APPROVED:
            case NOTIFICATION_TYPES.BUY_SELL_REJECTED:
                return <ShoppingBag className="w-4 h-4 text-amber-600" />;
            case NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED:
            case NOTIFICATION_TYPES.HOST_APPROVED:
            case NOTIFICATION_TYPES.HOST_REJECTED:
                return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
            case NOTIFICATION_TYPES.CONNECTION_REQUEST_RECEIVED:
            case NOTIFICATION_TYPES.CONNECTION_REQUEST_ACCEPTED:
                return <MessageSquare className="w-4 h-4 text-purple-600" />;
            case NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED:
                return <Briefcase className="w-4 h-4 text-blue-600" />;
            case NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED:
                return <Mail className="w-4 h-4 text-teal-600" />;
            default:
                return <Sparkles className="w-4 h-4 text-sky-500" />;
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Notification Center</h2>
                            <p className="text-xs text-gray-500">Stay updated on your listings, events, connections, and approvals.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl border border-gray-200/80 transition-all"
                        title="Refresh Notifications"
                    >
                        <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin text-blue-600")} />
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/60 transition-all cursor-pointer"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all as read
                        </button>
                    )}

                    {notificationList.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200/60 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Category Tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notifications..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                                activeCategory === cat.id
                                    ? "bg-[#0A1A2F] text-white shadow-sm"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                            )}
                        >
                            {cat.label}
                            {cat.count > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
                                    activeCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-200/70 text-gray-700"
                                )}>
                                    {cat.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification Items List */}
            <div className="space-y-2.5">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-xs">
                        <div className="w-7 h-7 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                        Loading your notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-sm font-bold text-gray-700">You're all caught up!</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {searchQuery ? "No notifications matched your search query." : "There are no notifications in this view."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <NotificationCard
                            key={notif.id}
                            notif={notif}
                            onItemClick={handleItemClick}
                            onMarkRead={handleMarkOneRead}
                            onDelete={handleDeleteOne}
                            getTypeIcon={getTypeIcon}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function NotificationCard({ notif, onItemClick, onMarkRead, onDelete, getTypeIcon }) {
    const timeAgo = useTimeAgo(notif.created_at || notif.createdAt);
    const isRead = notif.is_read || notif.read;

    return (
        <div
            onClick={() => onItemClick(notif)}
            className={cn(
                "group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4",
                isRead
                    ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    : "bg-blue-50/40 border-blue-100 hover:bg-blue-50/70 hover:border-blue-200 shadow-sm"
            )}
        >
            <div className={cn(
                "p-2.5 rounded-2xl shrink-0 mt-0.5 border flex items-center justify-center",
                isRead ? "bg-gray-50 border-gray-100" : "bg-white border-blue-100 shadow-xs"
            )}>
                {getTypeIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h4 className={cn("text-sm font-bold tracking-tight", isRead ? "text-gray-800" : "text-gray-900")}>
                            {notif.title}
                        </h4>
                        {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{timeAgo}</span>
                </div>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {notif.message}
                </p>

                {notif.action_url && (
                    <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                        View item <ExternalLink className="w-3 h-3" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isRead && (
                    <button
                        onClick={(e) => onMarkRead(e, notif.id)}
                        className="p-1.5 hover:bg-blue-100/60 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={(e) => onDelete(e, notif.id)}
                    className="p-1.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete notification"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
