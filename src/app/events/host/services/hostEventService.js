import axios from "axios";

const API_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "https://api.nextkinlife.live")
    : "/api";

// Helper function for API calls
export const apiCall = async (endpoint, method = "GET", data = null) => {
    try {
        const response =
            await axios({
                url: `${API_URL}${endpoint}`,
                method,
                data,
                withCredentials: true
            })

        return response.data
    } catch (error) {
        console.error(
            "API call error:",
            error
        )

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "API request failed"
        )
    }
}

// Function to compress image
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

export const hostEventService = {
    getEventById: async (id) => {
        return apiCall(`/events/${id}`, "GET")
    },
    createDraft: async (data) => {
        return apiCall("/events/create-draft", "POST", data)
    },
    updateBasicInfo: async (id, data) => {
        return apiCall(`/events/basic-info/${id}`, "PUT", data)
    },
    updateLocation: async (id, data) => {
        return apiCall(`/events/location/${id}`, "PUT", data)
    },
    updateVenue: async (id, data) => {
        return apiCall(`/events/venue/${id}`, "PUT", data)
    },
    updateSchedule: async (id, data) => {
        return apiCall(`/events/schedule/${id}`, "PUT", data)
    },
    updatePricing: async (id, price) => {
        return apiCall(`/events/pricing/${id}`, "PUT", { price })
    },
    submitEvent: async (id) => {
        return apiCall(`/events/submit/${id}`, "PUT")
    },
    uploadMedia: async (id, bannerImage, galleryImages, onProgress) => {
        const uploads = [];
        if (bannerImage) {
            uploads.push({ type: 'banner', file: bannerImage });
        }
        if (galleryImages && galleryImages.length > 0) {
            galleryImages.forEach(img => {
                uploads.push({ type: 'gallery', file: img });
            });
        }

        if (uploads.length === 0) {
            return { success: true };
        }

        const progressArray = new Array(uploads.length).fill(0);
        const updateOverallProgress = () => {
            if (onProgress) {
                const totalProgress = progressArray.reduce((sum, p) => sum + p, 0);
                onProgress(totalProgress / uploads.length);
            }
        };

        const uploadSingle = async (item, index) => {
            const mediaFormData = new FormData();

            if (item.type === 'banner') {
                mediaFormData.append("bannerImage", item.file);
            } else {
                mediaFormData.append("galleryImages", item.file);
            }

            try {
                const response =
                    await axios.put(
                        `${API_URL}/events/media/${id}`,
                        mediaFormData,
                        {
                            withCredentials: true,
                            onUploadProgress: (event) => {
                                if (!event.total) return;

                                const percentComplete = (event.loaded / event.total) * 100;
                                progressArray[index] = percentComplete;
                                updateOverallProgress();
                            }
                        }
                    );

                progressArray[index] = 100;
                updateOverallProgress();
                return response.data;
            } catch (error) {
                console.error(
                    "Error uploading event media:",
                    error
                );

                throw new Error(
                    error.response?.data?.message ||
                    "File upload failed. Please try again."
                );
            }
        };

        let lastResult = null;
        for (let i = 0; i < uploads.length; i++) {
            lastResult = await uploadSingle(uploads[i], i);
        }
        return lastResult;
    }
}
