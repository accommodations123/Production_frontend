import { supabase } from '@/lib/supabase/client';
import { executeSupabaseRequest } from '@/lib/supabaseAdapter';
import { resolveImageUrl } from '@/lib/imageUtils';

export const authService = {
    /**
     * Get current authenticated user details and profile
     */
    async getMe() {
        const res = await executeSupabaseRequest({ url: 'auth/me', method: 'GET' });
        if (res.error) throw new Error(res.error.error || 'Failed to fetch user');
        
        const response = res.data;
        const fixImage = (obj) => {
            if (obj?.profile_image && !obj.profile_image.startsWith('http')) {
                obj.profile_image = resolveImageUrl(obj.profile_image);
            }
            return obj;
        };

        if (response?.user && (response.user.id || response.user.email)) {
            fixImage(response.user);
            return response.user;
        } else if (response && (response.id || response.email)) {
            fixImage(response);
            return response;
        }
        return null;
    },

    /**
     * Authenticate with email & password
     */
    async login(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) throw new Error('Email and password required');

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fetch user profile from profiles table
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        const user = {
            id: data.user.id,
            email: data.user.email,
            ...profile,
            ...data.user.user_metadata,
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
            if (data.session?.access_token) {
                localStorage.setItem('token', data.session.access_token);
            }
        }

        return { user, session: data.session, token: data.session?.access_token };
    },

    /**
     * Sign out user from Supabase and local storage
     */
    async logout() {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn('Supabase signOut error:', e);
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('auth');
            localStorage.removeItem('session');
        }
        return { success: true };
    },

    /**
     * Send OTP to email or phone via Supabase Auth
     */
    async sendOtp({ email, phone }) {
        if (!email && !phone) throw new Error('Email or phone required');
        const res = await executeSupabaseRequest({
            url: 'otp/send-otp',
            method: 'POST',
            body: { email, phone },
        });
        if (res.error) throw new Error(res.error.error || 'Failed to send OTP');
        return res.data;
    },

    /**
     * Verify OTP code and return active user profile
     */
    async verifyOtp({ email, phone, otp, firstName, lastName }) {
        const res = await executeSupabaseRequest({
            url: 'otp/verify-otp',
            method: 'POST',
            body: { email, phone, otp, firstName, lastName },
        });
        if (res.error) throw new Error(res.error.error || 'Verification failed');
        const response = res.data;
        const user = response?.user || response?.data?.user;
        return { ...response, user };
    },

    /**
     * Update user profile
     */
    async updateUserProfile(formData) {
        const res = await executeSupabaseRequest({
            url: 'otp/update-profile',
            method: 'PUT',
            body: formData,
        });
        if (res.error) throw new Error(res.error.error || 'Failed to update profile');
        return res.data;
    },
};

export default authService;
