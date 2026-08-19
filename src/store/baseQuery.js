import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
const API_BASE_URL = import.meta.env.PROD ? 'https://api.nextkinlife.live' : '/api';

// Inject country headers from localStorage into outgoing requests (skip if already set)
function injectCountryHeaders(headers) {
    if (headers.has('X-Country')) return headers

    const raw = localStorage.getItem('selectedCountry')
    if (!raw) return headers

    try {
        const country = JSON.parse(raw)
        if (country?.name) {
            headers.set('X-Country', country.name)
            if (country.code) headers.set('X-Country-Code', country.code)
        } else if (country?.code) {
            headers.set('X-Country', country.code)
        }
    } catch {
        // Ignore malformed JSON
    }
    return headers
}

const rawBase = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: injectCountryHeaders,
})

function isNetworkError(result) {
    if (!result?.error) return false
    const { status, error } = result.error
    return (
        status === 'FETCH_ERROR' ||
        status === 'TIMEOUT_ERROR' ||
        (typeof error === 'string' && /load failed|network|fetch/i.test(error))
    )
}

// Shared RTK Query base with retry, error handling, and auth cleanup
export async function baseQueryWithAuth(args, api, extraOptions) {
    try {
        let result = await rawBase(args, api, extraOptions)

        // Retry once on network-level errors
        if (isNetworkError(result)) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            result = await rawBase(args, api, extraOptions)
        }

        if (result.error) {
            const status = result.error.status
            const url = String(args.url || args)

            // Silently ignore expected errors
            const isExpected =
                status === 401 ||
                status === 403 ||
                (status === 404 && url.includes('host/get')) ||
                (status === 400 && (url.includes('/join') || url.includes('/leave'))) ||
                (status === 400 && url.includes('my-events'))

            if (!isExpected) {
                console.error(`RTK Request Error [${status}] on ${url}:`, result.error)
            }

            // Sync localStorage on auth errors
            if (status === 401 || status === 403) {
                localStorage.removeItem('user')
            }

            // Replace raw network error messages with user-friendly text
            if (isNetworkError(result)) {
                return {
                    error: {
                        status: 'FETCH_ERROR',
                        error: 'Unable to connect. Please check your internet connection and try again.',
                    },
                }
            }
        }

        return result
    } catch (err) {
        // Suppress abort errors from navigation race conditions
        if (err.name === 'AbortError') {
            return { error: { status: 'CUSTOM_ERROR', error: 'Request was cancelled.' } }
        }

        console.error('RTK baseQuery fatal error', err)
        return {
            error: {
                status: 'CUSTOM_ERROR',
                error: 'Something went wrong. Please try again.',
            },
        }
    }
}
