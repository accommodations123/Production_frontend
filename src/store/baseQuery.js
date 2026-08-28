import { supabase } from '@/lib/supabaseClient'
import { executeSupabaseRequest } from '@/lib/supabaseAdapter'

/**
 * Pure Supabase BaseQuery for Redux Toolkit Query
 * Direct queries against Supabase tables and authentication session.
 */
export async function baseQueryWithAuth(args, api, extraOptions) {
    try {
        const result = await executeSupabaseRequest(args)
        if (result && (result.data !== undefined || result.error !== undefined)) {
            return result
        }
        return { data: null }
    } catch (err) {
        // Suppress abort errors from navigation race conditions
        if (err?.name === 'AbortError') {
            return { error: { status: 'CUSTOM_ERROR', error: 'Request was cancelled.' } }
        }

        console.error('Supabase query fatal error', err)
        return {
            error: {
                status: 'CUSTOM_ERROR',
                error: err?.message || 'Something went wrong. Please try again.',
            },
        }
    }
}
