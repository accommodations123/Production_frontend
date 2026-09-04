import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from './userUtils';
import { NOTIFICATION_TYPES, NOTIFICATION_TARGET_ROLES, NOTIFICATION_CHANNELS, getDefaultActionUrl } from '@/shared/constants/notificationTypes';
import { sendEmailNotification } from '../notifications/emailService';

// In-memory deduplication cache: `${recipientId}_${type}_${entityId}` -> timestamp (5s window)
const deduplicationCache = new Map();
const DEDUP_WINDOW_MS = 5000;
const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

// Standard column projection for performance
const NOTIFICATION_COLUMNS = 'id, recipient_id, actor_id, target_role, type, title, message, entity_type, entity_id, action_url, metadata, channel, is_read, read_at, email_status, email_sent_at, email_error, created_at';

/**
 * Creates and persists an in-app notification in Supabase database,
 * then dispatches transactional email asynchronously without blocking the UI.
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
        const currentUserId = await getCurrentUserId();
        const targetUserId = recipientId || userId || currentUserId;
        const targetEmail = userEmail || (await getCurrentUserObject())?.email;
        const resolvedActionUrl = actionUrl || link || getDefaultActionUrl(type, entityId);

        if (!title || !type) {
            console.warn('[Notification skipped]: Missing required title or type');
            return null;
        }

        // 1. Deduplication guard
        const dedupKey = `${targetUserId || 'broadcast'}_${type}_${entityId || entityType || title}`;
        const lastSent = deduplicationCache.get(dedupKey);
        const now = Date.now();
        if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
            console.warn(`[Notification skipped - Duplicate prevented within ${DEDUP_WINDOW_MS}ms]:`, dedupKey);
            return null;
        }
        deduplicationCache.set(dedupKey, now);

        const notificationId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : `notif_${now}_${Math.random().toString(36).substring(2, 9)}`;

        const newNotif = {
            id: String(notificationId),
            recipient_id: isUuid(targetUserId) ? targetUserId : null,
            actor_id: isUuid(actorId) ? actorId : (isUuid(currentUserId) ? currentUserId : null),
            target_role: NOTIFICATION_TARGET_ROLES.USER,
            type: type || NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
            title: title || 'Notification',
            message: message || '',
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            action_url: resolvedActionUrl,
            metadata: {
                ...metadata,
                entityType,
                entityId
            },
            channel: channel || NOTIFICATION_CHANNELS.BOTH,
            is_read: false,
            read_at: null,
            email_status: (channel === NOTIFICATION_CHANNELS.BOTH || channel === NOTIFICATION_CHANNELS.EMAIL) ? 'pending' : 'skipped',
            email_sent_at: null,
            email_error: null,
            idempotency_key: dedupKey,
            created_at: new Date().toISOString()
        };

        // 2. Persist to Supabase `notifications` table immediately
        if (supabase) {
            try {
                const { error: insertErr } = await supabase
                    .from('notifications')
                    .insert({
                        id: newNotif.id,
                        recipient_id: newNotif.recipient_id,
                        actor_id: newNotif.actor_id,
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
                        idempotency_key: newNotif.idempotency_key,
                        created_at: newNotif.created_at
                    });

                if (insertErr) {
                    console.warn('[Notification DB insert note]:', insertErr.message || insertErr);
                }
            } catch (dbErr) {
                console.warn('[Notification DB insert error]:', dbErr);
            }
        }

        // 3. Broadcast DOM event for immediate UI updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nxt:new_notification', { detail: newNotif }));
        }

        // 4. Asynchronous Transactional Email Dispatch (Non-blocking background flow)
        if ((channel === NOTIFICATION_CHANNELS.BOTH || channel === NOTIFICATION_CHANNELS.EMAIL) && targetEmail) {
            sendEmailNotification({
                to: targetEmail,
                type: newNotif.type,
                title: newNotif.title,
                message: newNotif.message,
                actionUrl: newNotif.action_url,
                entityId: newNotif.entity_id,
                metadata: newNotif.metadata,
                notificationId: newNotif.id
            }).then(async (emailRes) => {
                if (supabase && emailRes && emailRes.status) {
                    try {
                        await supabase
                            .from('notifications')
                            .update({
                                email_status: emailRes.status,
                                email_sent_at: emailRes.sent_at,
                                email_error: emailRes.error
                            })
                            .eq('id', newNotif.id);
                    } catch (err) {
                        console.warn('[Failed to update notification email status]:', err);
                    }
                }
            }).catch((emailErr) => {
                console.warn('[Background email dispatch error]:', emailErr);
            });
        }

        // Return promptly to UI caller
        return {
            ...newNotif,
            userId: newNotif.recipient_id,
            link: newNotif.action_url,
            read: false,
            createdAt: newNotif.created_at
        };
    } catch (err) {
        console.error('Error creating notification:', err);
        return null;
    }
}

/**
 * Retrieve all notifications for the authenticated user.
 * Database is the authoritative source of truth.
 */
export async function getUserNotifications(userId, userEmail, queryParams = {}) {
    try {
        const currentUser = await getCurrentUserObject();
        const authenticatedUserId = currentUser?.id || currentUser?.user_id || (await getCurrentUserId());

        if (!authenticatedUserId || !isUuid(authenticatedUserId)) {
            return { notifications: [], unreadCount: 0, data: [], total: 0 };
        }

        const isAdmin = currentUser?.role === 'admin' || currentUser?.is_admin === true;
        let notifications = [];

        if (supabase) {
            try {
                let query = supabase
                    .from('notifications')
                    .select(NOTIFICATION_COLUMNS)
                    .order('created_at', { ascending: false })
                    .limit(parseInt(queryParams?.limit, 10) || 50);

                if (isAdmin) {
                    query = query.or(`recipient_id.eq.${authenticatedUserId},target_role.eq.all,target_role.eq.admin`);
                } else {
                    query = query.or(`recipient_id.eq.${authenticatedUserId},target_role.eq.all`);
                }

                if (queryParams?.unreadOnly === 'true' || queryParams?.status === 'unread') {
                    query = query.eq('is_read', false);
                }
                if (queryParams?.type) {
                    query = query.eq('type', queryParams.type);
                }

                const { data: dbNotifs, error: dbErr } = await query;
                if (!dbErr && Array.isArray(dbNotifs)) {
                    notifications = dbNotifs.map((n) => ({
                        ...n,
                        userId: n.recipient_id || n.actor_id,
                        link: n.action_url,
                        read: n.is_read,
                        createdAt: n.created_at
                    }));
                } else if (dbErr) {
                    console.warn('[Supabase notifications query error]:', dbErr.message || dbErr);
                }
            } catch (err) {
                console.warn('[Supabase notifications query note]:', err);
            }
        }

        const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

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
 * Mark a single notification as read (authenticated ownership check)
 */
export async function markNotificationRead(notificationId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId || !notificationId) return { success: false };

        const nowIso = new Date().toISOString();

        if (supabase) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true, read_at: nowIso })
                .eq('id', notificationId)
                .eq('recipient_id', userId);

            if (error) {
                console.warn('[Mark read DB error]:', error.message || error);
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Mark notification read error:', err);
        return { success: false };
    }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsRead() {
    try {
        const userId = await getCurrentUserId();
        if (!userId || !isUuid(userId)) return { success: false };

        const nowIso = new Date().toISOString();

        if (supabase) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true, read_at: nowIso })
                .eq('recipient_id', userId)
                .eq('is_read', false);

            if (error) {
                console.warn('[Mark all read DB error]:', error.message || error);
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Mark all read error:', err);
        return { success: false };
    }
}

/**
 * Delete a single notification (authenticated ownership check)
 */
export async function deleteNotificationItem(notificationId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId || !notificationId) return { success: false };

        if (supabase) {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('recipient_id', userId);

            if (error) {
                console.warn('[Delete notification DB error]:', error.message || error);
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Delete notification error:', err);
        return { success: false };
    }
}

/**
 * Delete all notifications for current user
 */
export async function deleteAllNotificationsItems() {
    try {
        const userId = await getCurrentUserId();
        if (!userId || !isUuid(userId)) return { success: false };

        if (supabase) {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('recipient_id', userId);

            if (error) {
                console.warn('[Delete all notifications DB error]:', error.message || error);
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Delete all notifications error:', err);
        return { success: false };
    }
}

/**
 * Dispatches an administrator alert when user submits an entity
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
        const currentUserId = await getCurrentUserId();
        const senderUserId = userId || currentUserId;
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

        const adminNotifId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : `admin_notif_${now}_${Math.random().toString(36).substring(2, 9)}`;

        const adminNotif = {
            id: String(adminNotifId),
            recipient_id: null,
            actor_id: isUuid(senderUserId) ? senderUserId : null,
            target_role: NOTIFICATION_TARGET_ROLES.ADMIN,
            title: title || 'New User Submission',
            message: message || '',
            type: type || NOTIFICATION_TYPES.ADMIN_MESSAGE,
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            action_url: resolvedActionUrl,
            metadata: {
                ...metadata,
                senderId: senderUserId,
                senderEmail: senderEmail,
                senderName: senderName,
                submittedAt: new Date().toISOString()
            },
            channel: NOTIFICATION_CHANNELS.BOTH,
            is_read: false,
            read_at: null,
            email_status: 'pending',
            idempotency_key: dedupKey,
            created_at: new Date().toISOString()
        };

        // 1. Persist to Supabase notifications table
        if (supabase) {
            try {
                await supabase.from('notifications').insert({
                    id: adminNotif.id,
                    recipient_id: null,
                    actor_id: adminNotif.actor_id,
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
                    email_status: 'pending',
                    idempotency_key: adminNotif.idempotency_key,
                    created_at: adminNotif.created_at
                });
            } catch (err) {
                console.warn('[Supabase admin notification insert error]:', err);
            }
        }

        // 2. Dispatch DOM events for live admin dashboards
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nxt:new_admin_notification', { detail: adminNotif }));
            window.dispatchEvent(new CustomEvent('nxt:new_notification', { detail: adminNotif }));
        }

        // 3. Asynchronous Admin Email Alert (Non-blocking background flow)
        sendEmailNotification({
            to: 'admin@nextkinlife.com',
            type: adminNotif.type,
            title: `[ADMIN ALERT] ${adminNotif.title}`,
            message: `${adminNotif.message}\n\nSubmitted by: ${senderName} (${senderEmail})`,
            actionUrl: adminNotif.action_url,
            entityId: adminNotif.entity_id,
            metadata: adminNotif.metadata,
            notificationId: adminNotif.id
        }).catch((err) => {
            console.warn('[Admin alert email error]:', err);
        });

        return adminNotif;
    } catch (err) {
        console.error('Error in notifyAdminsOfUserSubmission:', err);
        return null;
    }
}

/**
 * Retrieve all notifications for administrators from Supabase
 */
export async function getAdminNotifications(queryParams = {}) {
    try {
        let notifications = [];

        if (supabase) {
            try {
                let query = supabase
                    .from('notifications')
                    .select(NOTIFICATION_COLUMNS)
                    .eq('target_role', 'admin')
                    .order('created_at', { ascending: false })
                    .limit(parseInt(queryParams?.limit, 10) || 100);

                if (queryParams?.unreadOnly === 'true' || queryParams?.status === 'unread') {
                    query = query.eq('is_read', false);
                }

                const { data: dbNotifs, error } = await query;
                if (!error && Array.isArray(dbNotifs)) {
                    notifications = dbNotifs.map((n) => ({
                        ...n,
                        link: n.action_url,
                        read: n.is_read,
                        createdAt: n.created_at
                    }));
                } else if (error) {
                    console.warn('[Supabase admin notifications query error]:', error);
                }
            } catch (err) {
                console.warn('[Supabase admin notifications fetch note]:', err);
            }
        }

        const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

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
        if (!notificationId) return { success: false };
        const nowIso = new Date().toISOString();

        if (supabase) {
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: nowIso })
                .eq('id', notificationId)
                .eq('target_role', 'admin');
        }

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
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: nowIso })
                .eq('target_role', 'admin')
                .eq('is_read', false);
        }

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
        if (!notificationId) return { success: false };

        if (supabase) {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('target_role', 'admin');
        }

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
            await supabase
                .from('notifications')
                .delete()
                .eq('target_role', 'admin');
        }

        return { success: true };
    } catch (err) {
        console.error('Delete all admin notifications error:', err);
        return { success: false };
    }
}
