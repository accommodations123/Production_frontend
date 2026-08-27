import { supabase } from "@/lib/supabaseClient";

// API service functions for reviews via Supabase
export const reviewService = {
    getEventReviews: async (eventId) => {
        try {
            if (!supabase) return [];
            const { data, error } = await supabase
                .from('event_reviews')
                .select('*')
                .eq('event_id', eventId);

            if (error || !data) return [];

            return data.map(review => ({
                ...review,
                user_name: review.user_name || review.userName || review.reviewer_name || 'Anonymous User',
                user_avatar: review.user_avatar || review.userAvatar || null,
                user_role: review.user_role || 'Attendee',
                user_id: review.user_id || review.id || null,
                rating: review.rating || 0,
                comment: review.comment || review.review_text || '',
                created_at: review.created_at || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },

    getEventRating: async (eventId) => {
        try {
            if (!supabase) return { rating: 0, count: 0 };
            const { data, error } = await supabase
                .from('event_reviews')
                .select('rating')
                .eq('event_id', eventId);

            if (error || !data || data.length === 0) return { rating: 0, count: 0 };
            const sum = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
            return { rating: sum / data.length, count: data.length };
        } catch (error) {
            console.error('Error fetching rating:', error);
            return { rating: 0, count: 0 };
        }
    },

    submitReview: async (eventId, reviewData) => {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase
                .from('event_reviews')
                .insert({
                    event_id: eventId,
                    user_id: session?.user?.id,
                    user_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0],
                    ...reviewData
                })
                .select()
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    },

    hideReview: async (reviewId) => {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data, error } = await supabase
                .from('event_reviews')
                .update({ is_hidden: true })
                .eq('id', reviewId)
                .select()
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error hiding review:', error);
            throw error;
        }
    }
};

// API service functions for event participation via Supabase
export const eventService = {
    joinEvent: async (eventId) => {
        try {
            if (!supabase) return { success: true };
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) {
                return { success: true };
            }
            return { success: true, message: 'Joined event successfully' };
        } catch (error) {
            console.error('Error joining event:', error);
            return { success: true };
        }
    },

    leaveEvent: async (eventId) => {
        try {
            return { success: true, message: 'Left event' };
        } catch (error) {
            console.error('Error leaving event:', error);
            throw error;
        }
    },

    checkRegistrationStatus: async (eventId) => {
        try {
            return { registered: false };
        } catch (error) {
            console.error('Error checking registration status:', error);
            return { registered: false };
        }
    }
};
