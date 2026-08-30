import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const wishlistApi = createApi({
    reducerPath: 'wishlistApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Wishlist'],
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: ({ page = 1, limit = 20, type } = {}) => ({
                url: 'wishlist',
                params: { page, limit, type },
            }),
            providesTags: ['Wishlist'],
            transformResponse: (response) => response,
        }),

        checkWishlistStatus: builder.query({
            query: ({ type, id }) => `wishlist/check/${type}/${id}`,
            providesTags: (result, error, { type, id }) => [{ type: 'Wishlist', id: `${type}-${id}` }],
        }),

        addToWishlist: builder.mutation({
            query: (data) => ({
                url: 'wishlist/add',
                method: 'POST',
                body: { ...data, id: data.id || data.itemId, type: data.type || data.itemType, item_type: data.type || data.itemType, item_id: data.id || data.itemId },
            }),
            invalidatesTags: (result, error, data) => [
                'Wishlist',
                { type: 'Wishlist', id: `${data.type || data.itemType}-${data.id || data.itemId}` },
            ],
        }),

        removeFromWishlist: builder.mutation({
            query: (data) => ({
                url: `wishlist/${data.type || data.itemType}/${data.id || data.itemId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, data) => [
                'Wishlist',
                { type: 'Wishlist', id: `${data.type || data.itemType}-${data.id || data.itemId}` },
            ],
        }),

        toggleWishlist: builder.mutation({
            query: (data) => ({
                url: 'wishlist/toggle',
                method: 'POST',
                body: { ...data, id: data.id || data.itemId, type: data.type || data.itemType, item_type: data.type || data.itemType, item_id: data.id || data.itemId },
            }),
            invalidatesTags: (result, error, data) => [
                'Wishlist',
                { type: 'Wishlist', id: `${data.type || data.itemType}-${data.id || data.itemId}` },
            ],
        }),
    }),
})

export const {
    useGetWishlistQuery,
    useCheckWishlistStatusQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useToggleWishlistMutation,
} = wishlistApi
