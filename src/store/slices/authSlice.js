import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../lib/axiosClient';
import { resolveImageUrl } from '../../lib/imageUtils';
import { supabase } from '@/lib/supabase';
import { invalidateTags } from '@/lib/supabase/eventBus';

// Helper to purge all user-specific caches & sensitive storage on auth boundaries
export const purgeAllUserCaches = (dispatch) => {
    try {
        localStorage.removeItem("user");
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("session");
        localStorage.removeItem("nxt_connection_requests_v1");
        localStorage.removeItem("nextkin_social_access_v1");
    } catch (e) {
        // Ignore
    }

    try {
        invalidateTags(['User', 'Property', 'Event', 'BuySell', 'Job', 'Trips', 'Notification', 'Wishlist', 'Host', 'Profile', 'StayRequests', 'ConnectionRequests']);
    } catch (e) {
        console.warn("⚠️ API cache invalidation warning during logout:", e);
    }
};

// Safe localStorage parsing helper
const getInitialUser = () => {
    try {
        const stored = localStorage.getItem("user");
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.email)) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
};

// --- Async Thunks ---

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            // Check Supabase session first
            const { data: sessionData } = await supabase.auth.getSession();
            const sbUser = sessionData?.session?.user;
            if (sbUser) {
                const token = sessionData.session?.access_token;
                if (token) localStorage.setItem('token', token);

                let profile = null;
                try {
                    const { data: prof } = await supabase.from('profiles').select('*').eq('id', sbUser.id).maybeSingle();
                    profile = prof;
                } catch (e) {
                    console.debug('Failed to fetch user profile:', e);
                }

                const user = {
                    id: sbUser.id,
                    email: sbUser.email,
                    name: profile?.full_name || profile?.name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
                    first_name: sbUser.user_metadata?.first_name || (profile?.full_name || sbUser.user_metadata?.full_name)?.split(' ')[0] || '',
                    last_name: sbUser.user_metadata?.last_name || (profile?.full_name || sbUser.user_metadata?.full_name)?.split(' ').slice(1).join(' ') || '',
                    profile_image: resolveImageUrl(profile?.profile_image || sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null),
                    ...sbUser.user_metadata,
                    ...(profile || {}),
                };
                localStorage.setItem('user', JSON.stringify(user));
                return { user };
            }

            // Check if user is stored in localStorage
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && (parsed.id || parsed.email)) {
                        return { user: parsed };
                    }
                } catch (parseError) {
                    console.debug('Failed to parse cached user:', parseError);
                }
            }

            // No active session found
            return { user: null };
        } catch (error) {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && (parsed.id || parsed.email)) {
                        return { user: parsed };
                    }
                } catch (parseError) {
                    console.debug('Failed to parse cached user on session error:', parseError);
                }
            }
            return { user: null };
        }
    },
    {
        condition: (_, { getState }) => {
            const { auth } = getState();
            if (auth.loading) {
                return false;
            }
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            purgeAllUserCaches(dispatch);
            const response = await axiosClient.post('login', credentials);
            // Force getMe subscribers to refetch with the new session
            invalidateTags(['User']);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (payload, { rejectWithValue }) => {
        try {
            const email = payload.email;
            if (!email) {
                return rejectWithValue('Email is required');
            }

            // Send OTP via Supabase Auth
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            });

            if (error) {
                // Fallback to axiosClient endpoint if Supabase client threw an error
                try {
                    const res = await axiosClient.post('otp/send-otp', payload);
                    return res.data;
                } catch {
                    return rejectWithValue(error.message || 'Failed to send OTP');
                }
            }

            return { success: true, message: 'OTP sent to your email', data };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to send OTP');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            purgeAllUserCaches(dispatch);
            const email = payload.email;
            const otp = payload.otp;

            // Try Supabase Auth verifyOtp
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (!error && data?.session) {
                const token = data.session.access_token;
                const rawUser = data.user;

                const user = {
                    id: rawUser.id,
                    email: rawUser.email,
                    name: rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || (payload.firstName ? `${payload.firstName} ${payload.lastName || ''}`.trim() : rawUser.email?.split('@')[0]),
                    first_name: payload.firstName || rawUser.user_metadata?.first_name || rawUser.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: payload.lastName || rawUser.user_metadata?.last_name || rawUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    profile_image: resolveImageUrl(rawUser.user_metadata?.avatar_url || rawUser.user_metadata?.picture || null),
                    ...rawUser.user_metadata,
                };

                if (token) localStorage.setItem('token', token);
                if (user) localStorage.setItem('user', JSON.stringify(user));

                invalidateTags(['User']);
                return { user, session: data.session, token };
            }

            // Fallback to custom backend verify-otp endpoint if needed
            const response = await axiosClient.post('otp/verify-otp', payload);
            const resData = response.data;
            const user = resData?.user || resData?.data?.user;
            const formatted = { ...resData, user };
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            invalidateTags(['User']);
            return formatted;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Verification failed');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put('otp/update-profile', formData);
            const data = response.data;
            const user = data?.user || data?.data?.user;
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Profile update failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await supabase.auth.signOut();
        } catch {
            // ignore
        }
        try {
            await axiosClient.post('otp/logout');
        } catch {
            // ignore
        }
        purgeAllUserCaches(dispatch);
        return { success: true };
    }
);

// --- Auth Slice ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: getInitialUser(),
        isAuthenticated: !!getInitialUser(),
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUserLocal: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            if (action.payload) {
                try {
                    localStorage.setItem("user", JSON.stringify(action.payload));
                } catch (e) {
                    // Ignore
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchCurrentUser
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                const raw = action.payload?.user !== undefined ? action.payload.user : action.payload;
                if (raw && (raw.id || raw.email)) {
                    state.user = raw;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.user = null;
                state.isAuthenticated = false;
                try {
                    localStorage.removeItem("user");
                } catch (e) {
                    // Ignore
                }
            })
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload?.user || action.payload;
                state.isAuthenticated = !!state.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // verifyOtp
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload?.user;
                state.isAuthenticated = !!state.user;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // updateProfile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload?.user || action.payload?.data?.user || state.user;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // logoutUser
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            });
    }
});

export const { clearError, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;
