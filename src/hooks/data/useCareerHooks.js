import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { careerService } from '@/services/careerService';

export function useGetJobsQuery(params, options) {
    return useQuery(careerService.getJobs, params, { tags: ['Job'], ...options });
}

export function useGetJobByIdQuery(id, options) {
    return useQuery(() => careerService.getJobById(id), id, { tags: ['Job'], ...options });
}

export function useApplyForJobMutation(options) {
    return useMutation(careerService.applyForJob, { invalidatesTags: ['Job'], ...options });
}

export function useGetMyApplicationsQuery(args, options) {
    return useQuery(careerService.getMyApplications, args, { tags: ['Job'], ...options });
}
