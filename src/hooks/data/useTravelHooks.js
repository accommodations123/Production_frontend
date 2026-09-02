import { useQuery, useLazyQuery } from './useQuery';
import { useMutation } from './useMutation';
import { travelService } from '@/services/travelService';

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
