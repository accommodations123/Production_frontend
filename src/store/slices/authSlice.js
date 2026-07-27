import { createSlice } from '@reduxjs/toolkit'
import { authApi } from '@/store/api/authApi'

/** Safely parse the cached user from localStorage. */
function getInitialUser() {
    try {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

const initialUser = getInitialUser()

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: initialUser,
        isAuthenticated: !!initialUser,
        loading: false,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
            if (action.payload) {
                try {
                    localStorage.setItem('user', JSON.stringify(action.payload))
                } catch {
                    // Ignore localStorage failures in strict sandbox environments
                }
            }
        },
        clearUser: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            try {
                localStorage.removeItem('user')
            } catch {
                // Ignore
            }
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Sync auth state when getMe succeeds
            .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
                const user = action.payload?.user || action.payload
                state.user = user
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
                if (user) {
                    try {
                        localStorage.setItem('user', JSON.stringify(user))
                    } catch {
                        // Ignore
                    }
                }
            })
            // Clear auth state when getMe fails (session expired, etc.)
            .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.loading = false
                try {
                    localStorage.removeItem('user')
                } catch {
                    // Ignore
                }
            })
            // Clear auth state on successful logout
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.loading = false
                state.error = null
                try {
                    localStorage.removeItem('user')
                } catch {
                    // Ignore
                }
            })
    },
})

export const { setUser, clearUser, clearError } = authSlice.actions
export default authSlice.reducer
