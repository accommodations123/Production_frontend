import { useQuery, useLazyQuery } from './useQuery';
import { useMutation } from './useMutation';
import { authService } from '@/services/authService';
import { travelService } from '@/services/travelService';

export function useLoginMutation(options) {
    return useMutation(authService.login, { invalidatesTags: ['User'], ...options });
}

export function useGetMeQuery(args, options) {
    return useQuery(authService.getMe, args, { tags: ['User'], ...options });
}

export function useLazyGetMeQuery(options) {
    return useLazyQuery(authService.getMe, options);
}

export function useLogoutMutation(options) {
    return useMutation(authService.logout, { invalidatesTags: ['User'], ...options });
}

export function useSendOtpMutation(options) {
    return useMutation(authService.sendOtp, options);
}

export function useVerifyOtpMutation(options) {
    return useMutation(authService.verifyOtp, { invalidatesTags: ['User'], ...options });
}

export function useUpdateUserProfileMutation(options) {
    return useMutation(authService.updateUserProfile, { invalidatesTags: ['User'], ...options });
}

// Travel methods historically accessed via authApi
export function useGetMyTripsQuery(args, options) {
    return useQuery(travelService.getMyTrips, args, { tags: ['Trips'], ...options });
}

export function useCreateTripMutation(options) {
    return useMutation(travelService.createTrip, { invalidatesTags: ['Trips'], ...options });
}

export function useSearchTripsQuery(params, options) {
    return useQuery(travelService.searchTrips, params, options);
}

export function useLazySearchTripsQuery(options) {
    return useLazyQuery(travelService.searchTrips, options);
}

export function useTravelMatchActionMutation(options) {
    return useMutation(travelService.travelMatchAction, { invalidatesTags: ['Trips'], ...options });
}

export function useGetPublicTripsQuery(params, options) {
    return useQuery(travelService.getPublicTrips, params, options);
}

export function useGetPublicSearchTripsQuery(params, options) {
    return useQuery(travelService.getPublicSearchTrips, params, options);
}

export function useLazyGetPublicSearchTripsQuery(options) {
    return useLazyQuery(travelService.getPublicSearchTrips, options);
}

export function useGetPublicTripQuery(tripId, options) {
    return useQuery(() => travelService.getPublicTrip(tripId), tripId, options);
}

export function useLazyGetPublicTripQuery(options) {
    return useLazyQuery(travelService.getPublicTrip, options);
}
