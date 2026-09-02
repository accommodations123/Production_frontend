import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const eventService = {
    async getApprovedEvents(params) {
        const res = await executeSupabaseRequest({
            url: 'events/approved',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch approved events');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.events || raw?.data || []);
        list.events = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async getEventById(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `events/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch event');
        return res.data;
    },

    async createEvent(formData) {
        const res = await executeSupabaseRequest({
            url: 'events/create',
            method: 'POST',
            body: formData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create event');
        return res.data;
    },

    async getMyEvents() {
        const res = await executeSupabaseRequest({
            url: 'events/my-events',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my events');
        return res.data;
    },

    async deleteEvent(id) {
        const res = await executeSupabaseRequest({
            url: `events/${id}`,
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete event');
        return res.data;
    },

    async joinEvent(id) {
        const res = await executeSupabaseRequest({
            url: `events/${id}/join`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to join event');
        return res.data;
    },

    async leaveEvent(id) {
        const res = await executeSupabaseRequest({
            url: `events/${id}/leave`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to leave event');
        return res.data;
    },

    async getEventReviews(id) {
        const res = await executeSupabaseRequest({
            url: `events/${id}/reviews`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch reviews');
        return res.data;
    },

    async addEventReview({ id, reviewData }) {
        const res = await executeSupabaseRequest({
            url: `events/${id}/reviews`,
            method: 'POST',
            body: reviewData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to add review');
        return res.data;
    },

    async getEventRating(id) {
        const res = await executeSupabaseRequest({
            url: `events/${id}/rating`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch rating');
        return res.data;
    },

    async hideEventReview({ eventId, reviewId }) {
        const res = await executeSupabaseRequest({
            url: `events/${eventId}/reviews/${reviewId}/hide`,
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to hide review');
        return res.data;
    },
};

export default eventService;
