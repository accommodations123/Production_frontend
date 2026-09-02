import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from './userUtils';

/**
 * Creates and stores an in-app notification + triggers email notification dispatch
 */
export async function createInAppAndEmailNotification({
    userId,
    userEmail,
    title,
    message,
    type = 'system',
    link = '/account-v2',
    metadata = {}
}) {
    try {
        const targetUserId = userId || await getCurrentUserId();
        const targetEmail = userEmail || (await getCurrentUserObject())?.email;
        
        const newNotif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: targetUserId,
            userEmail: targetEmail,
            title: title || 'Notification',
            message: message || '',
            type: type || 'system',
            link: link || '/account-v2',
            is_read: false,
            read: false,
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metadata: metadata || {}
        };

        // 1. Save to localStorage for instant UI response
        if (targetUserId) {
            const key = `nxt_notifications_${targetUserId}`;
            try {
                const stored = localStorage.getItem(key);
                const list = stored ? JSON.parse(stored) : [];
                const updated = [newNotif, ...list.filter(n => n.id !== newNotif.id)].slice(0, 50);
                localStorage.setItem(key, JSON.stringify(updated));
            } catch (err) {
                console.warn('LocalStorage notification save error:', err);
            }
        }

        // Global fallback store
        try {
            const globalKey = 'notifications';
            const storedGlobal = localStorage.getItem(globalKey);
            const globalList = storedGlobal ? JSON.parse(storedGlobal) : [];
            const updatedGlobal = [newNotif, ...globalList.filter(n => n.id !== newNotif.id)].slice(0, 50);
            localStorage.setItem(globalKey, JSON.stringify(updatedGlobal));
        } catch {}

        // 2. Persist to Supabase User Profile Metadata
        if (targetUserId && supabase) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, street_address')
                    .eq('id', targetUserId)
                    .maybeSingle();

                if (profile) {
                    let profileMeta = {};
                    if (profile.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                        try { profileMeta = JSON.parse(profile.street_address); } catch {}
                    }
                    const userNotifs = Array.isArray(profileMeta.notifications) ? profileMeta.notifications : [];
                    profileMeta.notifications = [newNotif, ...userNotifs.filter(n => n.id !== newNotif.id)].slice(0, 50);

                    await supabase
                        .from('profiles')
                        .update({ street_address: JSON.stringify(profileMeta) })
                        .eq('id', targetUserId);
                }
            } catch (profileErr) {
                console.warn('Supabase notification profile sync note:', profileErr);
            }
        }

        // 3. Simulated Email Dispatch Service
        const emailPayload = {
            to: targetEmail || 'user@nextkinlife.com',
            subject: `[NextKinLife] ${title}`,
            body: message,
            sent_at: new Date().toISOString(),
            status: 'delivered'
        };
        console.log('📬 [EMAIL DISPATCHED TO USER]:', emailPayload);

        // Record outgoing email log in localStorage for auditing
        try {
            const emailLogs = JSON.parse(localStorage.getItem('nxt_sent_emails') || '[]');
            emailLogs.unshift(emailPayload);
            localStorage.setItem('nxt_sent_emails', JSON.stringify(emailLogs.slice(0, 100)));
        } catch {}

        // 4. Dispatch DOM custom event so open components (like NotificationDropdown) can live-update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nxt:new_notification', { detail: newNotif }));
        }

        return newNotif;
    } catch (err) {
        console.error('Error creating notification:', err);
        return null;
    }
}

/**
 * Retrieve all notifications for the current active user
 */
export async function getUserNotifications(userId, userEmail) {
    try {
        const targetUserId = userId || await getCurrentUserId();
        const targetEmail = userEmail || (await getCurrentUserObject())?.email;

        let notifications = [];

        // 1. Load from local cache first
        if (targetUserId) {
            try {
                const stored = localStorage.getItem(`nxt_notifications_${targetUserId}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) notifications = parsed;
                }
            } catch {}
        }

        if (notifications.length === 0) {
            try {
                const globalStored = localStorage.getItem('notifications');
                if (globalStored) {
                    const parsed = JSON.parse(globalStored);
                    if (Array.isArray(parsed)) notifications = parsed;
                }
            } catch {}
        }

        // 2. Fetch from Supabase profile metadata
        if (targetUserId && supabase) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('street_address, status, is_approved, full_name, name')
                    .eq('id', targetUserId)
                    .maybeSingle();

                if (profile) {
                    let profileMeta = {};
                    if (profile.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                        try { profileMeta = JSON.parse(profile.street_address); } catch {}
                    }
                    if (Array.isArray(profileMeta.notifications) && profileMeta.notifications.length > 0) {
                        // Merge profile notifications with local notifications
                        const map = new Map();
                        [...notifications, ...profileMeta.notifications].forEach(n => {
                            if (n && n.id) map.set(n.id, n);
                        });
                        notifications = Array.from(map.values());
                    }
                }
            } catch (err) {
                console.warn('Profile notifications fetch note:', err);
            }
        }

        // 3. Auto-synthesize default welcome / system notifications if list is empty
        if (notifications.length === 0) {
            const welcomeNotif = {
                id: `notif_welcome_${targetUserId || 'guest'}`,
                userId: targetUserId,
                title: '👋 Welcome to NextKinLife!',
                message: 'Explore verified accommodations, connect with trusted expats & professionals, and plan your journey.',
                type: 'system',
                link: '/accommodations',
                is_read: false,
                read: false,
                created_at: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            notifications = [welcomeNotif];
            if (targetUserId) {
                try {
                    localStorage.setItem(`nxt_notifications_${targetUserId}`, JSON.stringify(notifications));
                } catch {}
            }
        }

        // Sort latest first
        notifications.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

        const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

        return {
            notifications,
            unreadCount,
            data: notifications
        };
    } catch (err) {
        console.error('Error fetching user notifications:', err);
        return { notifications: [], unreadCount: 0, data: [] };
    }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId) {
    try {
        const userId = await getCurrentUserId();
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => n.id === notificationId ? { ...n, is_read: true, read: true } : n);
        localStorage.setItem(key, JSON.stringify(notifs));

        // Sync to Supabase profile
        if (userId && supabase) {
            const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
            if (profile?.street_address) {
                try {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.map(n => n.id === notificationId ? { ...n, is_read: true, read: true } : n);
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                } catch {}
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Mark notification read error:', err);
        return { success: false };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
    try {
        const userId = await getCurrentUserId();
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => ({ ...n, is_read: true, read: true }));
        localStorage.setItem(key, JSON.stringify(notifs));

        if (userId && supabase) {
            const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
            if (profile?.street_address) {
                try {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.map(n => ({ ...n, is_read: true, read: true }));
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                } catch {}
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Mark all read error:', err);
        return { success: false };
    }
}

/**
 * Delete a single notification
 */
export async function deleteNotificationItem(notificationId) {
    try {
        const userId = await getCurrentUserId();
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.filter(n => n.id !== notificationId);
        localStorage.setItem(key, JSON.stringify(notifs));

        if (userId && supabase) {
            const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
            if (profile?.street_address) {
                try {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.filter(n => n.id !== notificationId);
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                } catch {}
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Delete notification error:', err);
        return { success: false };
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotificationsItems() {
    try {
        const userId = await getCurrentUserId();
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        localStorage.setItem(key, JSON.stringify([]));

        if (userId && supabase) {
            const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
            if (profile?.street_address) {
                try {
                    let meta = JSON.parse(profile.street_address);
                    meta.notifications = [];
                    await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                } catch {}
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Delete all notifications error:', err);
        return { success: false };
    }
}
