import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const marketplaceApi = createApi({
    reducerPath: 'marketplaceApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['BuySell'],
    endpoints: (builder) => ({
        createBuySell: builder.mutation({
            query: (data) => ({ url: 'buy-sell/create', method: 'POST', body: data }),
            invalidatesTags: ['BuySell'],
        }),

        getBuySellListings: builder.query({
            query: ({ country, state, city, zip_code, category, minPrice, maxPrice, search, limit } = {}) => {
                const headers = {}
                if (country) headers['X-Country'] = country

                const params = {}
                if (country) params.country = country
                if (state) params.state = state
                if (city) params.city = city
                if (zip_code) params.zip_code = zip_code
                if (category) params.category = category
                if (minPrice) params.minPrice = minPrice
                if (maxPrice) params.maxPrice = maxPrice
                if (search) params.search = search
                if (limit) params.limit = limit

                return { url: 'buy-sell/get', headers, params }
            },
            providesTags: ['BuySell'],
            transformResponse: (response) => {
                const res = response?.listings || response?.data?.listings || response?.data || response
                return Array.isArray(res) ? res : (res?.listings || [])
            },
        }),

        getBuySellById: builder.query({
            query: (id) => `buy-sell/get/${id}`,
            transformResponse: (response) => response?.listing || response?.data?.listing || response?.data || response,
        }),

        getMyBuySellListings: builder.query({
            query: () => 'buy-sell/my-buy-sell',
            providesTags: ['BuySell'],
            transformResponse: (response) => {
                const res = response?.listings || response?.data?.listings || response?.data || response
                return Array.isArray(res) ? res : (res?.listings || [])
            },
        }),

        updateBuySell: builder.mutation({
            query: ({ id, data }) => ({ url: `buy-sell/update/${id}`, method: 'PUT', body: data }),
            invalidatesTags: (result, error, { id }) => [{ type: 'BuySell', id }],
        }),

        markBuySellAsSold: builder.mutation({
            query: (id) => ({ url: `buy-sell/buy-sell/${id}/sold`, method: 'PATCH' }),
            invalidatesTags: (result, error, id) => [{ type: 'BuySell', id }],
        }),

        deleteBuySell: builder.mutation({
            query: (id) => ({ url: `buy-sell/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: ['BuySell'],
        }),
    }),
})

export const {
    useCreateBuySellMutation,
    useGetBuySellListingsQuery,
    useGetBuySellByIdQuery,
    useGetMyBuySellListingsQuery,
    useUpdateBuySellMutation,
    useMarkBuySellAsSoldMutation,
    useDeleteBuySellMutation,
} = marketplaceApi
