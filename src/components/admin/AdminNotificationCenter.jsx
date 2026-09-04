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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";

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
        const unsubscribe = realtimeNotificationManager.subscribe(null, handleAdminEvent, handleAdminEvent);

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
        { id: 'marketplace', label: 'Marketplace', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || n.type === NOTIFICATION_TYPES.MARKETPLACE_SUBMITTED || n.entity_type === 'marketplace' || n.entity_type === 'buysell').length },
        { id: 'host', label: 'Host Verifications', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || n.entity_type === 'host').length },
        { id: 'career', label: 'Careers', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || n.entity_type === 'job_application' || n.entity_type === 'career').length },
        { id: 'expert', label: 'Experts', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED || n.entity_type === 'expert').length },
        { id: 'travel', label: 'Travel Plans', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.TRAVEL_PLAN_CREATED || n.entity_type === 'travel').length },
        { id: 'contact', label: 'Inquiries', count: notifList.filter(n => n.type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || n.entity_type === 'contact').length },
    ];

    const filteredNotifs = useMemo(() => {
        return notifList.filter(n => {
            const matchesCategory = 
                selectedCategory === 'all' ? true :
                selectedCategory === 'unread' ? (!n.is_read && !n.read) :
                selectedCategory === 'property' ? (n.type === NOTIFICATION_TYPES.PROPERTY_SUBMITTED || n.entity_type === 'property') :
                selectedCategory === 'event' ? (n.type === NOTIFICATION_TYPES.EVENT_SUBMITTED || n.entity_type === 'event') :
                selectedCategory === 'marketplace' ? (n.type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || n.type === NOTIFICATION_TYPES.MARKETPLACE_SUBMITTED || n.entity_type === 'marketplace' || n.entity_type === 'buysell') :
                selectedCategory === 'host' ? (n.type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || n.entity_type === 'host') :
                selectedCategory === 'career' ? (n.type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || n.entity_type === 'job_application' || n.entity_type === 'career') :
                selectedCategory === 'expert' ? (n.type === NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED || n.entity_type === 'expert') :
                selectedCategory === 'travel' ? (n.type === NOTIFICATION_TYPES.TRAVEL_PLAN_CREATED || n.entity_type === 'travel') :
                selectedCategory === 'contact' ? (n.type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || n.entity_type === 'contact') : true;

            const matchesSearch = !searchQuery.trim() || 
                (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (n.message && n.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (n.metadata?.senderName && n.metadata.senderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (n.metadata?.title && n.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [notifList, selectedCategory, searchQuery]);

    const handleMarkAllRead = async () => {
        try {
            await markAllAdminRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to clear all processed admin notifications?')) {
            try {
                await deleteAllAdminNotifs().unwrap();
            } catch (err) {
                console.error('Failed to clear admin notifications', err);
            }
        }
    };

    const handleItemClick = async (notif) => {
        if (!notif.is_read && !notif.read) {
            try {
                await markAdminRead(notif.id).unwrap();
            } catch (err) {
                console.error('Failed to mark as read', err);
            }
        }

        // Deep-link routing based on entity type
        const type = notif.type;
        const entity = notif.entity_type;
        const entityId = notif.entity_id || notif.target_id;

        if (type === NOTIFICATION_TYPES.PROPERTY_SUBMITTED || entity === 'property') {
            navigate('/admin', { state: { tab: 'properties', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.EVENT_SUBMITTED || entity === 'event') {
            navigate('/admin', { state: { tab: 'events', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || type === NOTIFICATION_TYPES.MARKETPLACE_SUBMITTED || entity === 'marketplace' || entity === 'buysell') {
            navigate('/admin', { state: { tab: 'buysell', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || entity === 'host') {
            navigate('/admin', { state: { tab: 'hosts', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED || entity === 'expert') {
            navigate('/admin', { state: { tab: 'experts', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.TRAVEL_PLAN_CREATED || entity === 'travel') {
            navigate('/admin', { state: { tab: 'travel', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || entity === 'contact') {
            navigate('/admin', { state: { tab: 'contacts', highlightId: entityId } });
        } else if (type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || entity === 'job_application' || entity === 'career') {
            navigate('/career');
        } else {
            navigate('/admin');
        }
    };

    const getTypeIcon = (notif) => {
        const type = notif.type;
        const entity = notif.entity_type;

        if (type === NOTIFICATION_TYPES.PROPERTY_SUBMITTED || entity === 'property') {
            return <Home className="w-4 h-4 text-emerald-600" />;
        }
        if (type === NOTIFICATION_TYPES.EVENT_SUBMITTED || entity === 'event') {
            return <Calendar className="w-4 h-4 text-indigo-600" />;
        }
        if (type === NOTIFICATION_TYPES.BUY_SELL_SUBMITTED || type === NOTIFICATION_TYPES.MARKETPLACE_SUBMITTED || entity === 'marketplace' || entity === 'buysell') {
            return <ShoppingBag className="w-4 h-4 text-amber-600" />;
        }
        if (type === NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED || entity === 'host') {
            return <ShieldCheck className="w-4 h-4 text-sky-600" />;
        }
        if (type === NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED || entity === 'expert') {
            return <Briefcase className="w-4 h-4 text-purple-600" />;
        }
        if (type === NOTIFICATION_TYPES.TRAVEL_PLAN_CREATED || entity === 'travel') {
            return <Plane className="w-4 h-4 text-rose-600" />;
        }
        if (type === NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED || entity === 'contact') {
            return <Mail className="w-4 h-4 text-teal-600" />;
        }
        if (type === NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED || entity === 'job_application' || entity === 'career') {
            return <Briefcase className="w-4 h-4 text-blue-600" />;
        }
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <Card className="rounded-3xl p-6 sm:p-8 border-border bg-card shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Admin Notification Center</h2>
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="font-bold text-[11px] px-2 py-0.5">
                                    {unreadCount} pending review
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Incoming user submissions requiring moderation & administrative approvals.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh Admin Queue"
                    >
                        <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin text-accent")} />
                    </Button>

                    {unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="font-semibold text-xs gap-1.5"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </Button>
                    )}

                    {notifList.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteAll}
                            className="font-semibold text-xs text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear queue
                        </Button>
                    )}
                </div>
            </div>

            {/* Search & Categories */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search submissions by title, actor, or details..."
                        className="pl-10 text-xs h-10"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                            className="rounded-full text-xs font-semibold h-8 px-3 whitespace-nowrap shrink-0 gap-1.5"
                        >
                            {cat.label}
                            {cat.count > 0 && (
                                <Badge 
                                    variant={selectedCategory === cat.id ? "accent" : "secondary"}
                                    className="px-1.5 py-0 text-[10px] rounded-full"
                                >
                                    {cat.count}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-16 text-center text-muted-foreground text-xs">
                        <div className="w-7 h-7 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                        Loading admin alerts...
                    </div>
                ) : filteredNotifs.length === 0 ? (
                    <EmptyState
                        icon={ShieldCheck}
                        title="No submissions pending"
                        description="All incoming submissions and moderation alerts have been processed."
                        className="py-12"
                    />
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
                                        ? "bg-card border-border/80 hover:border-border hover:shadow-xs"
                                        : "bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/30 shadow-xs"
                                )}
                            >
                                <div className={cn(
                                    "p-2.5 rounded-xl shrink-0 mt-0.5 border flex items-center justify-center",
                                    isRead ? "bg-muted/50 border-border" : "bg-card border-accent/30 shadow-xs"
                                )}>
                                    {getTypeIcon(notif)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn("text-sm font-bold tracking-tight", isRead ? "text-foreground" : "text-foreground")}>
                                                {notif.title}
                                            </h4>
                                            {!isRead && (
                                                <Badge variant="destructive" className="font-extrabold text-[10px] px-2 py-0.2">
                                                    Action Required
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium">{timeAgo}</span>
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {notif.message}
                                    </p>

                                    {notif.metadata?.senderName && (
                                        <div className="mt-2 text-[11px] text-muted-foreground font-medium flex items-center gap-2">
                                            <span>Submitted by: <strong className="text-foreground">{notif.metadata.senderName}</strong></span>
                                            {notif.metadata?.senderEmail && <span>({notif.metadata.senderEmail})</span>}
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="text-xs font-semibold gap-1.5 h-7 px-3"
                                        >
                                            Review in Admin Panel
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteAdminNotif(notif.id);
                                        }}
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        title="Dismiss alert"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}
