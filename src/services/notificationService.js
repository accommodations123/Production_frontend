import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const notificationService = {
    async getNotifications() {
        const res = await executeSupabaseRequest({
            url: 'notifications',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch notifications');
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.notifications)) return raw.notifications;
        return [];
    },

    async markNotificationAsRead(id) {
        const res = await executeSupabaseRequest({
            url: `notifications/${id}/read`,
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to mark notification as read');
        return res.data;
    },

    async markAllNotificationsAsRead() {
        const res = await executeSupabaseRequest({
            url: 'notifications/read-all',
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to mark all notifications as read');
        return res.data;
    },

    async deleteNotification(id) {
        const res = await executeSupabaseRequest({
            url: `notifications/${id}`,
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete notification');
        return res.data;
    },

    async deleteAllNotifications() {
        const res = await executeSupabaseRequest({
            url: 'notifications/all',
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete all notifications');
        return res.data;
    },
};

export default notificationService;
