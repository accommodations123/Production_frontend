import { supabase } from '@/lib/supabaseClient';

// Helper to get active user object
export async function getCurrentUserObject() {
    try {
        if (supabase) {
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) return data.session.user
        }
        const stored = localStorage.getItem('user')
        if (stored) {
            const parsed = JSON.parse(stored)
            return parsed?.user || parsed
        }
        return null
    } catch {
        return null
    }
}

// Helper to get active user ID
export async function getCurrentUserId() {
    try {
        const user = await getCurrentUserObject()
        return user?.id || user?.user_id || user?._id || null
    } catch {
        return null
    }
}
