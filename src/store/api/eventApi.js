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

/** Patch host image fields on a single event object (mutates in place). */
function fixEventHostImages(event) {
    if (!event || typeof event !== 'object') return event
    const host = event.Host || event.host || {}
    if (host.profile_image) host.profile_image = fixImage(host.profile_image)
    if (host.selfie_photo) host.selfie_photo = fixImage(host.selfie_photo)
    if (host.User && typeof host.User === 'object') {
        if (host.User.profile_image) host.User.profile_image = fixImage(host.User.profile_image)
    }
    event.Host = host
    return event
}

export const eventApi = createApi({
    reducerPath: 'eventApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Event', 'Review'],
    endpoints: (builder) => ({
        // ── Event queries ─────────────────────────────────────
        getApprovedEvents: builder.query({
            query: (arg) => {
                // Support both string (countryName) and object ({ name, code, limit })
                let countryName = typeof arg === 'string' ? arg : (arg?.name || arg?.code)
                const limit = typeof arg === 'object' ? arg?.limit : undefined

                // Resolve from localStorage if not provided via argument
                if (!countryName) {
                    const countryData = localStorage.getItem('selectedCountry')
                    if (countryData) {
                        try {
                            const c = JSON.parse(countryData)
                            countryName = c.name || c.code
                        } catch {
                            // ignore
                        }
                    }
                }

                const params = {}
                if (limit) params.limit = limit
                if (countryName) params.country = countryName

                return {
                    url: 'events/approved',
                    headers: countryName ? { 'X-Country': countryName } : undefined,
                    params,
                }
            },
            providesTags: ['Event'],
            transformResponse: (response) => {
                const items = response?.data?.events || response?.events || response?.data || response || []
                if (Array.isArray(items)) {
                    items.forEach(fixEventHostImages)
                }
                return items
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
                const event = response?.event || response?.data || response
                fixEventHostImages(event)
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
                const results = response?.data?.events || response?.events || response || []
                return Array.isArray(results) ? results : []
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
