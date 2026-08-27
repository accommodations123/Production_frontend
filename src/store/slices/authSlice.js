import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabaseClient';
import { CLOUDFRONT_BASE } from '../../lib/imageUtils';
import { authApi } from '@/store/api/authApi';
import { peopleApi } from '@/store/api/peopleApi';
import { connectionApi } from '@/store/api/connectionApi';
import { propertyApi } from '@/store/api/propertyApi';
import { marketplaceApi } from '@/store/api/marketplaceApi';
import { eventApi } from '@/store/api/eventApi';
import { travelApi } from '@/store/api/travelApi';
import { wishlistApi } from '@/store/api/wishlistApi';
import { hostApi } from '@/store/api/hostApi';
import { notificationApi } from '@/store/api/notificationApi';
import { stayRequestApi } from '@/store/api/stayRequestApi';

// Helper to purge all user-specific RTK Query caches & sensitive storage on auth boundaries
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
        if (dispatch) {
            dispatch(authApi.util.resetApiState());
            dispatch(peopleApi.util.resetApiState());
            dispatch(connectionApi.util.resetApiState());
            dispatch(propertyApi.util.resetApiState());
            dispatch(marketplaceApi.util.resetApiState());
            dispatch(eventApi.util.resetApiState());
            dispatch(travelApi.util.resetApiState());
            dispatch(wishlistApi.util.resetApiState());
            dispatch(hostApi.util.resetApiState());
            dispatch(notificationApi.util.resetApiState());
            dispatch(stayRequestApi.util.resetApiState());
        }
    } catch (e) {
        console.warn("⚠️ API state reset warning during logout:", e);
    }
};

// Safe localStorage parsing helper
const getInitialUser = () => {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const formatUserObject = (sessionUser, profile = {}) => {
    if (!sessionUser && !profile?.id) return null;
    const user = {
        id: sessionUser?.id || profile?.id,
        email: sessionUser?.email || profile?.email,
        name: sessionUser?.user_metadata?.full_name || sessionUser?.user_metadata?.name || profile?.name || profile?.full_name || sessionUser?.email?.split('@')[0],
        profile_image: profile?.profile_image || profile?.avatar || sessionUser?.user_metadata?.avatar_url || sessionUser?.user_metadata?.picture || null,
        ...(profile || {}),
        ...(sessionUser?.user_metadata || {})
    };

    if (user?.profile_image && !user.profile_image.startsWith('http')) {
        const key = user.profile_image.startsWith('/') ? user.profile_image : `/${user.profile_image}`;
        user.profile_image = `${CLOUDFRONT_BASE}${key}`;
    }

    return user;
};

// --- Async Thunks ---

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            if (!supabase) {
                return { user: null };
            }
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                return { user: null };
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            const user = formatUserObject(session.user, profile);
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }
            return { user };
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to fetch user profile');
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
            if (!supabase) throw new Error('Supabase client not initialized');
            purgeAllUserCaches(dispatch);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email || credentials.identifier,
                password: credentials.password,
            });

            if (error) throw error;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            const user = formatUserObject(data.user, profile);
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            dispatch(authApi.util.invalidateTags(['User']));
            return { user, session: data.session };
        } catch (error) {
            return rejectWithValue(error?.message || 'Login failed');
        }
    }
);

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (payload, { rejectWithValue }) => {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            const email = payload.email || payload.identifier;
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                }
            });
            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error?.message || 'Failed to send OTP');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            purgeAllUserCaches(dispatch);

            const email = payload.email || payload.identifier;
            const token = payload.otp || payload.token;

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });

            if (error) throw error;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            const user = formatUserObject(data.user, profile);
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            dispatch(authApi.util.invalidateTags(['User']));
            return { user, session: data.session };
        } catch (error) {
            return rejectWithValue(error?.message || 'Verification failed');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (formData, { rejectWithValue }) => {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) throw new Error('Not authenticated');

            const validColumns = new Set([
                'id', 'email', 'name', 'full_name', 'firstName', 'lastName',
                'role', 'status', 'is_approved', 'is_blocked', 'is_verified',
                'is_featured', 'phone', 'city', 'country', 'occupation',
                'headline', 'profession', 'rejection_reason', 'block_reason'
            ]);

            const payload = {};
            if (formData instanceof FormData) {
                for (const [key, value] of formData.entries()) {
                    if (validColumns.has(key)) payload[key] = value;
                }
            } else if (typeof formData === 'object' && formData !== null) {
                if (formData.name && !formData.full_name) payload.full_name = formData.name;
                if (formData.full_name && !formData.name) payload.name = formData.full_name;

                for (const [k, v] of Object.entries(formData)) {
                    if (validColumns.has(k) && v !== undefined) payload[k] = v;
                }
            }

            let profileData = null;
            if (Object.keys(payload).length > 0) {
                const { data, error } = await supabase
                    .from('profiles')
                    .update(payload)
                    .eq('id', session.user.id)
                    .select()
                    .maybeSingle();

                if (error) {
                    console.warn('Profile update warning:', error);
                }
                profileData = data;
            }

            const user = formatUserObject(session.user, profileData);
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }
            return { user };
        } catch (error) {
            return rejectWithValue(error?.message || 'Profile update failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
        } catch (error) {
            console.error('Supabase signOut error:', error);
        } finally {
            purgeAllUserCaches(dispatch);
        }
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
                state.user = action.payload?.user || null;
                state.isAuthenticated = !!state.user;
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
