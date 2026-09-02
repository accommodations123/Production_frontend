import { executeSupabaseRequest } from '@/lib/supabaseAdapter';

export const careerService = {
    async getJobs(params) {
        const res = await executeSupabaseRequest({
            url: 'career/jobs',
            method: 'GET',
            params,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch jobs');
        return res.data;
    },

    async getJobById(id) {
        if (!id) return null;
        const res = await executeSupabaseRequest({
            url: `career/jobs/${id}`,
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch job');
        return res.data;
    },

    async applyForJob({ jobId, data }) {
        const res = await executeSupabaseRequest({
            url: `career/jobs/${jobId}/apply`,
            method: 'POST',
            body: data,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to apply for job');
        return res.data;
    },

    async getMyApplications() {
        const res = await executeSupabaseRequest({
            url: 'career/my-applications',
            method: 'GET',
        });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch my applications');
        return res.data;
    },
};

export default careerService;
