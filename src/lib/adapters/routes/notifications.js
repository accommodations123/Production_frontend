import { 
    getUserNotifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotificationItem, 
    deleteAllNotificationsItems,
    createInAppAndEmailNotification,
    notifyAdminsOfUserSubmission,
    getAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    deleteAdminNotificationItem,
    deleteAllAdminNotificationsItems
} from '../notificationUtils';

export async function handleNotificationsRoute({ cleanUrl, method, body, queryParams }) {
    // ── 10. NOTIFICATIONS ────────────────────────────────────────
    if (cleanUrl.startsWith('notifications') || cleanUrl.startsWith('admin/notifications') || cleanUrl.startsWith('notification')) {
        const isAdmin = cleanUrl.startsWith('admin/notifications') || queryParams?.role === 'admin' || queryParams?.target_role === 'admin';

        // Mark all as read: PATCH/POST notifications/read-all, notifications/mark-all-read, etc.
        if ((cleanUrl.includes('read-all') || cleanUrl.includes('mark-all')) && (method === 'PATCH' || method === 'POST' || method === 'PUT')) {
            const result = isAdmin ? await markAllAdminNotificationsRead() : await markAllNotificationsRead();
            return { data: { success: true, ...result } };
        }

        // Mark single as read: PATCH/POST notifications/:id/read or PATCH notifications/:id
        if (cleanUrl.includes('/read') && (method === 'PATCH' || method === 'POST' || method === 'PUT')) {
            const parts = cleanUrl.split('/');
            const id = parts[1] || parts[parts.indexOf('read') - 1];
            const result = isAdmin ? await markAdminNotificationRead(id) : await markNotificationRead(id);
            return { data: { success: true, ...result } };
        }

        if ((method === 'PATCH' || method === 'PUT') && !cleanUrl.includes('read-all')) {
            const parts = cleanUrl.split('/');
            const id = parts.pop();
            const result = isAdmin ? await markAdminNotificationRead(id) : await markNotificationRead(id);
            return { data: { success: true, ...result } };
        }

        // Delete all notifications: DELETE notifications/all
        if (cleanUrl.endsWith('/all') && method === 'DELETE') {
            const result = isAdmin ? await deleteAllAdminNotificationsItems() : await deleteAllNotificationsItems();
            return { data: { success: true, ...result } };
        }

        // Delete single notification: DELETE notifications/:id
        if (method === 'DELETE') {
            const parts = cleanUrl.split('/');
            const id = parts.pop();
            const result = isAdmin ? await deleteAdminNotificationItem(id) : await deleteNotificationItem(id);
            return { data: { success: true, ...result } };
        }

        // Create notification manually: POST notifications
        if (method === 'POST') {
            if (isAdmin || body?.target_role === 'admin') {
                const notif = await notifyAdminsOfUserSubmission(body || {});
                return { data: { success: true, notification: notif } };
            }
            const notif = await createInAppAndEmailNotification(body || {});
            return { data: { success: true, notification: notif } };
        }

        // Get notifications: GET admin/notifications OR GET notifications
        const result = isAdmin ? await getAdminNotifications(queryParams) : await getUserNotifications(undefined, undefined, queryParams);
        return { 
            data: { 
                notifications: result.notifications, 
                unreadCount: result.unreadCount, 
                data: result.notifications,
                total: result.total || result.notifications.length,
                success: true
            } 
        };
    }
    return undefined;
}
