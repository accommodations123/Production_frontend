import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Single source of truth for Supabase Client with automatic session management and realtime
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Automatically synchronize Supabase session token to localStorage.token
if (typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.access_token && !localStorage.getItem('token')) {
        localStorage.setItem('token', data.session.access_token);
      }
    }).catch(() => {});
  } catch (err) {
    console.debug('Supabase token sync init note:', err);
  }
}

export default supabase;

