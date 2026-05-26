import { axiosClient } from "@/lib/axiosClient";

const request = async (config) => {
    try {
        const response = await axiosClient(config);
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Request failed";

        throw new Error(message);
    }
};

export const hostService = {
    // === AUTH & OTP ===
    sendOtp: async (data) => {
        return request({
            url: "otp/send-otp",
            method: "POST",
            data
        });
    },

    verifyOtp: async (data) => {
        return request({
            url: "otp/verify-otp",
            method: "POST",
            data
        });
    },

    // Step 2: Host Details
    saveHost: async (data) => {
        return request({
            url: "host/save",
            method: "POST",
            data
        });
    },

    getHostProfile: async () => {
        return request({
            url: "host/get",
            method: "GET"
        });
    },

    // === PROPERTY FLOW ===
    uploadFile: async (formData) => {
        return request({
            url: "property/upload",
            method: "POST",
            data: formData
        });
    },

    createPropertyDraft: async (data) => {
        return request({
            url: "property/create-draft",
            method: "POST",
            data
        });
    },

    updatePropertyBasic: async (id, data) => {
        return request({
            url: `property/basic-info/${id}`,
            method: "PUT",
            data
        });
    },

    updatePropertyAddress: async (id, data) => {
        return request({
            url: `property/address/${id}`,
            method: "PUT",
            data
        });
    },

    updatePropertyPricing: async (id, data) => {
        return request({
            url: `property/pricing/${id}`,
            method: "PUT",
            data
        });
    },

    updatePropertyAmenities: async (id, amenities) => {
        return request({
            url: `property/amenities/${id}`,
            method: "PUT",
            data: { amenities }
        });
    },

    updatePropertyRules: async (id, rules) => {
        return request({
            url: `property/rules/${id}`,
            method: "PUT",
            data: { rules }
        });
    },

    updatePropertyMedia: async (id, formData) => {
        return request({
            url: `property/media/${id}`,
            method: "PUT",
            data: formData
        });
    },

    updatePropertyVideo: async (id, formData) => {
        return request({
            url: `property/media/video/${id}`,
            method: "PUT",
            data: formData
        });
    },

    updatePropertyLegal: async (id, formData) => {
        return request({
            url: `property/legal/${id}`,
            method: "POST",
            data: formData
        });
    },

    getPropertyDetails: async (id) => {
        return request({
            url: `property/${id}`,
            method: "GET"
        });
    },

    submitProperty: async (id) => {
        return request({
            url: `property/submit/${id}`,
            method: "PUT"
        });
    },

    createEvent: async (data) => {
        return request({
            url: "events/create",
            method: "POST",
            data
        });
    },

    createGroup: async (data) => {
        return request({
            url: "community",
            method: "POST",
            data
        });
    },

    createCommunityContribution: async (data) => {
        return request({
            url: "community/contributions",
            method: "POST",
            data
        });
    }
};
