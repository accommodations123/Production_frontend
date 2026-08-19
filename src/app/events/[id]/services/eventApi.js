import axios from "axios";

const API_URL = import.meta.env.PROD
    ? "https://api.nextkinlife.live"
    : "/api";

// API service functions for reviews
export const reviewService = {
    getEventReviews: async (eventId) => {
        try {
            const response =
                await axios.get(
                    `${API_URL}/events/reviews/${eventId}/reviews`,
                    { withCredentials: true }
                )

            const data = response.data

            // Process each review to ensure user data is properly extracted
            let reviews = []
            if (Array.isArray(data)) {
                reviews = data
            } else if (data && Array.isArray(data.reviews)) {
                reviews = data.reviews
            } else if (data && Array.isArray(data.data)) {
                reviews = data.data
            } else if (data && typeof data === 'object') {
                const possibleArrays = ['reviews', 'data', 'items', 'results']
                for (const prop of possibleArrays) {
                    if (Array.isArray(data[prop])) {
                        reviews = data[prop]
                        break
                    }
                }
            }

            return reviews.map(review => {
                const user = review.user || review.User || review.user_data || review.UserData || {}
                return {
                    ...review,
                    user_name: review.user_name || review.userName || review.reviewer_name ||
                        user?.name || user?.full_name || user?.first_name || 'Anonymous User',
                    user_avatar: review.user_avatar || review.userAvatar || review.avatar ||
                        user?.avatar || user?.profile_image || user?.photo,
                    user_role: review.user_role || review.userRole || review.role ||
                        user?.role || 'Attendee',
                    user_id: review.user_id || review.userId || review.user ||
                        user?.id || review?.id || null,
                    rating: review.rating || 0,
                    comment: review.comment || review.review_text || review.text || '',
                    created_at: review.created_at || review.createdAt || review.date || new Date().toISOString()
                }
            })
        } catch (error) {
            console.error('Error fetching reviews:', error)
            return []
        }
    },

    getEventRating: async (eventId) => {
        try {
            const response =
                await axios.get(
                    `${API_URL}/events/reviews/${eventId}/rating`,
                    { withCredentials: true }
                )

            return response.data
        } catch (error) {
            console.error('Error fetching rating:', error)
            return { rating: 0, count: 0 }
        }
    },

    submitReview: async (eventId, reviewData) => {
        try {
            const response =
                await axios.post(
                    `${API_URL}/events/reviews/${eventId}/reviews`,
                    reviewData,
                    {
                        withCredentials: true
                    }
                )

            return response.data
        } catch (error) {
            console.error('Error submitting review:', error)
            throw error
        }
    },

    hideReview: async (reviewId) => {
        try {
            const response =
                await axios.patch(
                    `${API_URL}/events/reviews/reviews/${reviewId}/hide`,
                    {},
                    {
                        withCredentials: true
                    }
                )

            return response.data
        } catch (error) {
            console.error('Error hiding review:', error)
            throw error
        }
    }
}

// API service functions for event participation
export const eventService = {
    joinEvent: async (eventId) => {
        try {
            const response =
                await axios.post(
                    `${API_URL}/events/${eventId}/join`,
                    {},
                    {
                        withCredentials: true
                    }
                )

            return { success: true, ...response.data }
        } catch (error) {
            console.error('Error joining event:', error)

            const message = error.response?.data?.message || ''
            if (error.response?.status === 400 && message.includes('already joined')) {
                return {
                    success: true,
                    alreadyRegistered: true,
                    message
                }
            }

            throw error
        }
    },

    leaveEvent: async (eventId) => {
        try {
            const response =
                await axios.post(
                    `${API_URL}/events/${eventId}/leave`,
                    {},
                    {
                        withCredentials: true
                    }
                )

            return { success: true, ...response.data }
        } catch (error) {
            console.error('Error leaving event:', error)
            throw error
        }
    },

    checkRegistrationStatus: async (eventId) => {
        try {
            const response =
                await axios.get(
                    `${API_URL}/events/${eventId}`,
                    {
                        withCredentials: true
                    }
                )

            const data = response.data

            if (data.is_registered !== undefined) {
                return { registered: data.is_registered }
            }

            return { registered: false }
        } catch (error) {
            console.error('Error checking registration status:', error)
            return { registered: false }
        }
    }
}
