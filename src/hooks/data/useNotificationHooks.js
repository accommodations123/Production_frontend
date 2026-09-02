import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { notificationService } from '@/services/notificationService';

export function useGetNotificationsQuery(args, options) {
    return useQuery(notificationService.getNotifications, args, { tags: ['Notification'], ...options });
}

export function useGetAdminNotificationsQuery(args, options) {
    return useQuery(notificationService.getAdminNotifications, args, { tags: ['AdminNotification'], ...options });
}

export function useMarkNotificationAsReadMutation(options) {
    return useMutation(notificationService.markNotificationAsRead, { invalidatesTags: ['Notification'], ...options });
}

export function useMarkAdminNotificationAsReadMutation(options) {
    return useMutation(notificationService.markAdminNotificationAsRead, { invalidatesTags: ['AdminNotification'], ...options });
}

export function useMarkAllNotificationsAsReadMutation(options) {
    return useMutation(notificationService.markAllNotificationsAsRead, { invalidatesTags: ['Notification'], ...options });
}

export function useMarkAllAdminNotificationsAsReadMutation(options) {
    return useMutation(notificationService.markAllAdminNotificationsAsRead, { invalidatesTags: ['AdminNotification'], ...options });
}

export function useDeleteNotificationMutation(options) {
    return useMutation(notificationService.deleteNotification, { invalidatesTags: ['Notification'], ...options });
}

export function useDeleteAdminNotificationMutation(options) {
    return useMutation(notificationService.deleteAdminNotification, { invalidatesTags: ['AdminNotification'], ...options });
}

export function useDeleteAllNotificationsMutation(options) {
    return useMutation(notificationService.deleteAllNotifications, { invalidatesTags: ['Notification'], ...options });
}

export function useDeleteAllAdminNotificationsMutation(options) {
    return useMutation(notificationService.deleteAllAdminNotifications, { invalidatesTags: ['AdminNotification'], ...options });
}
