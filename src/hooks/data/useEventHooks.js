import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { eventService } from '@/services/eventService';

export function useGetApprovedEventsQuery(params, options) {
    return useQuery(eventService.getApprovedEvents, params, { tags: ['Event'], ...options });
}

export function useGetEventByIdQuery(id, options) {
    return useQuery(() => eventService.getEventById(id), id, { tags: ['Event'], ...options });
}

export function useCreateEventMutation(options) {
    return useMutation(eventService.createEvent, { invalidatesTags: ['Event'], ...options });
}

export function useGetMyEventsQuery(args, options) {
    return useQuery(eventService.getMyEvents, args, { tags: ['Event'], ...options });
}

export function useDeleteEventMutation(options) {
    return useMutation(eventService.deleteEvent, { invalidatesTags: ['Event'], ...options });
}

export function useJoinEventMutation(options) {
    return useMutation(eventService.joinEvent, { invalidatesTags: ['Event'], ...options });
}

export function useLeaveEventMutation(options) {
    return useMutation(eventService.leaveEvent, { invalidatesTags: ['Event'], ...options });
}

export function useGetEventReviewsQuery(id, options) {
    return useQuery(() => eventService.getEventReviews(id), id, { tags: ['Review', 'Event'], ...options });
}

export function useAddEventReviewMutation(options) {
    return useMutation(eventService.addEventReview, { invalidatesTags: ['Review', 'Event'], ...options });
}

export function useGetEventRatingQuery(id, options) {
    return useQuery(() => eventService.getEventRating(id), id, { tags: ['Review', 'Event'], ...options });
}

export function useHideEventReviewMutation(options) {
    return useMutation(eventService.hideEventReview, { invalidatesTags: ['Review', 'Event'], ...options });
}
