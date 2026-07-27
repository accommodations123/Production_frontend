import { createApi } from '@reduxjs/toolkit/query/react'
import { CLOUDFRONT_BASE } from '@/shared/utils/imageUtils'
import { baseQueryWithAuth } from '@/store/baseQuery'

/** Resolve a bare S3 key to its full CloudFront URL. */
function fixImage(img) {
    if (img && typeof img === 'string' && !img.startsWith('http')) {
        return `${CLOUDFRONT_BASE}${img.startsWith('/') ? img : `/${img}`}`
    }
    return img
}

export const propertyApi = createApi({
    reducerPath: 'propertyApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Property', 'Host'],
    endpoints: (builder) => ({
        // ── Host ───────────────────────────────────────────────
        saveHost: builder.mutation({
            query: (hostData) => ({
                url: 'host/save',
                method: 'POST',
                body: hostData,
                credentials: 'include',
            }),
            invalidatesTags: ['Host'],
        }),

        updateHost: builder.mutation({
            query: ({ hostId, data }) => ({
                url: `host/update/${hostId}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled
                    dispatch(propertyApi.util.invalidateTags(['Host']))
                } catch (error) {
                    console.error('Update failed:', error)
                }
            },
            invalidatesTags: ['Host'],
        }),

        getHostProfile: builder.query({
            query: () => 'host/get',
            providesTags: ['Host'],
            transformResponse: (response) => {
                const host = response?.host || response?.data || response
                if (host && typeof host === 'object') {
                    if (host.profile_image) host.profile_image = fixImage(host.profile_image)
                    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo)
                }
                return host
            },
        }),

        getApprovedHostDetails: builder.query({
            query: (country) => ({
                url: 'admin/approved/approved-host-details',
                params: country ? { country } : undefined,
            }),
            transformResponse: (response) => {
                const hosts = response?.data || response?.hosts || response || []
                if (Array.isArray(hosts)) {
                    return hosts.map((h) => {
                        const host = { ...h }
                        if (host.profile_image) host.profile_image = fixImage(host.profile_image)
                        if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo)
                        return host
                    })
                }
                return hosts
            },
        }),

        // ── Property queries ──────────────────────────────────
        getApprovedProperties: builder.query({
            query: (country) => ({
                url: 'property/approved',
                params: country ? { country } : undefined,
            }),
            providesTags: ['Property'],
            transformResponse: (response) => {
                const items = response?.properties || response?.data?.properties || response?.data || response || []
                return Array.isArray(items) ? items : []
            },
        }),

        getAllProperties: builder.query({
            query: (params) => ({
                url: 'property/all',
                params,
            }),
            providesTags: ['Property'],
            transformResponse: (response) => {
                const items = response?.data || response?.properties || response || []
                return Array.isArray(items) ? items : []
            },
        }),

        getMyListings: builder.query({
            query: () => ({
                url: 'property/my-listings',
                headers: { 'Cache-Control': 'no-cache' },
            }),
            providesTags: (result) =>
                result && Array.isArray(result)
                    ? [
                          ...result.map(({ id, _id }) => ({ type: 'Property', id: _id || id })),
                          { type: 'Property', id: 'LIST' },
                      ]
                    : [{ type: 'Property', id: 'LIST' }],
            transformResponse: (response) => {
                const results =
                    response?.data?.properties ||
                    response?.properties ||
                    response?.listings ||
                    response?.data ||
                    response ||
                    []
                return Array.isArray(results) ? results : []
            },
        }),

        getPropertyById: builder.query({
            query: (id) => {
                const countryData = localStorage.getItem('selectedCountry')
                let countryName = ''
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData)
                        if (c.name) countryName = c.name
                    } catch {
                        // ignore malformed cached country JSON
                    }
                }
                return {
                    url: `property/${id}`,
                    params: countryName ? { country: countryName } : undefined,
                    headers: countryName ? { 'X-Country': countryName } : undefined,
                }
            },
            transformResponse: (response) => {
                const property = response?.property || response?.data?.property || response?.data || response
                const host = response?.host || response?.data?.host || {}
                if (host && typeof host === 'object') {
                    if (host.profile_image) host.profile_image = fixImage(host.profile_image)
                    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo)
                    if (host.image) host.image = fixImage(host.image)
                    if (host.User && typeof host.User === 'object') {
                        if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image)
                        if (host.User.selfie_photo) host.User.selfie_photo = fixImage(host.User.selfie_photo)
                    }
                }
                return { property, host }
            },
        }),

        // ── Property mutations ────────────────────────────────
        createPropertyDraft: builder.mutation({
            query: (data) => ({
                url: 'property/create-draft',
                method: 'POST',
                body: data,
                credentials: 'include',
            }),
        }),

        updatePropertyBasic: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/basic-info/${id}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
        }),

        updatePropertyAddress: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/address/${id}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
        }),

        updatePropertyPricing: builder.mutation({
            query: ({ id, data }) => ({
                url: `property/pricing/${id}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
        }),

        updatePropertyAmenities: builder.mutation({
            query: ({ id, amenities }) => ({
                url: `property/amenities/${id}`,
                method: 'PUT',
                body: { amenities },
                credentials: 'include',
            }),
        }),

        updatePropertyRules: builder.mutation({
            query: ({ id, rules }) => ({
                url: `property/rules/${id}`,
                method: 'PUT',
                body: { rules },
                credentials: 'include',
            }),
        }),

        updatePropertyMedia: builder.mutation({
            query: ({ id, formData }) => ({
                url: `property/media/${id}`,
                method: 'PUT',
                body: formData,
                credentials: 'include',
            }),
        }),

        updatePropertyVideo: builder.mutation({
            query: ({ id, formData }) => ({
                url: `property/media/video/${id}`,
                method: 'PUT',
                body: formData,
                credentials: 'include',
            }),
        }),

        submitProperty: builder.mutation({
            query: (id) => ({
                url: `property/submit/${id}`,
                method: 'PUT',
                credentials: 'include',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Property', id: 'LIST' },
                { type: 'Property', id },
                'Property',
            ],
        }),

        deleteProperty: builder.mutation({
            query: ({ id, reason }) => ({
                url: `property/delete/${id}`,
                method: 'DELETE',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: { reason: reason || 'User deleted from dashboard' },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Property', id: 'LIST' },
                { type: 'Property', id },
                'Property',
            ],
        }),

        // ── File upload ───────────────────────────────────────
        uploadFile: builder.mutation({
            query: (formData) => ({
                url: 'upload',
                method: 'POST',
                body: formData,
                credentials: 'include',
            }),
        }),
    }),
})

export const {
    useSaveHostMutation,
    useUpdateHostMutation,
    useGetHostProfileQuery,
    useGetApprovedHostDetailsQuery,
    useGetApprovedPropertiesQuery,
    useGetAllPropertiesQuery,
    useGetMyListingsQuery,
    useGetPropertyByIdQuery,
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
    useUploadFileMutation,
} = propertyApi
