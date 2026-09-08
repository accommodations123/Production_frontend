import { supabase } from '@/lib/supabaseClient';

let cachedUserObject = null;
let cachedUserTimestamp = 0;
const CACHE_TTL_MS = 15000; // 15 seconds in-memory cache to eliminate duplicate DB roundtrips

export function clearUserCache() {
    cachedUserObject = null;
    cachedUserTimestamp = 0;
}

export async function getCurrentUserObject(forceFresh = false) {
    if (!forceFresh && cachedUserObject && (Date.now() - cachedUserTimestamp < CACHE_TTL_MS)) {
        return cachedUserObject;
    }

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
                // Safeguard against browser navigator.locks stalls with 1500ms timeout
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 1500));
                const { data } = await Promise.race([sessionPromise, timeoutPromise]);
                if (data?.session?.user) authUser = data.session.user;
            } catch {}
        }
        
        const mergedId = storedUser?.id || storedUser?.user_id || authUser?.id;
        if (mergedId && supabase) {
            try {
                const profilePromise = supabase.from('profiles').select('*').eq('id', mergedId).maybeSingle();
                const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null }), 2000));
                const { data: profile } = await Promise.race([profilePromise, timeoutPromise]);
                if (profile) {
                    const merged = { ...authUser, ...storedUser, ...profile };
                    cachedUserObject = merged;
                    cachedUserTimestamp = Date.now();
                    return merged;
                }
            } catch {}
        }

        const fallback = storedUser || authUser || null;
        cachedUserObject = fallback;
        cachedUserTimestamp = Date.now();
        return fallback;
    } catch {
        return null;
    }
}

// Helper to get active user ID
export async function getCurrentUserId() {
    try {
        if (cachedUserObject?.id) return cachedUserObject.id;
        const user = await getCurrentUserObject();
        return user?.id || user?.user_id || user?._id || null;
    } catch {
        return null;
    }
}
