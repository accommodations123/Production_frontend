import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const connectionService = {
    async sendConnectionRequest(data) {
        const res = await executeSupabaseRequest({
            url: 'connection-request/send',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to send connection request');
        return res.data;
    },

    async getIncomingRequests() {
        const res = await executeSupabaseRequest({
            url: 'connection-request/my-requests',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch incoming requests');
        return res.data;
    },

    async getConnectionStatus(params) {
        const res = await executeSupabaseRequest({
            url: 'connection-request/status',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch connection status');
        return res.data;
    },

    async updateRequestStatus({ requestId, status }) {
        const res = await executeSupabaseRequest({
            url: `connection-request/${requestId}/status`,
            method: 'PATCH',
            body: { status },
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update request status');
        return res.data;
    },
};

export default connectionService;
