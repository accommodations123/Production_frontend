import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const buySellService = {
    async createBuySell(data) {
        const res = await executeSupabaseRequest({
            url: 'buy-sell/create',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create listing');
        return res.data;
    },

    async getBuySellListings(params) {
        const res = await executeSupabaseRequest({
            url: 'buy-sell/approved',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch listings');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.listings || raw?.items || raw?.data || []);
        list.listings = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async getBuySellById(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `buy-sell/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch listing');
        return res.data;
    },

    async getMyBuySellListings() {
        const res = await executeSupabaseRequest({
            url: 'buy-sell/my-listings',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my listings');
        return res.data;
    },

    async updateBuySell({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `buy-sell/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update listing');
        return res.data;
    },

    async markBuySellAsSold(id) {
        const res = await executeSupabaseRequest({
            url: `buy-sell/sold/${id}`,
            method: 'PUT',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to mark as sold');
        return res.data;
    },

    async deleteBuySell(id) {
        const res = await executeSupabaseRequest({
            url: `buy-sell/${id}`,
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete listing');
        return res.data;
    },
};

export default buySellService;
