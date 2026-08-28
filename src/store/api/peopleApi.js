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
    ],
    endpoints: (builder) => ({
        // ── Profiles ──────────────────────────────────────────────────
        getPublicProfiles: builder.query({
            query: (params = {}) => ({
                url: 'people',
                params,
            }),
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['PeopleProfiles'],
        }),

        searchProfiles: builder.query({
            query: (params = {}) => ({
                url: 'people/search',
                params,
            }),
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['PeopleProfiles'],
        }),

        getPublicProfile: builder.query({
            query: (profileId) => `people/profile/${profileId}`,
            transformResponse: (response) => response?.data ?? response,
            providesTags: (result, error, profileId) => [
                { type: 'PeopleProfileDetail', id: profileId },
            ],
        }),

        getMyProfile: builder.query({
            query: () => 'people/me',
            transformResponse: (response) => response?.data ?? response,
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
                url: 'people/me',
                method: 'PUT',
                body: { isPublished: true, is_published: true },
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        unpublishProfile: builder.mutation({
            query: () => ({
                url: 'people/me',
                method: 'PUT',
                body: { isPublished: false, is_published: false },
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        deleteProfile: builder.mutation({
            query: () => ({
                url: 'people/me',
                method: 'DELETE',
            }),
            invalidatesTags: ['PeopleProfiles', 'PeopleMyProfile'],
        }),

        uploadFile: builder.mutation({
            query: (formData) => ({
                url: 'people/upload',
                method: 'POST',
                body: formData,
            }),
        }),

        reportProfile: builder.mutation({
            query: (data) => ({
                url: 'people/report',
                method: 'POST',
                body: data,
            }),
        }),

        // ── Section Updates ───────────────────────────────────────────
        updateExperience: builder.mutation({
            query: (experienceData) => ({
                url: 'people/me/experience',
                method: 'PUT',
                body: experienceData,
            }),
            invalidatesTags: ['PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        updateEducation: builder.mutation({
            query: (educationData) => ({
                url: 'people/me/education',
                method: 'PUT',
                body: educationData,
            }),
            invalidatesTags: ['PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        updateSkills: builder.mutation({
            query: (skillsData) => ({
                url: 'people/me/skills',
                method: 'PUT',
                body: skillsData,
            }),
            invalidatesTags: ['PeopleMyProfile', 'PeopleProfileDetail', 'PeopleProfiles'],
        }),

        updatePortfolio: builder.mutation({
            query: (portfolioData) => ({
                url: 'people/me/portfolio',
                method: 'PUT',
                body: portfolioData,
            }),
            invalidatesTags: ['PeopleMyProfile', 'PeopleProfileDetail'],
        }),

        updateServices: builder.mutation({
            query: (servicesData) => ({
                url: 'people/me/services',
                method: 'PUT',
                body: servicesData,
            }),
            invalidatesTags: ['PeopleMyProfile', 'PeopleProfileDetail', 'PeopleProfiles'],
        }),

        // ── Reviews ───────────────────────────────────────────────────
        getExpertReviews: builder.query({
            query: (profileId) => `people/reviews/${profileId}`,
            providesTags: (result, error, profileId) => [
                { type: 'PeopleReviews', id: profileId },
            ],
        }),

        getExpertRating: builder.query({
            query: (profileId) => `people/reviews/${profileId}`,
            providesTags: (result, error, profileId) => [
                { type: 'PeopleReviews', id: profileId },
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

        // ── Follows ───────────────────────────────────────────────────
        toggleFollow: builder.mutation({
            query: (targetUserId) => ({
                url: `people/follow/${targetUserId}`,
                method: 'POST',
            }),
            invalidatesTags: ['PeopleFollowers', 'PeopleProfiles', 'PeopleProfileDetail'],
        }),

        followExpert: builder.mutation({
            query: (targetUserId) => ({
                url: `people/follow/${targetUserId}`,
                method: 'POST',
            }),
            invalidatesTags: ['PeopleFollowers', 'PeopleProfiles', 'PeopleProfileDetail'],
        }),

        unfollowExpert: builder.mutation({
            query: (targetUserId) => ({
                url: `people/follow/${targetUserId}`,
                method: 'POST',
            }),
            invalidatesTags: ['PeopleFollowers', 'PeopleProfiles', 'PeopleProfileDetail'],
        }),

        getFollowers: builder.query({
            query: (userId) => `people/followers/${userId}`,
            providesTags: ['PeopleFollowers'],
        }),

        getFollowing: builder.query({
            query: (userId) => `people/following/${userId}`,
            providesTags: ['PeopleFollowers'],
        }),

        checkFollowStatus: builder.query({
            query: (targetUserId) => `people/followers/${targetUserId}`,
            providesTags: ['PeopleFollowers'],
        }),

        getMyFollowing: builder.query({
            query: (userId) => `people/following/${userId}`,
            providesTags: ['PeopleFollowers'],
        }),

        // Compatibility Queries
        getExpertPortfolio: builder.query({
            query: (expertId) => `people/profile/${expertId}`,
        }),
        getExpertRecommendations: builder.query({
            query: (expertId) => `people/profile/${expertId}`,
        }),
        trackAnalyticsEvent: builder.mutation({
            query: () => ({ url: 'people', method: 'GET' }),
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
    useUpdateProfileMutation,
    usePublishProfileMutation,
    useUnpublishProfileMutation,
    useDeleteProfileMutation,
    useUploadFileMutation,
    useReportProfileMutation,
    useUpdateExperienceMutation,
    useUpdateEducationMutation,
    useUpdateSkillsMutation,
    useUpdatePortfolioMutation,
    useUpdateServicesMutation,
    useGetExpertReviewsQuery,
    useGetExpertRatingQuery,
    useAddReviewMutation,
    useToggleFollowMutation,
    useFollowExpertMutation,
    useUnfollowExpertMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
    useCheckFollowStatusQuery,
    useGetMyFollowingQuery,
    useGetExpertPortfolioQuery,
    useGetExpertRecommendationsQuery,
    useTrackAnalyticsEventMutation,
} = peopleApi
