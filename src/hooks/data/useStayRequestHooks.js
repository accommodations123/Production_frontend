import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { stayRequestService } from '@/services/stayRequestService';

export function useGetPublicStayRequestsQuery(params, options) {
    return useQuery(stayRequestService.getPublicStayRequests, params, { tags: ['StayRequests'], ...options });
}

export function useSearchStayRequestsQuery(params, options) {
    return useQuery(stayRequestService.searchStayRequests, params, options);
}

export function useGetStayRequestByIdQuery(id, options) {
    return useQuery(() => stayRequestService.getStayRequestById(id), id, { tags: ['StayRequests'], ...options });
}

export function useGetOffersForRequestQuery(id, options) {
    return useQuery(() => stayRequestService.getOffersForRequest(id), id, options);
}

export function useGetMyStayRequestsQuery(args, options) {
    return useQuery(stayRequestService.getMyStayRequests, args, { tags: ['StayRequests'], ...options });
}

export function useGetMyOffersQuery(args, options) {
    return useQuery(stayRequestService.getMyOffers, args, options);
}

export function useCreateStayRequestMutation(options) {
    return useMutation(stayRequestService.createStayRequest, { invalidatesTags: ['StayRequests'], ...options });
}

export function useUpdateStayRequestMutation(options) {
    return useMutation(stayRequestService.updateStayRequest, { invalidatesTags: ['StayRequests'], ...options });
}

export function useDeleteStayRequestMutation(options) {
    return useMutation(stayRequestService.deleteStayRequest, { invalidatesTags: ['StayRequests'], ...options });
}

export function useCreateStayOfferMutation(options) {
    return useMutation(stayRequestService.createStayOffer, { invalidatesTags: ['StayRequests'], ...options });
}

export function useReportStayRequestMutation(options) {
    return useMutation(stayRequestService.reportStayRequest, options);
}
