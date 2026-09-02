import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const stayRequestService = {
    async getPublicStayRequests(params) {
        const res = await executeSupabaseRequest({
            url: 'stay-requests',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch stay requests');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.requests || raw?.data || []);
        list.requests = list;
        list.data = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async searchStayRequests(params) {
        const res = await executeSupabaseRequest({
            url: 'stay-requests/search',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to search stay requests');
        return res.data;
    },

    async getStayRequestById(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `stay-requests/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch stay request');
        return res.data;
    },

    async getOffersForRequest(id) {
        const res = await executeSupabaseRequest({
            url: `stay-requests/${id}/offers`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch offers');
        return res.data;
    },

    async getMyStayRequests() {
        const res = await executeSupabaseRequest({
            url: 'stay-requests/my-requests',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my requests');
        return res.data;
    },

    async getMyOffers() {
        const res = await executeSupabaseRequest({
            url: 'stay-requests/my-offers',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my offers');
        return res.data;
    },

    async createStayRequest(data) {
        const res = await executeSupabaseRequest({
            url: 'stay-request/create',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create stay request');
        return res.data;
    },

    async updateStayRequest({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `stay-requests/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update stay request');
        return res.data;
    },

    async deleteStayRequest(id) {
        const res = await executeSupabaseRequest({
            url: `stay-requests/${id}`,
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete stay request');
        return res.data;
    },

    async createStayOffer({ requestId, data }) {
        const res = await executeSupabaseRequest({
            url: `stay-requests/${requestId}/offers`,
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create stay offer');
        return res.data;
    },

    async reportStayRequest({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `stay-requests/${id}/report`,
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to report stay request');
        return res.data;
    },
};

export default stayRequestService;
