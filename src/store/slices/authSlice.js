import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../../lib/axiosClient';
import { resolveImageUrl } from '../../lib/imageUtils';
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

// --- Async Thunks ---

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('auth/me');
            const data = response.data;
            
            // Image Transform using Supabase Storage resolver
            const fixImage = (obj) => {
                if (obj?.profile_image && !obj.profile_image.startsWith('http')) {
                    obj.profile_image = resolveImageUrl(obj.profile_image);
                }
                return obj;
            };

            if (data?.user) {
                fixImage(data.user);
            } else if (data) {
                fixImage(data);
            }

            const userVal = data?.user || data;
            if (userVal) {
                localStorage.setItem("user", JSON.stringify(userVal));
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
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
            // Force RTK Query getMe subscribers to refetch with the new session
            dispatch(authApi.util.invalidateTags(['User']));
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
            const response = await axiosClient.post('otp/send-otp', payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            purgeAllUserCaches(dispatch);
            const response = await axiosClient.post('otp/verify-otp', payload);
            const data = response.data;
            const user = data?.user || data?.data?.user;
            const formatted = { ...data, user };
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }
            // Force RTK Query getMe subscribers to refetch with the new session
            dispatch(authApi.util.invalidateTags(['User']));
            return formatted;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Verification failed');
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
            const response = await axiosClient.post('otp/logout');
            purgeAllUserCaches(dispatch);
            return response.data;
        } catch (error) {
            purgeAllUserCaches(dispatch);
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
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
                state.user = action.payload?.user || action.payload;
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
