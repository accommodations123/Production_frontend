import { createApi } from '@reduxjs/toolkit/query/react'
import { CLOUDFRONT_BASE } from '@/shared/utils/imageUtils'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),

        getMe: builder.query({
            query: () => 'auth/me',
            providesTags: ['User'],
            transformResponse: (response) => {
                const CLOUDFRONT = CLOUDFRONT_BASE
                const fixImage = (obj) => {
                    if (obj?.profile_image && !obj.profile_image.startsWith('http')) {
                        const key = obj.profile_image.startsWith('/')
                            ? obj.profile_image
                            : `/${obj.profile_image}`
                        obj.profile_image = `${CLOUDFRONT}${key}`
                    }
                    return obj
                }
                // Handle both { user: {...} } and flat user object shapes
                if (response?.user) {
                    fixImage(response.user)
                } else if (response) {
                    fixImage(response)
                }
                return response
            },
        }),

        logout: builder.mutation({
            query: () => ({
                url: 'otp/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        sendOtp: builder.mutation({
            query: ({ email, phone }) => ({
                url: 'otp/send-otp',
                method: 'POST',
                body: { email, phone },
            }),
        }),

        verifyOtp: builder.mutation({
            query: ({ email, phone, otp }) => ({
                url: 'otp/verify-otp',
                method: 'POST',
                body: { email, phone, otp },
            }),
            invalidatesTags: ['User'],
            transformResponse: (response) => {
                const user = response?.user || response?.data?.user
                return { ...response, user }
            },
        }),

        updateUserProfile: builder.mutation({
            query: (formData) => ({
                url: 'otp/update-profile',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
    }),
})

export const {
    useLoginMutation,
    useGetMeQuery,
    useLazyGetMeQuery,
    useLogoutMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useUpdateUserProfileMutation,
} = authApi
