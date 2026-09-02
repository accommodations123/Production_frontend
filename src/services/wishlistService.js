import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const wishlistService = {
    async getWishlist(params) {
        const res = await executeSupabaseRequest({
            url: 'wishlist',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch wishlist');
        return res.data;
    },

    async checkWishlistStatus(params) {
        const res = await executeSupabaseRequest({
            url: 'wishlist/check',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to check wishlist status');
        return res.data;
    },

    async addToWishlist(itemData) {
        const res = await executeSupabaseRequest({
            url: 'wishlist/add',
            method: 'POST',
            body: itemData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to add to wishlist');
        return res.data;
    },

    async removeFromWishlist(itemData) {
        const res = await executeSupabaseRequest({
            url: 'wishlist/remove',
            method: 'DELETE',
            body: itemData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to remove from wishlist');
        return res.data;
    },

    async toggleWishlist(itemData) {
        const res = await executeSupabaseRequest({
            url: 'wishlist/toggle',
            method: 'POST',
            body: itemData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to toggle wishlist');
        return res.data;
    },
};

export default wishlistService;
