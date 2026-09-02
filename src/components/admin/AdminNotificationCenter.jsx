import React, { useState, useMemo, useEffect } from 'react';
import { 
    Bell, ShieldCheck, Home, Calendar, ShoppingBag, 
    MessageSquare, Briefcase, Mail, CheckCheck, Trash2, 
    Search, ExternalLink, RefreshCw, AlertCircle, Plane 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import {
    useGetAdminNotificationsQuery,
    useMarkAdminNotificationAsReadMutation,
    useMarkAllAdminNotificationsAsReadMutation,
    useDeleteAdminNotificationMutation,
    useDeleteAllAdminNotificationsMutation
} from '@/hooks/data/useNotificationHooks';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { realtimeNotificationManager } from '@/lib/notifications/realtimeService';

export function AdminNotificationCenter() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: adminNotifs = [], isLoading, isFetching, refetch } = useGetAdminNotificationsQuery();
    const [markAdminRead] = useMarkAdminNotificationAsReadMutation();
    const [markAllAdminRead] = useMarkAllAdminNotificationsAsReadMutation();
    const [deleteAdminNotif] = useDeleteAdminNotificationMutation();
    const [deleteAllAdminNotifs] = useDeleteAllAdminNotificationsMutation();

    // Subscribe to realtime admin channel
    useEffect(() => {
        const handleAdminEvent = () => {
            refetch();
        };

        window.addEventListener('nxt:new_admin_notification', handleAdminEvent);
        const unsubscribe = realtimeNotificationManager.subscribe(null, handleAdminEvent);

        return () => {
            window.removeEventListener('nxt:new_admin_notification', handleAdminEvent);
            unsubscribe();
        };
    }, [refetch]);

    const notifList = useMemo(() => {
        if (Array.isArray(adminNotifs)) return adminNotifs;
        if (Array.isArray(adminNotifs?.notifications)) return adminNotifs.notifications;
        if (Array.isArray(adminNotifs?.data)) return adminNotifs.data;
        return [];
    }, [adminNotifs]);

    const unreadCount = useMemo(() => {
        return notifList.filter(n => !n.is_read && !n.read).length;
    }, [notifList]);

    const categories = [
        { id: 'all', label: 'All Alerts', count: notifList.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
        { id: 'property', label: 'Spaces', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.PROPERTY_SUBMITTED || n.entity_type === 'property').length },
        { id: 'event', label: 'Events', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.EVENT_SUBMITTED || n.entity_type === 'event').length },
        { id: 'buysell', label: 'Marketplace', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || n.entity_type === 'buy_sell').length },
        { id: 'host', label: 'Host Verifications', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || n.entity_type === 'host').length },
        { id: 'stay', label: 'Stay Requests', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED || n.entity_type === 'stay_request').length },
        { id: 'contact', label: 'Contact Inquiries', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || n.entity_type === 'contact').length },
        { id: 'career', label: 'Careers', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || n.entity_type === 'job_application').length }
    ];

    const filteredNotifs = useMemo(() => {
        return notifList.filter(n => {
            if (selectedCategory === 'unread' && (n.is_read || n.read)) return false;
            if (selectedCategory === 'property' && n.type !== NOTIFICATION_TYPES.PROPERTY_SUBMITTED && n.entity_type !== 'property') return false;
            if (selectedCategory === 'event' && n.type !== NOTIFICATION_TYPES.EVENT_SUBMITTED && n.entity_type !== 'event') return false;
            if (selectedCategory === 'buysell' && n.type !== NOTIFICATION_TYPES.BUY_SELL_SUBMITTED && n.entity_type !== 'buy_sell') return false;
            if (selectedCategory === 'host' && n.type !== NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED && n.entity_type !== 'host') return false;
            if (selectedCategory === 'stay' && n.type !== NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED && n.entity_type !== 'stay_request') return false;
            if (selectedCategory === 'contact' && n.type !== NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED && n.entity_type !== 'contact') return false;
            if (selectedCategory === 'career' && n.type !== NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED && n.entity_type !== 'job_application') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (n.title || '').toLowerCase().includes(q);
                const msgMatch = (n.message || '').toLowerCase().includes(q);
                const actorMatch = (n.metadata?.senderName || n.metadata?.senderEmail || '').toLowerCase().includes(q);
                if (!titleMatch && !msgMatch && !actorMatch) return false;
            }

            return true;
        });
    }, [notifList, selectedCategory, searchQuery]);

    const handleItemClick = async (notif) => {
        const notifId = notif.id;
        const targetUrl = notif.action_url || notif.link || '/admin';

        if (!notif.is_read && !notif.read) {
            try {
                await markAdminRead(notifId).unwrap();
            } catch (err) {
                console.warn('Mark admin read error:', err);
            }
        }
        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAdminRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all admin notifications read:', err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllAdminNotifs().unwrap();
        } catch (err) {
            console.error('Failed to clear admin notifications:', err);
        }
    };

    const getTypeIcon = (notif) => {
        const type = notif.type;
        const entity = notif.entity_type;

        if (type === NOTIFICATION_TYPES.PROPERTY_SUBMITTED || entity === 'property') {
            return <Home className="w-4 h-4 text-sky-500" />;
        }
        if (type === NOTIFICATION_TYPES.EVENT_SUBMITTED || entity === 'event') {
            return <Calendar className="w-4 h-4 text-emerald-500" />;
        }
        if (type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || entity === 'buy_sell') {
            return <ShoppingBag className="w-4 h-4 text-amber-500" />;
        }
        if (type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || entity === 'host') {
            return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
        }
        if (type === NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED || entity === 'stay_request') {
            return <Home className="w-4 h-4 text-orange-500" />;
        }
        if (type === NOTIFICATION_TYPES.TRIP_SUBMITTED || entity === 'trip') {
            return <Plane className="w-4 h-4 text-indigo-400" />;
        }
        if (type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || entity === 'contact') {
            return <Mail className="w-4 h-4 text-teal-500" />;
        }
        if (type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || entity === 'job_application') {
            return <Briefcase className="w-4 h-4 text-blue-500" />;
        }
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    };

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Notification Center</h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} pending review
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Incoming user submissions requiring moderation & administrative approvals.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all"
                        title="Refresh Admin Queue"
                    >
                        <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin text-indigo-600")} />
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/60 transition-all cursor-pointer"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}

                    {notifList.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200/60 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear queue
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Categories */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search submissions by title, actor, or details..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                                selectedCategory === cat.id
                                    ? "bg-[#0A1A2F] text-white shadow-sm"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                            )}
                        >
                            {cat.label}
                            {cat.count > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
                                    selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                                )}>
                                    {cat.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-xs">
                        <div className="w-7 h-7 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                        Loading admin alerts...
                    </div>
                ) : filteredNotifs.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-sm font-bold text-gray-700">No submissions pending</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            All incoming submissions and moderation alerts have been processed.
                        </p>
                    </div>
                ) : (
                    filteredNotifs.map((notif) => {
                        const timeAgo = useTimeAgo(notif.created_at || notif.createdAt);
                        const isRead = notif.is_read || notif.read;

                        return (
                            <div
                                key={notif.id}
                                onClick={() => handleItemClick(notif)}
                                className={cn(
                                    "group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4",
                                    isRead
                                        ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                        : "bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50/60 hover:border-indigo-200 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "p-2.5 rounded-2xl shrink-0 mt-0.5 border flex items-center justify-center",
                                    isRead ? "bg-gray-50 border-gray-100" : "bg-white border-indigo-100 shadow-xs"
                                )}>
                                    {getTypeIcon(notif)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn("text-sm font-bold tracking-tight", isRead ? "text-gray-800" : "text-gray-900")}>
                                                {notif.title}
                                            </h4>
                                            {!isRead && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px]">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium">{timeAgo}</span>
                                    </div>

                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        {notif.message}
                                    </p>

                                    {notif.metadata?.senderName && (
                                        <div className="mt-2 text-[11px] text-gray-500 font-medium flex items-center gap-2">
                                            <span>Submitted by: <strong>{notif.metadata.senderName}</strong></span>
                                            {notif.metadata?.senderEmail && <span>({notif.metadata.senderEmail})</span>}
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1A2F] text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors">
                                            Review in Admin Panel
                                            <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteAdminNotif(notif.id);
                                        }}
                                        className="p-1.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                                        title="Dismiss alert"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
