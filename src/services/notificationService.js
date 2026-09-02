import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const notificationService = {
    async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `notifications?${query}` : 'notifications';
        const res = await executeSupabaseRequest({
            url,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch notifications');
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.notifications)) return raw.notifications;
        if (Array.isArray(raw?.data)) return raw.data;
        return [];
    },

    async getAdminNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `admin/notifications?${query}` : 'admin/notifications';
        const res = await executeSupabaseRequest({
            url,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch admin notifications');
        const raw = res.data;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.notifications)) return raw.notifications;
        if (Array.isArray(raw?.data)) return raw.data;
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

    async markAdminNotificationAsRead(id) {
        const res = await executeSupabaseRequest({
            url: `admin/notifications/${id}/read`,
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to mark admin notification as read');
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

    async markAllAdminNotificationsAsRead() {
        const res = await executeSupabaseRequest({
            url: 'admin/notifications/read-all',
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to mark all admin notifications as read');
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

    async deleteAdminNotification(id) {
        const res = await executeSupabaseRequest({
            url: `admin/notifications/${id}`,
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete admin notification');
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

    async deleteAllAdminNotifications() {
        const res = await executeSupabaseRequest({
            url: 'admin/notifications/all',
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete all admin notifications');
        return res.data;
    }
};

export default notificationService;
