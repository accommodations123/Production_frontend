import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const peopleService = {
    async getPublicProfiles(params) {
        const res = await executeSupabaseRequest({
            url: 'people',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch public profiles');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.people || raw?.profiles || raw?.data || raw?.results || []);
        list.people = list;
        list.profiles = list;
        list.results = list;
        list.items = list;
        list.data = list;
        list.total = raw?.total ?? list.length;
        return list;
    },

    async searchProfiles(params) {
        const res = await executeSupabaseRequest({
            url: 'people/search',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to search profiles');
        return res.data;
    },

    async getPublicProfile(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `people/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch profile');
        return res.data;
    },

    async getMyProfile() {
        const res = await executeSupabaseRequest({
            url: 'people/me',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my profile');
        return res.data;
    },

    async createProfile(data) {
        const res = await executeSupabaseRequest({
            url: 'people/create',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to create profile');
        return res.data;
    },

    async updateProfile(data) {
        const res = await executeSupabaseRequest({
            url: 'people/update',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update profile');
        return res.data;
    },

    async publishProfile() {
        const res = await executeSupabaseRequest({
            url: 'people/publish',
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to publish profile');
        return res.data;
    },

    async unpublishProfile() {
        const res = await executeSupabaseRequest({
            url: 'people/unpublish',
            method: 'PATCH',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to unpublish profile');
        return res.data;
    },

    async deleteProfile() {
        const res = await executeSupabaseRequest({
            url: 'people/delete',
            method: 'DELETE',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to delete profile');
        return res.data;
    },

    async uploadFile(formData) {
        const res = await executeSupabaseRequest({
            url: 'upload',
            method: 'POST',
            body: formData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to upload file');
        return res.data;
    },

    async reportProfile(data) {
        const res = await executeSupabaseRequest({
            url: 'people/report',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to report profile');
        return res.data;
    },

    async updateExperience(data) {
        const res = await executeSupabaseRequest({
            url: 'people/experience',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update experience');
        return res.data;
    },

    async updateEducation(data) {
        const res = await executeSupabaseRequest({
            url: 'people/education',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update education');
        return res.data;
    },

    async updateSkills(data) {
        const res = await executeSupabaseRequest({
            url: 'people/skills',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update skills');
        return res.data;
    },

    async updatePortfolio(data) {
        const res = await executeSupabaseRequest({
            url: 'people/portfolio',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update portfolio');
        return res.data;
    },

    async updateServices(data) {
        const res = await executeSupabaseRequest({
            url: 'people/services',
            method: 'PUT',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update services');
        return res.data;
    },

    async getExpertReviews(id) {
        const res = await executeSupabaseRequest({
            url: `people/${id}/reviews`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch expert reviews');
        return res.data;
    },

    async getExpertRating(id) {
        const res = await executeSupabaseRequest({
            url: `people/${id}/rating`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch rating');
        return res.data;
    },

    async addReview({ id, reviewData }) {
        const res = await executeSupabaseRequest({
            url: `people/${id}/reviews`,
            method: 'POST',
            body: reviewData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to add review');
        return res.data;
    },

    async toggleFollow(targetUserId) {
        const res = await executeSupabaseRequest({
            url: `people/${targetUserId}/follow`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to toggle follow');
        return res.data;
    },

    async followExpert(targetUserId) {
        const res = await executeSupabaseRequest({
            url: `people/${targetUserId}/follow`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to follow expert');
        return res.data;
    },

    async unfollowExpert(targetUserId) {
        const res = await executeSupabaseRequest({
            url: `people/${targetUserId}/unfollow`,
            method: 'POST',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to unfollow expert');
        return res.data;
    },

    async getFollowers(userId) {
        const res = await executeSupabaseRequest({
            url: `people/${userId}/followers`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch followers');
        return res.data;
    },

    async getFollowing(userId) {
        const res = await executeSupabaseRequest({
            url: `people/${userId}/following`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch following');
        return res.data;
    },

    async getMyFollowing() {
        const res = await executeSupabaseRequest({
            url: 'people/me/following',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my following');
        return res.data;
    },

    async checkFollowStatus(targetUserId) {
        const res = await executeSupabaseRequest({
            url: `people/${targetUserId}/is-following`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to check follow status');
        return res.data;
    },

    async getExpertPortfolio(id) {
        const res = await executeSupabaseRequest({
            url: `people/${id}/portfolio`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch portfolio');
        return res.data;
    },

    async getExpertRecommendations(id) {
        const res = await executeSupabaseRequest({
            url: `people/${id}/recommendations`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch recommendations');
        return res.data;
    },

    async trackAnalyticsEvent(data) {
        const res = await executeSupabaseRequest({
            url: 'analytics/track',
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to track analytics');
        return res.data;
    },
};

export default peopleService;
