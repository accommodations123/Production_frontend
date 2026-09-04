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

    async applyForJob(payload) {
        const isObjectWithData = payload && typeof payload === 'object' && !(payload instanceof FormData) && ('data' in payload || 'jobId' in payload);
        const jobId = isObjectWithData ? payload.jobId : (payload instanceof FormData ? payload.get('job_id') || payload.get('jobId') : payload?.job_id || payload?.jobId);
        const body = isObjectWithData ? payload.data : payload;

        const res = await executeSupabaseRequest({
            url: jobId ? `career/jobs/${jobId}/apply` : 'career/apply',
            method: 'POST',
            body: body,
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
