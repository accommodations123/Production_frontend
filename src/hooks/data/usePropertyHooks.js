import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { propertyService } from '@/services/propertyService';
import { hostService } from '@/services/hostService';

export function useGetApprovedPropertiesQuery(params, options) {
    return useQuery(propertyService.getApprovedProperties, params, { tags: ['Property'], ...options });
}

export function useGetAllPropertiesQuery(params, options) {
    return useQuery(propertyService.getAllProperties, params, { tags: ['Property'], ...options });
}

export function useGetMyListingsQuery(args, options) {
    return useQuery(propertyService.getMyListings, args, { tags: ['Property'], ...options });
}

export function useGetPropertyByIdQuery(id, options) {
    return useQuery(() => propertyService.getPropertyById(id), id, { tags: ['Property'], ...options });
}

export function useCreatePropertyDraftMutation(options) {
    return useMutation(propertyService.createPropertyDraft, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyBasicMutation(options) {
    return useMutation(propertyService.updatePropertyBasic, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyAddressMutation(options) {
    return useMutation(propertyService.updatePropertyAddress, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyPricingMutation(options) {
    return useMutation(propertyService.updatePropertyPricing, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyAmenitiesMutation(options) {
    return useMutation(propertyService.updatePropertyAmenities, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyRulesMutation(options) {
    return useMutation(propertyService.updatePropertyRules, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyMediaMutation(options) {
    return useMutation(propertyService.updatePropertyMedia, { invalidatesTags: ['Property'], ...options });
}

export function useUpdatePropertyVideoMutation(options) {
    return useMutation(propertyService.updatePropertyVideo, { invalidatesTags: ['Property'], ...options });
}

export function useSubmitPropertyMutation(options) {
    return useMutation(propertyService.submitProperty, { invalidatesTags: ['Property'], ...options });
}

export function useDeletePropertyMutation(options) {
    return useMutation(propertyService.deleteProperty, { invalidatesTags: ['Property'], ...options });
}

export function useUploadFileMutation(options) {
    return useMutation(propertyService.uploadFile, options);
}

// Host helpers re-exported on propertyApi
export function useSaveHostMutation(options) {
    return useMutation(hostService.saveHost, { invalidatesTags: ['Host'], ...options });
}

export function useUpdateHostMutation(options) {
    return useMutation(hostService.updateHost, { invalidatesTags: ['Host'], ...options });
}

export function useGetHostProfileQuery(args, options) {
    return useQuery(hostService.getHostProfile, args, { tags: ['Host'], ...options });
}

export function useGetApprovedHostDetailsQuery(country, options) {
    return useQuery(() => hostService.getApprovedHostDetails(country), country, { tags: ['Host'], ...options });
}
