import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const propertyService = {
    async getApprovedProperties(params) {
        const res = await executeSupabaseRequest({
            url: 'property/approved',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch approved properties');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.properties || raw?.data || []);
        list.properties = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async getAllProperties(params) {
        const res = await executeSupabaseRequest({
            url: 'property/approved',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch properties');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.properties || raw?.data || []);
        list.properties = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async getMyListings() {
        const res = await executeSupabaseRequest({
            url: 'property/my-listings',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my listings');
        return res.data;
    },

    async getPropertyById(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `property/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch property');
        const raw = res.data;
        if (raw?.property) return raw;
        return { property: raw, ...raw };
    },

    async createPropertyDraft(data) {
        const res = await executeSupabaseRequest({
            url: 'property/create-draft',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create property draft');
        return res.data;
    },

    async updatePropertyBasic({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `property/basic-info/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update basic info');
        return res.data;
    },

    async updatePropertyAddress({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `property/address/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update address');
        return res.data;
    },

    async updatePropertyPricing({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `property/pricing/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update pricing');
        return res.data;
    },

    async updatePropertyAmenities({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `property/amenities/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update amenities');
        return res.data;
    },

    async updatePropertyRules({ id, data }) {
        const res = await executeSupabaseRequest({
            url: `property/rules/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update rules');
        return res.data;
    },

    async updatePropertyMedia(params) {
        const id = params?.id || (typeof params === 'string' ? params : null);
        const data = params?.formData || params?.data || params?.body || params;
        const res = await executeSupabaseRequest({
            url: `property/media/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update media');
        return res.data;
    },

    async updatePropertyVideo(params) {
        const id = params?.id || (typeof params === 'string' ? params : null);
        const data = params?.formData || params?.data || params?.body || params;
        const res = await executeSupabaseRequest({
            url: `property/video/${id}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update video');
        return res.data;
    },

    async submitProperty(id) {
        const res = await executeSupabaseRequest({
            url: `property/submit/${id}`,
            method: 'PUT',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to submit property');
        return res.data;
    },

    async deleteProperty({ id, reason }) {
        const res = await executeSupabaseRequest({
            url: `property/delete/${id}`,
            method: 'DELETE',
            body: { reason: reason || 'User deleted from dashboard' },
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete property');
        return res.data;
    },

    async uploadFile(formData) {
        const res = await executeSupabaseRequest({
            url: 'upload',
            method: 'POST',
            body: formData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to upload file');
        return res.data;
    },
};

export default propertyService;
