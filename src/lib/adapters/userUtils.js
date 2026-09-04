import { supabase } from '@/lib/supabaseClient';

export async function getCurrentUserObject() {
    try {
        let authUser = null;
        if (supabase) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) authUser = data.session.user;
        }
        let storedUser = null;
        const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                storedUser = parsed?.user || parsed;
            } catch {}
        }
        
        const mergedId = authUser?.id || storedUser?.id || storedUser?.user_id;
        if (mergedId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', mergedId).maybeSingle();
                if (profile) {
                    return { ...authUser, ...storedUser, ...profile };
                }
            } catch {}
        }
        return authUser || storedUser || null;
    } catch {
        return null;
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
