import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { notificationService } from '@/services/notificationService';

export function useGetNotificationsQuery(args, options) {
    return useQuery(notificationService.getNotifications, args, { tags: ['Notification'], ...options });
}

export function useMarkNotificationAsReadMutation(options) {
    return useMutation(notificationService.markNotificationAsRead, { invalidatesTags: ['Notification'], ...options });
}

export function useMarkAllNotificationsAsReadMutation(options) {
    return useMutation(notificationService.markAllNotificationsAsRead, { invalidatesTags: ['Notification'], ...options });
}

export function useDeleteNotificationMutation(options) {
    return useMutation(notificationService.deleteNotification, { invalidatesTags: ['Notification'], ...options });
}

export function useDeleteAllNotificationsMutation(options) {
    return useMutation(notificationService.deleteAllNotifications, { invalidatesTags: ['Notification'], ...options });
}
