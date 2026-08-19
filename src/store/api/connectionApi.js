import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const connectionApi = createApi({
    reducerPath: 'connectionApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['ConnectionRequests'],
    endpoints: (builder) => ({
        sendConnectionRequest: builder.mutation({
            query: (data) => ({
                url: 'connection-requests',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => {
                const targetUserId = arg?.targetUserId;
                const resultTargetId = result?.data?.targetUserId;
                const itemId = arg?.itemId || result?.data?.itemId;
                const tags = [{ type: 'ConnectionRequests', id: 'LIST' }];
                if (targetUserId) {
                    if (itemId) tags.push({ type: 'ConnectionRequests', id: `${targetUserId}_${itemId}` });
                    tags.push({ type: 'ConnectionRequests', id: `${targetUserId}` });
                }
                if (resultTargetId && String(resultTargetId) !== String(targetUserId)) {
                    if (itemId) tags.push({ type: 'ConnectionRequests', id: `${resultTargetId}_${itemId}` });
                    tags.push({ type: 'ConnectionRequests', id: `${resultTargetId}` });
                }
                return tags;
            },
        }),

        getIncomingRequests: builder.query({
            query: (params) => {
                const page = params?.page || 1;
                const limit = params?.limit || 10;
                return `connection-requests/incoming?page=${page}&limit=${limit}`;
            },
            providesTags: [{ type: 'ConnectionRequests', id: 'LIST' }],
        }),

        getConnectionStatus: builder.query({
            query: (args) => {
                if (typeof args === 'object' && args !== null) {
                    const { targetUserId, itemId, itemType } = args;
                    const params = new URLSearchParams();
                    if (itemId) params.append('itemId', itemId);
                    if (itemType) params.append('itemType', itemType);
                    const qs = params.toString();
                    const target = targetUserId || 'any';
                    return `connection-requests/status/${encodeURIComponent(target)}${qs ? `?${qs}` : ''}`;
                }
                return `connection-requests/status/${args}`;
            },
            providesTags: (result, error, args) => {
                const targetUserId = typeof args === 'object' && args !== null ? args.targetUserId : args;
                const itemId = typeof args === 'object' && args !== null ? args.itemId : '';
                return [
                    { type: 'ConnectionRequests', id: itemId ? `${targetUserId}_${itemId}` : `${targetUserId}` },
                    { type: 'ConnectionRequests', id: 'STATUS' }
                ];
            },
        }),

        updateRequestStatus: builder.mutation({
            async queryFn({ requestId, id, status, action }, _queryApi, _extraOptions, fetchWithBQ) {
                const reqId = requestId || id;
                const finalStatus = status || action || 'accepted';
                
                // Primary PATCH attempt
                let result = await fetchWithBQ({
                    url: `connection-requests/${reqId}/status`,
                    method: 'PATCH',
                    body: { status: finalStatus, action: finalStatus },
                });

                // If method PATCH is blocked or fails, fallback to PUT
                if (result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 405)) {
                    result = await fetchWithBQ({
                        url: `connection-requests/${reqId}/status`,
                        method: 'PUT',
                        body: { status: finalStatus, action: finalStatus },
                    });
                }

                return result.data ? { data: result.data } : { error: result.error };
            },
            invalidatesTags: [
                { type: 'ConnectionRequests', id: 'LIST' },
                { type: 'ConnectionRequests', id: 'STATUS' },
                'ConnectionRequests',
            ],
        }),
    }),
})

export const {
    useSendConnectionRequestMutation,
    useGetIncomingRequestsQuery,
    useGetConnectionStatusQuery,
    useUpdateRequestStatusMutation,
} = connectionApi
