import { createApi } from '@reduxjs/toolkit/query/react';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { baseQueryWithAuth } from '@/store/baseQuery';

/** Resolve a bare key or path to its full Supabase Storage URL. */
function fixImage(img) {
    if (img && typeof img === 'string' && !img.startsWith('http')) {
        return resolveImageUrl(img);
    }
    return img;
}

/** Patch image fields on a single event object (mutates in place). */
function fixEventImages(event) {
    if (!event || typeof event !== 'object') return event
    if (event.banner_image) event.banner_image = fixImage(event.banner_image)
    if (event.image) event.image = fixImage(event.image)
    if (Array.isArray(event.gallery_images)) {
        event.gallery_images = event.gallery_images.map(fixImage)
    }
    const host = event.Host || event.host || {}
    if (host.profile_image) host.profile_image = fixImage(host.profile_image)
    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo)
    if (host.User && typeof host.User === 'object') {
        if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image)
    }
    event.Host = host
    return event
}

import { COUNTRIES } from '@/lib/mock-data'

export const eventApi = createApi({
    reducerPath: 'eventApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Event', 'Review'],
    endpoints: (builder) => ({
        // ── Event queries ─────────────────────────────────────
        getApprovedEvents: builder.query({
            query: (arg) => {
                let countryCode = typeof arg === 'string' ? (arg.length === 2 ? arg : undefined) : arg?.code
                let countryName = typeof arg === 'string' ? arg : arg?.name

                if (!countryCode && !countryName) {
                    const countryData = localStorage.getItem('selectedCountry')
                    if (countryData) {
                        try {
                            const c = JSON.parse(countryData)
                            countryCode = c.code
                            countryName = c.name
                        } catch { }
                    }
                }

                if (!countryCode && countryName) {
                    const found = COUNTRIES.find(c => c.name?.toLowerCase() === countryName?.toLowerCase() || c.code === countryName?.toUpperCase())
                    if (found) {
                        countryCode = found.code
                        countryName = found.name
                    }
                }

                const limit = typeof arg === 'object' ? arg?.limit : undefined

                const params = {}
                if (limit) params.limit = limit
                if (countryCode) params.country = countryCode
                else if (countryName) params.country = countryName

                const headerCountry = countryCode || countryName

                return {
                    url: 'events/approved',
                    headers: headerCountry ? { 'X-Country': headerCountry, 'X-Country-Code': countryCode || headerCountry } : undefined,
                    params,
                }
            },
            providesTags: ['Event'],
            transformResponse: (response) => {
                let items = response?.data?.events || response?.events || response?.data?.results || response?.results || response?.data?.items || response?.data || response || []
                if (!Array.isArray(items) && items && typeof items === 'object') {
                    if (Array.isArray(items.events)) items = items.events
                    else if (Array.isArray(items.data)) items = items.data
                    else if (Array.isArray(items.results)) items = items.results
                    else if (Array.isArray(items.items)) items = items.items
                    else items = []
                }
                if (Array.isArray(items)) {
                    items.forEach(fixEventImages)
                    return items
                }
                return []
            },
        }),

        getEventById: builder.query({
            query: (id) => {
                const countryData = localStorage.getItem('selectedCountry')
                let countryName = ''
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData)
                        countryName = c.name || c.code || ''
                    } catch {
                        // ignore malformed cached country JSON
                    }
                }
                return {
                    url: `events/${id}`,
                    headers: countryName ? { 'X-Country': countryName } : undefined,
                }
            },
            providesTags: (result, error, id) => [{ type: 'Event', id }],
            transformResponse: (response) => {
                let event = response?.event || response?.data?.event || response?.data || response
                if (event && typeof event === 'object' && !event.title && event.event) {
                    event = event.event
                }
                if (event && typeof event === 'object') {
                    fixEventImages(event)
                }
                // Merge is_registered if it exists at the root level but not in the event object
                if (response?.is_registered !== undefined && event && typeof event === 'object') {
                    return { ...event, is_registered: response.is_registered }
                }
                return event
            },
        }),

        createEvent: builder.mutation({
            query: (data) => ({ url: 'events/create', method: 'POST', body: data }),
            invalidatesTags: ['Event'],
        }),

        getMyEvents: builder.query({
            query: () => {
                const countryData = localStorage.getItem('selectedCountry')
                let countryCode = ''
                if (countryData) {
                    try {
                        const c = JSON.parse(countryData)
                        countryCode = c.code || c.name || ''
                    } catch {
                        // ignore malformed cached country JSON
                    }
                }
                return {
                    url: 'events/host/my-events',
                    headers: countryCode ? { 'X-Country': countryCode } : undefined,
                }
            },
            providesTags: ['Event'],
            transformResponse: (response) => {
                let results = response?.data?.events || response?.events || response?.data?.results || response?.results || response?.data || response || []
                if (!Array.isArray(results) && results && typeof results === 'object') {
                    if (Array.isArray(results.events)) results = results.events
                    else if (Array.isArray(results.data)) results = results.data
                    else results = []
                }
                if (Array.isArray(results)) {
                    results.forEach(fixEventImages)
                    return results
                }
                return []
            },
        }),

        deleteEvent: builder.mutation({
            query: (id) => ({
                url: `events/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Event'],
        }),

        joinEvent: builder.mutation({
            query: (id) => ({
                url: `events/${id}/join`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Event', id }],
        }),

        leaveEvent: builder.mutation({
            query: (id) => ({
                url: `events/${id}/leave`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Event', id }],
        }),

        // ── Reviews ───────────────────────────────────────────
        getEventReviews: builder.query({
            query: (id) => `events/reviews/${id}/reviews`,
            providesTags: (result, error, id) => [{ type: 'Review', id }],
            transformResponse: (response) => {
                const results = response?.reviews || response?.data || response || []
                return Array.isArray(results) ? results : []
            },
        }),

        addEventReview: builder.mutation({
            query: ({ id, data }) => ({
                url: `events/reviews/${id}/reviews`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }, { type: 'Event', id }],
        }),

        getEventRating: builder.query({
            query: (id) => `events/reviews/${id}/rating`,
            providesTags: (result, error, id) => [{ type: 'Review', id }],
        }),

        hideEventReview: builder.mutation({
            query: (id) => ({
                url: `events/reviews/reviews/${id}/hide`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Review', id }, { type: 'Event', id }],
        }),
    }),
})

export const {
    useGetApprovedEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useGetMyEventsQuery,
    useDeleteEventMutation,
    useJoinEventMutation,
    useLeaveEventMutation,
    useGetEventReviewsQuery,
    useAddEventReviewMutation,
    useGetEventRatingQuery,
    useHideEventReviewMutation,
} = eventApi
