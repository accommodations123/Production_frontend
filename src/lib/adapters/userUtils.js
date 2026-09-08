import { supabase } from '@/lib/supabaseClient';

export async function getCurrentUserObject() {
    try {
        let storedUser = null;
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    storedUser = parsed?.user || parsed;
                }
                if (!storedUser) {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                            const raw = localStorage.getItem(k);
                            const parsed = JSON.parse(raw);
                            if (parsed?.user?.id) {
                                storedUser = parsed.user;
                                break;
                            }
                        }
                    }
                }
            } catch {}
        }

        let authUser = null;
        if (supabase) {
            try {
                const { data } = await supabase.auth.getSession();
                if (data?.session?.user) authUser = data.session.user;
            } catch {}
        }
        
        const mergedId = storedUser?.id || storedUser?.user_id || authUser?.id;
        if (mergedId && supabase) {
            try {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', mergedId).maybeSingle();
                if (profile) {
                    return { ...authUser, ...storedUser, ...profile };
                }
            } catch {}
        }
        return storedUser || authUser || null;
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
