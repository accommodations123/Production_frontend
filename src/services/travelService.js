import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const travelService = {
    async getMyTrips() {
        const res = await executeSupabaseRequest({
            url: 'travel/trips/me',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my trips');
        return res.data;
    },

    async createTrip(data) {
        const res = await executeSupabaseRequest({
            url: 'travel/trips',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create trip');
        return res.data;
    },

    async searchTrips(params) {
        const res = await executeSupabaseRequest({
            url: 'travel/trips/search',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to search trips');
        return res.data;
    },

    async travelMatchAction(data) {
        const res = await executeSupabaseRequest({
            url: 'travel/matches/action',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update trip match action');
        return res.data;
    },

    async getPublicTrips(params) {
        const res = await executeSupabaseRequest({
            url: 'travel/trips',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch public trips');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.trips || raw?.results || raw?.data || []);
        list.trips = list;
        list.results = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async getPublicSearchTrips(params) {
        const res = await executeSupabaseRequest({
            url: 'travel/trips/search',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to search public trips');
        return res.data;
    },

    async getPublicTrip(tripId) {
        if (!tripId) return null;
        const res = await executeSupabaseRequest({
            url: `travel/trips/${tripId}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch trip');
        return res.data;
    },
};

export default travelService;
