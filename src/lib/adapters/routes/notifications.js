import { 
    getUserNotifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotificationItem, 
    deleteAllNotificationsItems,
    createInAppAndEmailNotification 
} from '../notificationUtils';

export async function handleNotificationsRoute({ cleanUrl, method, body }) {
    // ── 10. NOTIFICATIONS ────────────────────────────────────────
    if (cleanUrl.startsWith('notifications') || cleanUrl.startsWith('admin/notifications')) {
        // Mark all as read: PATCH/POST notifications/read-all
        if ((cleanUrl.includes('read-all') || cleanUrl.includes('mark-all')) && (method === 'PATCH' || method === 'POST' || method === 'PUT')) {
            const result = await markAllNotificationsRead();
            return { data: { success: true, ...result } };
        }

        // Mark single as read: PATCH/POST notifications/:id/read
        if (cleanUrl.includes('/read') && (method === 'PATCH' || method === 'POST' || method === 'PUT')) {
            const parts = cleanUrl.split('/');
            const id = parts[1] || parts[parts.indexOf('read') - 1];
            const result = await markNotificationRead(id);
            return { data: { success: true, ...result } };
        }

        // Delete all notifications: DELETE notifications/all
        if (cleanUrl.endsWith('/all') && method === 'DELETE') {
            const result = await deleteAllNotificationsItems();
            return { data: { success: true, ...result } };
        }

        // Delete single notification: DELETE notifications/:id
        if (method === 'DELETE') {
            const parts = cleanUrl.split('/');
            const id = parts.pop();
            const result = await deleteNotificationItem(id);
            return { data: { success: true, ...result } };
        }

        // Create notification manually: POST notifications
        if (method === 'POST') {
            const notif = await createInAppAndEmailNotification(body || {});
            return { data: { success: true, notification: notif } };
        }

        // Get notifications: GET notifications
        const result = await getUserNotifications();
        return { 
            data: { 
                notifications: result.notifications, 
                unreadCount: result.unreadCount, 
                data: result.notifications 
            } 
        };
    }
    return null;
}
