import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from './userUtils';
import { NOTIFICATION_TYPES, NOTIFICATION_TARGET_ROLES, NOTIFICATION_CHANNELS, getDefaultActionUrl } from '@/shared/constants/notificationTypes';
import { sendEmailNotification } from '../notifications/emailService';

// In-memory deduplication cache: `${recipientId}_${type}_${entityId}` -> timestamp
const deduplicationCache = new Map();
const DEDUP_WINDOW_MS = 5000; // 5 seconds deduplication window
const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

/**
 * Creates and stores an in-app notification + triggers transactional email dispatch
 */
export async function createInAppAndEmailNotification({
    userId,
    userEmail,
    recipientId,
    actorId = null,
    title,
    message,
    type = NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
    entityType = null,
    entityId = null,
    link = null,
    actionUrl = null,
    metadata = {},
    channel = NOTIFICATION_CHANNELS.BOTH
}) {
    try {
        const targetUserId = recipientId || userId || (await getCurrentUserId());
        const targetEmail = userEmail || (await getCurrentUserObject())?.email;
        const resolvedActionUrl = actionUrl || link || getDefaultActionUrl(type, entityId);

        // 1. Deduplication guard
        const dedupKey = `${targetUserId || 'anon'}_${type}_${entityId || entityType || title}`;
        const lastSent = deduplicationCache.get(dedupKey);
        const now = Date.now();
        if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
            console.warn(`[Notification skipped - Duplicate prevented within ${DEDUP_WINDOW_MS}ms]:`, dedupKey);
            return null;
        }
        deduplicationCache.set(dedupKey, now);

        const newNotif = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `notif_${now}_${Math.random().toString(36).substring(2, 9)}`,
            recipient_id: targetUserId || null,
            actor_id: actorId || null,
            target_role: NOTIFICATION_TARGET_ROLES.USER,
            userId: targetUserId,
            userEmail: targetEmail,
            title: title || 'Notification',
            message: message || '',
            type: type || NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            action_url: resolvedActionUrl,
            link: resolvedActionUrl,
            channel: channel || NOTIFICATION_CHANNELS.BOTH,
            is_read: false,
            read: false,
            read_at: null,
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metadata: {
                ...metadata,
                entityType,
                entityId
            },
            email_status: 'pending',
            email_sent_at: null,
            email_error: null
        };

        // 2. Dispatch transactional email (if email channel enabled)
        if (channel === NOTIFICATION_CHANNELS.BOTH || channel === NOTIFICATION_CHANNELS.EMAIL) {
            if (targetEmail) {
                const emailRes = await sendEmailNotification({
                    to: targetEmail,
                    type: newNotif.type,
                    title: newNotif.title,
                    message: newNotif.message,
                    actionUrl: newNotif.action_url,
                    entityId: newNotif.entity_id,
                    metadata: newNotif.metadata
                });
                newNotif.email_status = emailRes.status;
                newNotif.email_sent_at = emailRes.sent_at;
                newNotif.email_error = emailRes.error;
            }
        }

        // 3. Save to Supabase `notifications` table
        if (supabase) {
            try {
                const dbPayload = {
                    id: String(newNotif.id),
                    recipient_id: isUuid(newNotif.recipient_id) ? newNotif.recipient_id : null,
                    actor_id: isUuid(newNotif.actor_id) ? newNotif.actor_id : null,
                    target_role: newNotif.target_role,
                    type: newNotif.type,
                    title: newNotif.title,
                    message: newNotif.message,
                    entity_type: newNotif.entity_type,
                    entity_id: newNotif.entity_id,
                    action_url: newNotif.action_url,
                    metadata: newNotif.metadata,
                    channel: newNotif.channel,
                    is_read: false,
                    email_status: newNotif.email_status,
                    email_sent_at: newNotif.email_sent_at,
                    email_error: newNotif.email_error,
                    created_at: newNotif.created_at
                };
                await supabase.from('notifications').insert(dbPayload);
            } catch (dbErr) {
                console.warn('Supabase notifications table insert note:', dbErr);
            }
        }

        // 4. Save to Local Storage Cache for instant UI response
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

        // 5. Dual sync to Supabase profile metadata
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

        // 6. Broadcast DOM custom event for live component refreshes
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
 * Automatically sync any approved entities (Host, Space, Stay, etc.) into notifications
 * for the user in case the admin panel approved directly without creating a notification record.
 */
async function autoSyncUserApprovals(targetUserId) {
    if (!supabase || !targetUserId || !isUuid(targetUserId)) return;
    try {
        // 1. Host Verification Approval
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, status, is_approved, updated_at')
            .eq('id', targetUserId)
            .maybeSingle();

        if (profile && (profile.status === 'approved' || profile.is_approved === true || profile.role === 'host')) {
            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('recipient_id', targetUserId)
                .eq('type', 'HOST_APPROVED')
                .limit(1);

            if (!existing || existing.length === 0) {
                await supabase.from('notifications').insert({
                    recipient_id: targetUserId,
                    actor_id: null,
                    target_role: 'user',
                    type: 'HOST_APPROVED',
                    title: '🛡️ Host Identity Verified & Approved!',
                    message: `Congratulations ${profile.full_name || 'Host'}! Your host identity verification has been approved by NextKinLife admin. You now have a verified host badge.`,
                    entity_type: 'host',
                    entity_id: targetUserId,
                    action_url: '/account-v2',
                    metadata: { id: targetUserId, role: 'host', verified: true },
                    channel: 'both',
                    is_read: false,
                    created_at: profile.updated_at || new Date().toISOString()
                });
            }
        }

        // 2. Space / Accommodation Approvals
        const { data: props } = await supabase
            .from('properties')
            .select('id, title, city, updated_at')
            .eq('host_id', targetUserId)
            .or('status.eq.approved,is_approved.eq.true');

        if (props && props.length > 0) {
            for (const p of props) {
                const { data: existingProp } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('recipient_id', targetUserId)
                    .eq('entity_id', String(p.id))
                    .eq('type', 'PROPERTY_APPROVED')
                    .limit(1);

                if (!existingProp || existingProp.length === 0) {
                    await supabase.from('notifications').insert({
                        recipient_id: targetUserId,
                        target_role: 'user',
                        type: 'PROPERTY_APPROVED',
                        title: '🎉 Space Listing Approved!',
                        message: `Your space "${p.title || 'Accommodation'}" has been approved by NextKinLife admin and is now live & verified.`,
                        entity_type: 'property',
                        entity_id: String(p.id),
                        action_url: `/rooms/${p.id}`,
                        metadata: { id: p.id, title: p.title, city: p.city },
                        channel: 'both',
                        is_read: false,
                        created_at: p.updated_at || new Date().toISOString()
                    });
                }
            }
        }
    } catch (e) {
        console.warn('Auto approval sync note:', e);
    }
}

/**
 * Retrieve all notifications for the current active user
 */
export async function getUserNotifications(userId, userEmail, queryParams = {}) {
    try {
        const currentUser = await getCurrentUserObject();
        const targetUserId = userId || currentUser?.id || currentUser?.user_id || (await getCurrentUserId());
        const targetEmail = userEmail || currentUser?.email;
        const isAdmin = currentUser?.role === 'admin' || currentUser?.is_admin || queryParams?.role === 'admin';
        let notifications = [];

        // Auto-sync any approvals made by admin
        if (targetUserId) {
            await autoSyncUserApprovals(targetUserId);
        }

        // 1. Query Supabase notifications table if available
        if (supabase) {
            try {
                let query = supabase
                    .from('notifications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(parseInt(queryParams?.limit) || 50);

                if (targetUserId && isUuid(targetUserId)) {
                    if (isAdmin) {
                        query = query.or(`recipient_id.eq.${targetUserId},actor_id.eq.${targetUserId},target_role.eq.all,target_role.eq.admin`);
                    } else {
                        query = query.or(`recipient_id.eq.${targetUserId},actor_id.eq.${targetUserId},target_role.eq.all`);
                    }
                } else if (targetEmail) {
                    if (isAdmin) {
                        query = query.or(`target_role.eq.all,target_role.eq.admin,target_role.eq.user`);
                    } else {
                        query = query.or(`target_role.eq.all,target_role.eq.user`);
                    }
                } else if (isAdmin) {
                    query = query.or('target_role.eq.all,target_role.eq.user,target_role.eq.admin');
                } else {
                    query = query.or('target_role.eq.all,target_role.eq.user');
                }

                if (queryParams?.unreadOnly === 'true' || queryParams?.status === 'unread') {
                    query = query.eq('is_read', false);
                }
                if (queryParams?.type) {
                    query = query.eq('type', queryParams.type);
                }

                const { data: dbNotifs, error: dbErr } = await query;
                if (!dbErr && Array.isArray(dbNotifs) && dbNotifs.length > 0) {
                    notifications = dbNotifs.map(n => ({
                        ...n,
                        userId: n.recipient_id || n.actor_id,
                        link: n.action_url,
                        read: n.is_read,
                        createdAt: n.created_at
                    }));

                    // Cache to localStorage for instant UI response
                    if (typeof window !== 'undefined') {
                        try {
                            if (targetUserId) {
                                localStorage.setItem(`nxt_notifications_${targetUserId}`, JSON.stringify(notifications));
                            }
                            localStorage.setItem('nxt_notifications', JSON.stringify(notifications));
                        } catch {}
                    }
                }
            } catch (err) {
                console.warn('Supabase notifications query note:', err);
            }
        }

        // 2. Load from local cache if database returned 0
        if (notifications.length === 0 && typeof window !== 'undefined') {
            try {
                // Check target user's key
                if (targetUserId) {
                    const stored = localStorage.getItem(`nxt_notifications_${targetUserId}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) notifications = parsed;
                    }
                }
                // Check generic fallback key
                if (notifications.length === 0) {
                    const generic = localStorage.getItem('nxt_notifications');
                    if (generic) {
                        const parsed = JSON.parse(generic);
                        if (Array.isArray(parsed) && parsed.length > 0) notifications = parsed;
                    }
                }
                // Fallback: check any nxt_notifications_* keys in localStorage
                if (notifications.length === 0) {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('nxt_notifications_')) {
                            const raw = localStorage.getItem(k);
                            try {
                                const parsed = JSON.parse(raw);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    notifications = parsed;
                                    break;
                                }
                            } catch {}
                        }
                    }
                }
            } catch {}
        }

        // 3. Check profile metadata
        if (notifications.length === 0 && targetUserId && supabase) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('street_address')
                    .eq('id', targetUserId)
                    .maybeSingle();

                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try {
                        const meta = JSON.parse(profile.street_address);
                        if (Array.isArray(meta.notifications) && meta.notifications.length > 0) {
                            notifications = meta.notifications;
                        }
                    } catch {}
                }
            } catch {}
        }

        // 4. Default welcome notification if list is completely empty
        if (notifications.length === 0) {
            const welcomeNotif = {
                id: `notif_welcome_${targetUserId || 'guest'}`,
                recipient_id: targetUserId,
                userId: targetUserId,
                title: '👋 Welcome to NextKinLife!',
                message: 'Explore verified accommodations, connect with trusted expats & professionals, and plan your journey.',
                type: NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
                action_url: '/accommodations',
                link: '/accommodations',
                is_read: false,
                read: false,
                created_at: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            notifications = [welcomeNotif];
            if (typeof window !== 'undefined') {
                try {
                    if (targetUserId) {
                        localStorage.setItem(`nxt_notifications_${targetUserId}`, JSON.stringify(notifications));
                    }
                    localStorage.setItem('nxt_notifications', JSON.stringify(notifications));
                } catch {}
            }
        }

        // Sort latest first
        notifications.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

        const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

        return {
            notifications,
            unreadCount,
            data: notifications,
            total: notifications.length
        };
    } catch (err) {
        console.error('Error fetching user notifications:', err);
        return { notifications: [], unreadCount: 0, data: [], total: 0 };
    }
}

/**
 * Mark a single notification as read (idempotent)
 */
export async function markNotificationRead(notificationId) {
    try {
        const userId = await getCurrentUserId();
        const nowIso = new Date().toISOString();

        // 1. Update Supabase notifications table
        if (supabase) {
            try {
                await supabase
                    .from('notifications')
                    .update({ is_read: true, read_at: nowIso })
                    .eq('id', notificationId);
            } catch {}
        }

        // 2. Update local storage
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => n.id === notificationId ? { ...n, is_read: true, read: true, read_at: nowIso } : n);
        localStorage.setItem(key, JSON.stringify(notifs));

        // 3. Sync to Supabase profile metadata
        if (userId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                if (profile?.street_address) {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.map(n => n.id === notificationId ? { ...n, is_read: true, read: true, read_at: nowIso } : n);
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                }
            } catch {}
        }

        return { success: true };
    } catch (err) {
        console.error('Mark notification read error:', err);
        return { success: false };
    }
}

/**
 * Mark all notifications as read (idempotent)
 */
export async function markAllNotificationsRead() {
    try {
        const userId = await getCurrentUserId();
        const nowIso = new Date().toISOString();

        // 1. Update Supabase notifications table
        if (userId && supabase) {
            try {
                if (isUuid(userId)) {
                    await supabase
                        .from('notifications')
                        .update({ is_read: true, read_at: nowIso })
                        .or(`recipient_id.eq.${userId},actor_id.eq.${userId}`);
                }
            } catch {}
        }

        // 2. Update local storage
        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => ({ ...n, is_read: true, read: true, read_at: nowIso }));
        localStorage.setItem(key, JSON.stringify(notifs));

        // 3. Sync to profile metadata
        if (userId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                if (profile?.street_address) {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.map(n => ({ ...n, is_read: true, read: true, read_at: nowIso }));
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                }
            } catch {}
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

        if (supabase) {
            try {
                await supabase.from('notifications').delete().eq('id', notificationId);
            } catch {}
        }

        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.filter(n => n.id !== notificationId);
        localStorage.setItem(key, JSON.stringify(notifs));

        if (userId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                if (profile?.street_address) {
                    let meta = JSON.parse(profile.street_address);
                    if (Array.isArray(meta.notifications)) {
                        meta.notifications = meta.notifications.filter(n => n.id !== notificationId);
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                    }
                }
            } catch {}
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

        if (userId && supabase) {
            try {
                if (isUuid(userId)) {
                    await supabase.from('notifications').delete().or(`recipient_id.eq.${userId},actor_id.eq.${userId}`);
                }
            } catch {}
        }

        const key = userId ? `nxt_notifications_${userId}` : 'notifications';
        localStorage.setItem(key, JSON.stringify([]));

        if (userId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                if (profile?.street_address) {
                    let meta = JSON.parse(profile.street_address);
                    meta.notifications = [];
                    await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId);
                }
            } catch {}
        }

        return { success: true };
    } catch (err) {
        console.error('Delete all notifications error:', err);
        return { success: false };
    }
}

/**
 * Dispatches an admin notification to all administrator accounts and admin queue
 */
export async function notifyAdminsOfUserSubmission({
    title,
    message,
    type = NOTIFICATION_TYPES.ADMIN_MESSAGE,
    entityType = null,
    entityId = null,
    link = null,
    actionUrl = null,
    metadata = {},
    userId = null,
    userEmail = null,
    userName = null
}) {
    try {
        const senderUserId = userId || (await getCurrentUserId());
        const senderObj = await getCurrentUserObject();
        const senderEmail = userEmail || senderObj?.email || 'user@nextkinlife.com';
        const senderName = userName || senderObj?.name || senderObj?.full_name || 'NextKinLife User';
        const resolvedActionUrl = actionUrl || link || getDefaultActionUrl(type, entityId);

        // Deduplication guard
        const dedupKey = `admin_${type}_${entityId || entityType || title}`;
        const lastSent = deduplicationCache.get(dedupKey);
        const now = Date.now();
        if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
            console.warn(`[Admin Notification skipped - Duplicate prevented]:`, dedupKey);
            return null;
        }
        deduplicationCache.set(dedupKey, now);

        const adminNotif = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `admin_notif_${now}_${Math.random().toString(36).substring(2, 9)}`,
            recipient_id: null,
            actor_id: senderUserId || null,
            target_role: NOTIFICATION_TARGET_ROLES.ADMIN,
            title: title || 'New User Submission',
            message: message || '',
            type: type || NOTIFICATION_TYPES.ADMIN_MESSAGE,
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            action_url: resolvedActionUrl,
            link: resolvedActionUrl,
            channel: NOTIFICATION_CHANNELS.BOTH,
            is_read: false,
            read: false,
            read_at: null,
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metadata: {
                ...metadata,
                senderId: senderUserId,
                senderEmail: senderEmail,
                senderName: senderName,
                submittedAt: new Date().toISOString()
            }
        };

        // 1. Dispatch Admin Alert Email
        await sendEmailNotification({
            to: 'admin@nextkinlife.com',
            type: adminNotif.type,
            title: `[ADMIN ALERT] ${adminNotif.title}`,
            message: `${adminNotif.message}\n\nSubmitted by: ${senderName} (${senderEmail})`,
            actionUrl: adminNotif.action_url,
            entityId: adminNotif.entity_id,
            metadata: adminNotif.metadata
        });

        // 2. Persist to Supabase notifications table
        if (supabase) {
            try {
                await supabase.from('notifications').insert({
                    id: String(adminNotif.id),
                    recipient_id: null,
                    actor_id: isUuid(adminNotif.actor_id) ? adminNotif.actor_id : null,
                    target_role: NOTIFICATION_TARGET_ROLES.ADMIN,
                    title: adminNotif.title,
                    message: adminNotif.message,
                    type: adminNotif.type,
                    entity_type: adminNotif.entity_type,
                    entity_id: adminNotif.entity_id,
                    action_url: adminNotif.action_url,
                    metadata: adminNotif.metadata,
                    channel: NOTIFICATION_CHANNELS.BOTH,
                    is_read: false,
                    created_at: adminNotif.created_at
                });
            } catch (err) {
                console.warn('Supabase notifications insert error:', err);
            }
        }

        // 3. Save to localStorage Admin notifications queue
        try {
            const adminKey = 'nxt_admin_notifications';
            const stored = localStorage.getItem(adminKey);
            const list = stored ? JSON.parse(stored) : [];
            const updated = [adminNotif, ...list.filter(n => n.id !== adminNotif.id)].slice(0, 100);
            localStorage.setItem(adminKey, JSON.stringify(updated));
        } catch (err) {
            console.warn('Admin notifications localStorage save warning:', err);
        }

        // 4. Dispatch DOM Custom Events for open admin panels
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nxt:new_admin_notification', { detail: adminNotif }));
            window.dispatchEvent(new CustomEvent('nxt:new_notification', { detail: adminNotif }));
        }

        return adminNotif;
    } catch (err) {
        console.error('Error in notifyAdminsOfUserSubmission:', err);
        return null;
    }
}

/**
 * Retrieve all notifications for administrators
 */
export async function getAdminNotifications(queryParams = {}) {
    try {
        let notifications = [];

        // 1. Query Supabase notifications table for admin target_role
        if (supabase) {
            try {
                let query = supabase
                    .from('notifications')
                    .select('*')
                    .eq('target_role', 'admin')
                    .order('created_at', { ascending: false })
                    .limit(parseInt(queryParams?.limit) || 100);

                if (queryParams?.unreadOnly === 'true' || queryParams?.status === 'unread') {
                    query = query.eq('is_read', false);
                }

                const { data: dbNotifs, error } = await query;
                if (!error && Array.isArray(dbNotifs) && dbNotifs.length > 0) {
                    notifications = dbNotifs.map(n => ({
                        ...n,
                        link: n.action_url,
                        read: n.is_read,
                        createdAt: n.created_at
                    }));
                }
            } catch (err) {
                console.warn('Supabase admin notifications fetch note:', err);
            }
        }

        // 2. Fallback to localStorage admin notifications cache
        if (notifications.length === 0) {
            try {
                const stored = localStorage.getItem('nxt_admin_notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) notifications = parsed;
                }
            } catch {}
        }

        // 3. Initial system welcome if empty
        if (notifications.length === 0) {
            notifications = [{
                id: 'admin_init_welcome',
                title: '🛡️ Admin Notification Feed Active',
                message: 'All incoming user submissions (spaces, events, marketplace listings, host verifications, contact inquiries) will appear here live.',
                type: NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
                action_url: '/admin',
                link: '/admin',
                is_read: false,
                read: false,
                created_at: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }];
        }

        // Sort latest first
        notifications.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

        const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

        return {
            notifications,
            unreadCount,
            data: notifications,
            total: notifications.length
        };
    } catch (err) {
        console.error('Error fetching admin notifications:', err);
        return { notifications: [], unreadCount: 0, data: [], total: 0 };
    }
}

/**
 * Mark a single admin notification as read
 */
export async function markAdminNotificationRead(notificationId) {
    try {
        const nowIso = new Date().toISOString();

        if (supabase) {
            try {
                await supabase.from('notifications').update({ is_read: true, read_at: nowIso }).eq('id', notificationId);
            } catch {}
        }

        const key = 'nxt_admin_notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => n.id === notificationId ? { ...n, is_read: true, read: true, read_at: nowIso } : n);
        localStorage.setItem(key, JSON.stringify(notifs));

        return { success: true };
    } catch (err) {
        console.error('Mark admin notification read error:', err);
        return { success: false };
    }
}

/**
 * Mark all admin notifications as read
 */
export async function markAllAdminNotificationsRead() {
    try {
        const nowIso = new Date().toISOString();

        if (supabase) {
            try {
                await supabase.from('notifications').update({ is_read: true, read_at: nowIso }).eq('target_role', 'admin');
            } catch {}
        }

        const key = 'nxt_admin_notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.map(n => ({ ...n, is_read: true, read: true, read_at: nowIso }));
        localStorage.setItem(key, JSON.stringify(notifs));

        return { success: true };
    } catch (err) {
        console.error('Mark all admin notifications read error:', err);
        return { success: false };
    }
}

/**
 * Delete a single admin notification
 */
export async function deleteAdminNotificationItem(notificationId) {
    try {
        if (supabase) {
            try {
                await supabase.from('notifications').delete().eq('id', notificationId);
            } catch {}
        }

        const key = 'nxt_admin_notifications';
        let notifs = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) notifs = JSON.parse(stored);
        } catch {}

        notifs = notifs.filter(n => n.id !== notificationId);
        localStorage.setItem(key, JSON.stringify(notifs));

        return { success: true };
    } catch (err) {
        console.error('Delete admin notification error:', err);
        return { success: false };
    }
}

/**
 * Delete all admin notifications
 */
export async function deleteAllAdminNotificationsItems() {
    try {
        if (supabase) {
            try {
                await supabase.from('notifications').delete().eq('target_role', 'admin');
            } catch {}
        }

        localStorage.setItem('nxt_admin_notifications', JSON.stringify([]));
        return { success: true };
    } catch (err) {
        console.error('Delete all admin notifications error:', err);
        return { success: false };
    }
}
