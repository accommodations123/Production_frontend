import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { wishlistService } from '@/services/wishlistService';

export function useGetWishlistQuery(params, options) {
    return useQuery(wishlistService.getWishlist, params, { tags: ['Wishlist'], ...options });
}

export function useCheckWishlistStatusQuery(params, options) {
    return useQuery(wishlistService.checkWishlistStatus, params, { tags: ['Wishlist'], ...options });
}

export function useAddToWishlistMutation(options) {
    return useMutation(wishlistService.addToWishlist, { invalidatesTags: ['Wishlist'], ...options });
}

export function useRemoveFromWishlistMutation(options) {
    return useMutation(wishlistService.removeFromWishlist, { invalidatesTags: ['Wishlist'], ...options });
}

export function useToggleWishlistMutation(options) {
    return useMutation(wishlistService.toggleWishlist, { invalidatesTags: ['Wishlist'], ...options });
}
