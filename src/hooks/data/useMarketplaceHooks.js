import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { buySellService } from '@/services/buySellService';

export function useCreateBuySellMutation(options) {
    return useMutation(buySellService.createBuySell, { invalidatesTags: ['BuySell'], ...options });
}

export function useGetBuySellListingsQuery(params, options) {
    return useQuery(buySellService.getBuySellListings, params, { tags: ['BuySell'], ...options });
}

export function useGetBuySellByIdQuery(id, options) {
    return useQuery(() => buySellService.getBuySellById(id), id, { tags: ['BuySell'], ...options });
}

export function useGetMyBuySellListingsQuery(args, options) {
    return useQuery(buySellService.getMyBuySellListings, args, { tags: ['BuySell'], ...options });
}

export function useUpdateBuySellMutation(options) {
    return useMutation(buySellService.updateBuySell, { invalidatesTags: ['BuySell'], ...options });
}

export function useMarkBuySellAsSoldMutation(options) {
    return useMutation(buySellService.markBuySellAsSold, { invalidatesTags: ['BuySell'], ...options });
}

export function useDeleteBuySellMutation(options) {
    return useMutation(buySellService.deleteBuySell, { invalidatesTags: ['BuySell'], ...options });
}
