import { executeSupabaseRequest } from '@/lib/supabaseAdapter';
import { CLOUDFRONT_BASE } from '@/lib/imageUtils';

export const hostService = {
    async getHostProfile() {
        const res = await executeSupabaseRequest({
            url: 'host/get',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch host profile');
        
        const host = res.data?.host || res.data?.data || res.data;
        if (host && typeof host === 'object') {
            const fixImage = (img) => {
                if (img && typeof img === 'string' && !img.startsWith('http')) {
                    return `${CLOUDFRONT_BASE}${img.startsWith('/') ? img : `/${img}`}`;
                }
                return img;
            };
            if (host.profile_image) host.profile_image = fixImage(host.profile_image);
            if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
        }
        return host;
    },

    async saveHost(hostData) {
        const res = await executeSupabaseRequest({
            url: 'host/save',
            method: 'POST',
            body: hostData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to save host details');
        return res.data;
    },

    async updateHost({ hostId, data }) {
        const res = await executeSupabaseRequest({
            url: `host/update/${hostId}`,
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update host');
        return res.data;
    },

    async getApprovedHostDetails(country) {
        const res = await executeSupabaseRequest({
            url: 'admin/approved/approved-host-details',
            method: 'GET',
            params: country ? { country } : undefined,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch approved hosts');
        
        const hosts = res.data?.data || res.data?.hosts || res.data || [];
        const fixImage = (img) => {
            if (img && typeof img === 'string' && !img.startsWith('http')) {
                return `${CLOUDFRONT_BASE}${img.startsWith('/') ? img : `/${img}`}`;
            }
            return img;
        };
        if (Array.isArray(hosts)) {
            return hosts.map(h => {
                const host = { ...h };
                if (host.profile_image) host.profile_image = fixImage(host.profile_image);
                if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo);
                return host;
            });
        }
        return hosts;
    },

    async getPendingHosts() {
        const res = await executeSupabaseRequest({
            url: 'admin/pending/pending-host',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch pending hosts');
        return res.data;
    },

    async getRejectedHosts() {
        const res = await executeSupabaseRequest({
            url: 'admin/rejected/rejected-host',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch rejected hosts');
        return res.data;
    },

    async approveHost(id) {
        const res = await executeSupabaseRequest({
            url: `host/approve/${id}`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to approve host');
        return res.data;
    },

    async rejectHost(id) {
        const res = await executeSupabaseRequest({
            url: `host/reject/${id}`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to reject host');
        return res.data;
    },
};

export default hostService;
