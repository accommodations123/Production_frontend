import { useQuery, useLazyQuery } from './useQuery';
import { useMutation } from './useMutation';
import { peopleService } from '@/services/peopleService';

export function useGetPublicProfilesQuery(params, options) {
    return useQuery(peopleService.getPublicProfiles, params, { tags: ['Profile'], ...options });
}

export function useSearchProfilesQuery(params, options) {
    return useQuery(peopleService.searchProfiles, params, options);
}

export function useLazySearchProfilesQuery(options) {
    return useLazyQuery(peopleService.searchProfiles, options);
}

export function useGetPublicProfileQuery(id, options) {
    return useQuery(() => peopleService.getPublicProfile(id), id, { tags: ['Profile'], ...options });
}

export function useGetMyProfileQuery(args, options) {
    return useQuery(peopleService.getMyProfile, args, { tags: ['Profile'], ...options });
}

export function useCreateProfileMutation(options) {
    return useMutation(peopleService.createProfile, { invalidatesTags: ['Profile'], ...options });
}

export function useUpdateProfileMutation(options) {
    return useMutation(peopleService.updateProfile, { invalidatesTags: ['Profile'], ...options });
}

export function usePublishProfileMutation(options) {
    return useMutation(peopleService.publishProfile, { invalidatesTags: ['Profile'], ...options });
}

export function useUnpublishProfileMutation(options) {
    return useMutation(peopleService.unpublishProfile, { invalidatesTags: ['Profile'], ...options });
}

export function useDeleteProfileMutation(options) {
    return useMutation(peopleService.deleteProfile, { invalidatesTags: ['Profile'], ...options });
}

export function useUploadFileMutation(options) {
    return useMutation(peopleService.uploadFile, options);
}

export function useReportProfileMutation(options) {
    return useMutation(peopleService.reportProfile, options);
}

export function useUpdateExperienceMutation(options) {
    return useMutation(peopleService.updateExperience, { invalidatesTags: ['Profile'], ...options });
}

export function useUpdateEducationMutation(options) {
    return useMutation(peopleService.updateEducation, { invalidatesTags: ['Profile'], ...options });
}

export function useUpdateSkillsMutation(options) {
    return useMutation(peopleService.updateSkills, { invalidatesTags: ['Profile'], ...options });
}

export function useUpdatePortfolioMutation(options) {
    return useMutation(peopleService.updatePortfolio, { invalidatesTags: ['Profile'], ...options });
}

export function useUpdateServicesMutation(options) {
    return useMutation(peopleService.updateServices, { invalidatesTags: ['Profile'], ...options });
}

export function useGetExpertReviewsQuery(id, options) {
    return useQuery(() => peopleService.getExpertReviews(id), id, { tags: ['Review', 'Profile'], ...options });
}

export function useGetExpertRatingQuery(id, options) {
    return useQuery(() => peopleService.getExpertRating(id), id, { tags: ['Review', 'Profile'], ...options });
}

export function useAddReviewMutation(options) {
    return useMutation(peopleService.addReview, { invalidatesTags: ['Review', 'Profile'], ...options });
}

export function useToggleFollowMutation(options) {
    return useMutation(peopleService.toggleFollow, { invalidatesTags: ['Profile', 'Following'], ...options });
}

export function useFollowExpertMutation(options) {
    return useMutation(peopleService.followExpert, { invalidatesTags: ['Profile', 'Following'], ...options });
}

export function useUnfollowExpertMutation(options) {
    return useMutation(peopleService.unfollowExpert, { invalidatesTags: ['Profile', 'Following'], ...options });
}

export function useGetFollowersQuery(userId, options) {
    return useQuery(() => peopleService.getFollowers(userId), userId, { tags: ['Following', 'Profile'], ...options });
}

export function useGetFollowingQuery(userId, options) {
    return useQuery(() => peopleService.getFollowing(userId), userId, { tags: ['Following', 'Profile'], ...options });
}

export function useGetMyFollowingQuery(args, options) {
    return useQuery(peopleService.getMyFollowing, args, { tags: ['Following', 'Profile'], ...options });
}

export function useCheckFollowStatusQuery(targetUserId, options) {
    return useQuery(() => peopleService.checkFollowStatus(targetUserId), targetUserId, { tags: ['Following', 'Profile'], ...options });
}

export function useGetExpertPortfolioQuery(id, options) {
    return useQuery(() => peopleService.getExpertPortfolio(id), id, options);
}

export function useGetExpertRecommendationsQuery(id, options) {
    return useQuery(() => peopleService.getExpertRecommendations(id), id, options);
}

export function useTrackAnalyticsEventMutation(options) {
    return useMutation(peopleService.trackAnalyticsEvent, options);
}
