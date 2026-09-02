import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { connectionService } from '@/services/connectionService';

export function useSendConnectionRequestMutation(options) {
    return useMutation(connectionService.sendConnectionRequest, { invalidatesTags: ['ConnectionRequests'], ...options });
}

export function useGetIncomingRequestsQuery(args, options) {
    return useQuery(connectionService.getIncomingRequests, args, { tags: ['ConnectionRequests'], ...options });
}

export function useGetConnectionStatusQuery(params, options) {
    return useQuery(connectionService.getConnectionStatus, params, { tags: ['ConnectionRequests'], ...options });
}

export function useUpdateRequestStatusMutation(options) {
    return useMutation(connectionService.updateRequestStatus, { invalidatesTags: ['ConnectionRequests'], ...options });
}
