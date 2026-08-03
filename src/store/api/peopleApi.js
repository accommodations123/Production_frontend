import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const peopleApi = createApi({
    reducerPath: 'peopleApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: [
        'PeopleProfiles',
        'PeopleProfileDetail',
        'PeopleMyProfile',
        'PeopleReviews',
        'PeopleFollowers',
        'PeoplePortfolio',
        'PeopleRecommendations',
        'PeopleAnalytics',
    ],
    endpoints: (builder) => ({
        // ── Profiles ──────────────────────────────────────────────────
        getPublicProfiles: builder.query({
            query: (params = {}) => ({
                url: 'people',
                params,
            }),
            providesTags: ['PeopleProfiles'],
        }),

        searchProfiles: builder.query({
            query: (params = {}) => ({
                url: 'people/search',
                params,
            }),
            providesTags: ['PeopleProfiles'],
        }),

        getPublicProfile: builder.query({
            query: (profileId) => `people/${profileId}`,
            providesTags: (result, error, profileId) => [
                { type: 'PeopleProfileDetail', id: profileId },
            ],
        }),

        getMyProfile: builder.query({
            query: () => 'people/me',
            providesTags: ['PeopleMyProfile'],
        }),

        createProfile: builder.mutation({
            query: (data) => ({
                url: 'people',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile'],
        }),

        uploadFile: builder.mutation({
            query: (formData) => ({
                url: 'upload',
                method: 'POST',
                body: formData,
                credentials: 'include',
            }),
        }),

        updateProfile: builder.mutation({
            query: (data) => ({
                url: 'people/me',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        publishProfile: builder.mutation({
            query: () => ({
                url: 'people/me/publish',
                method: 'PUT',
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile'],
        }),

        unpublishProfile: builder.mutation({
            query: () => ({
                url: 'people/me/unpublish',
                method: 'PUT',
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile'],
        }),

        reportProfile: builder.mutation({
            query: ({ profileId, data }) => ({
                url: `people/report/${profileId}`,
                method: 'POST',
                body: data,
            }),
        }),

        // ── Reviews ───────────────────────────────────────────────────
        getExpertReviews: builder.query({
            query: (expertId) => `people/reviews/${expertId}`,
            providesTags: (result, error, expertId) => [
                { type: 'PeopleReviews', id: expertId },
            ],
        }),

        getExpertRating: builder.query({
            query: (expertId) => `people/reviews/${expertId}/rating`,
            providesTags: (result, error, expertId) => [
                { type: 'PeopleReviews', id: expertId },
            ],
        }),

        addReview: builder.mutation({
            query: ({ expertId, data }) => ({
                url: `people/reviews/${expertId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { expertId }) => [
                { type: 'PeopleReviews', id: expertId },
                { type: 'PeopleProfileDetail', id: expertId },
                'PeopleProfiles',
            ],
        }),

        updateReview: builder.mutation({
            query: ({ expertId, data }) => ({
                url: `people/reviews/${expertId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { expertId }) => [
                { type: 'PeopleReviews', id: expertId },
                { type: 'PeopleProfileDetail', id: expertId },
                'PeopleProfiles',
            ],
        }),

        // ── Follows ───────────────────────────────────────────────────
        followExpert: builder.mutation({
            query: (expertId) => ({
                url: `people/follow/${expertId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, expertId) => [
                { type: 'PeopleFollowers', id: expertId },
                { type: 'PeopleProfileDetail', id: expertId },
            ],
        }),

        unfollowExpert: builder.mutation({
            query: (expertId) => ({
                url: `people/follow/${expertId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, expertId) => [
                { type: 'PeopleFollowers', id: expertId },
                { type: 'PeopleProfileDetail', id: expertId },
            ],
        }),

        checkFollowStatus: builder.query({
            query: (expertId) => `people/follow/${expertId}/status`,
            providesTags: (result, error, expertId) => [
                { type: 'PeopleFollowers', id: expertId },
            ],
        }),

        getMyFollowing: builder.query({
            query: () => 'people/follow/me/following',
            providesTags: ['PeopleFollowers'],
        }),

        // ── Portfolio ────────────────────────────────────────────────
        getExpertPortfolio: builder.query({
            query: (expertId) => `people/portfolio/${expertId}`,
            providesTags: (result, error, expertId) => [
                { type: 'PeoplePortfolio', id: expertId },
            ],
        }),

        addPortfolioItem: builder.mutation({
            query: ({ expertId, formData }) => ({
                url: `people/portfolio/${expertId}`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, { expertId }) => [
                { type: 'PeoplePortfolio', id: expertId },
            ],
        }),

        deletePortfolioItem: builder.mutation({
            query: ({ itemId, expertId }) => ({
                url: `people/portfolio/item/${itemId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { expertId }) => [
                { type: 'PeoplePortfolio', id: expertId },
            ],
        }),

        // ── Recommendations ──────────────────────────────────────────
        getExpertRecommendations: builder.query({
            query: (expertId) => `people/recommendations/${expertId}`,
            providesTags: (result, error, expertId) => [
                { type: 'PeopleRecommendations', id: expertId },
            ],
        }),

        addRecommendation: builder.mutation({
            query: ({ expertId, data }) => ({
                url: `people/recommendations/${expertId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { expertId }) => [
                { type: 'PeopleRecommendations', id: expertId },
            ],
        }),

        // ── Analytics ────────────────────────────────────────────────
        trackAnalyticsEvent: builder.mutation({
            query: (data) => ({
                url: 'people/analytics/track',
                method: 'POST',
                body: data,
            }),
        }),

        getMyAnalytics: builder.query({
            query: (days = 30) => `people/analytics/me?days=${days}`,
            providesTags: ['PeopleAnalytics'],
        }),
    }),
})

export const {
    useGetPublicProfilesQuery,
    useSearchProfilesQuery,
    useLazySearchProfilesQuery,
    useGetPublicProfileQuery,
    useGetMyProfileQuery,
    useCreateProfileMutation,
    useUploadFileMutation,
    useUpdateProfileMutation,
    usePublishProfileMutation,
    useUnpublishProfileMutation,
    useReportProfileMutation,
    useGetExpertReviewsQuery,
    useGetExpertRatingQuery,
    useAddReviewMutation,
    useUpdateReviewMutation,
    useFollowExpertMutation,
    useUnfollowExpertMutation,
    useCheckFollowStatusQuery,
    useGetMyFollowingQuery,
    useGetExpertPortfolioQuery,
    useAddPortfolioItemMutation,
    useDeletePortfolioItemMutation,
    useGetExpertRecommendationsQuery,
    useAddRecommendationMutation,
    useTrackAnalyticsEventMutation,
    useGetMyAnalyticsQuery,
} = peopleApi
