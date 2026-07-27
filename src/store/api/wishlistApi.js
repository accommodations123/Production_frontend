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
                body: { item_type: data.type, item_id: data.id },
            }),
            invalidatesTags: (result, error, { type, id }) => [
                'Wishlist',
                { type: 'Wishlist', id: `${type}-${id}` },
            ],
        }),

        removeFromWishlist: builder.mutation({
            query: ({ type, id }) => ({
                url: `wishlist/${type}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { type, id }) => [
                'Wishlist',
                { type: 'Wishlist', id: `${type}-${id}` },
            ],
        }),

        toggleWishlist: builder.mutation({
            query: (data) => ({
                url: 'wishlist/toggle',
                method: 'POST',
                body: { item_type: data.type, item_id: data.id },
            }),
            invalidatesTags: (result, error, { type, id }) => [
                'Wishlist',
                { type: 'Wishlist', id: `${type}-${id}` },
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
