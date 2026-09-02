import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { hostService } from '@/services/hostService';

// Direct host domain hooks
export function useSaveHostMutation(options) {
    return useMutation(hostService.saveHost, { invalidatesTags: ['Host'], ...options });
}

export function useUpdateHostMutation(options) {
    return useMutation(hostService.updateHost, { invalidatesTags: ['Host'], ...options });
}

export function useGetHostProfileQuery(args, options) {
    return useQuery(hostService.getHostProfile, args, { tags: ['Host'], ...options });
}

export function useGetApprovedHostDetailsQuery(country, options) {
    return useQuery(() => hostService.getApprovedHostDetails(country), country, { tags: ['Host'], ...options });
}

export function useGetPendingHostsQuery(args, options) {
    return useQuery(hostService.getPendingHosts, args, { tags: ['Host'], ...options });
}

export function useGetRejectedHostsQuery(args, options) {
    return useQuery(hostService.getRejectedHosts, args, { tags: ['Host'], ...options });
}

export function useApproveHostMutation(options) {
    return useMutation(hostService.approveHost, { invalidatesTags: ['Host'], ...options });
}

export function useRejectHostMutation(options) {
    return useMutation(hostService.rejectHost, { invalidatesTags: ['Host'], ...options });
}

// Community hooks
export function useCreateCommunityMutation(options) {
    return useMutation(async (data) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community/create', method: 'POST', body: data });
        if (res.error) throw new Error(res.error.error || 'Failed to create community');
        return res.data;
    }, { invalidatesTags: ['Community', 'Host'], ...options });
}

export function useCreateCommunityContributionMutation(options) {
    return useMutation(async (data) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community/contribution', method: 'POST', body: data });
        if (res.error) throw new Error(res.error.error || 'Failed to create community contribution');
        return res.data;
    }, { invalidatesTags: ['Community', 'Host'], ...options });
}

export function useGetCommunitiesQuery(params, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community', method: 'GET', params });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch communities');
        return res.data;
    }, params, { tags: ['Community'], ...options });
}

export function useGetMyCommunitiesQuery(args, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community/my-communities', method: 'GET' });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my communities');
        return res.data;
    }, args, { tags: ['Community'], ...options });
}

export function useGetCommunityByIdQuery(id, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}`, method: 'GET' });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch community');
        return res.data;
    }, id, { tags: ['Community'], ...options });
}

export function useJoinCommunityMutation(options) {
    return useMutation(async (id) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/join`, method: 'POST' });
        if (res.error) throw new Error(res.error.error || 'Failed to join community');
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useLeaveCommunityMutation(options) {
    return useMutation(async (id) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/leave`, method: 'POST' });
        if (res.error) throw new Error(res.error.error || 'Failed to leave community');
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useUpdateCommunityMutation(options) {
    return useMutation(async ({ id, data }) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}`, method: 'PUT', body: data });
        if (res.error) throw new Error(res.error.error || 'Failed to update community');
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useGetCommunityMembersQuery(id, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/members`, method: 'GET' });
        return res.data;
    }, id, options);
}

export function useGetCommunityHostMembersQuery(id, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/host-members`, method: 'GET' });
        return res.data;
    }, id, options);
}

export function useCreateCommunityPostMutation(options) {
    return useMutation(async (data) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community/posts', method: 'POST', body: data });
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useGetCommunityFeedQuery(id, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/feed`, method: 'GET' });
        return res.data;
    }, id, { tags: ['Community'], ...options });
}

export function useDeleteCommunityPostMutation(options) {
    return useMutation(async (id) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/posts/${id}`, method: 'DELETE' });
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useAddCommunityResourceMutation(options) {
    return useMutation(async (data) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: 'community/resources', method: 'POST', body: data });
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

export function useGetCommunityResourcesQuery(id, options) {
    return useQuery(async () => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/${id}/resources`, method: 'GET' });
        return res.data;
    }, id, { tags: ['Community'], ...options });
}

export function useDeleteCommunityResourceMutation(options) {
    return useMutation(async (id) => {
        const { executeSupabaseRequest } = await import('@/lib/supabaseAdapter');
        const res = await executeSupabaseRequest({ url: `community/resources/${id}`, method: 'DELETE' });
        return res.data;
    }, { invalidatesTags: ['Community'], ...options });
}

// Re-exports of cross-domain hooks historically imported from hostApi
export {
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetMyTripsQuery,
    useGetPublicTripsQuery,
    useSearchTripsQuery,
    useLazySearchTripsQuery,
    useCreateTripMutation,
} from './useAuthHooks';

export {
    useGetApprovedPropertiesQuery,
    useGetAllPropertiesQuery,
    useGetMyListingsQuery,
    useGetPropertyByIdQuery,
    useUploadFileMutation,
    useCreatePropertyDraftMutation,
    useUpdatePropertyBasicMutation,
    useUpdatePropertyAddressMutation,
    useUpdatePropertyPricingMutation,
    useUpdatePropertyAmenitiesMutation,
    useUpdatePropertyRulesMutation,
    useUpdatePropertyMediaMutation,
    useUpdatePropertyVideoMutation,
    useSubmitPropertyMutation,
    useDeletePropertyMutation,
} from './usePropertyHooks';

export {
    useGetApprovedEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useGetMyEventsQuery,
    useDeleteEventMutation,
    useGetEventReviewsQuery,
    useAddEventReviewMutation,
    useGetEventRatingQuery,
    useHideEventReviewMutation,
    useJoinEventMutation,
    useLeaveEventMutation,
} from './useEventHooks';

export {
    useCreateBuySellMutation,
    useGetBuySellListingsQuery,
    useGetBuySellByIdQuery,
    useGetMyBuySellListingsQuery,
    useUpdateBuySellMutation,
    useMarkBuySellAsSoldMutation,
    useDeleteBuySellMutation,
} from './useMarketplaceHooks';

export {
    useGetJobsQuery,
    useGetJobByIdQuery,
    useApplyForJobMutation,
    useGetMyApplicationsQuery,
} from './useCareerHooks';

export {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
} from './useNotificationHooks';

export {
    useGetWishlistQuery,
    useCheckWishlistStatusQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useToggleWishlistMutation,
} from './useWishlistHooks';
