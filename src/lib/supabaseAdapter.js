import { supabase } from '@/lib/supabaseClient';

// Re-export utilities and schemas for backwards compatibility
export {
    PROFILE_COLUMNS,
    EVENT_COLUMNS,
    PROPERTY_COLUMNS,
    BUY_SELL_COLUMNS,
    TRAVEL_TRIP_COLUMNS,
    STAY_REQUEST_COLUMNS,
    JOB_COLUMNS,
    sanitizePayload,
    resilientInsert
} from './adapters/constants';

export {
    getCurrentUserObject,
    getCurrentUserId
} from './adapters/userUtils';

export {
    enrichWithProfiles,
    enrichPropertiesWithHostDetails,
    enrichEventsWithHostDetails,
    enrichBuySellWithHostDetails,
    enrichStayWithUserDetails,
    enrichTravelWithHostDetails,
    formatPersonProfile,
    formatUserProfile,
    enrichStayRequests
} from './adapters/enrichmentUtils';

export {
    getLocalWishlist,
    setLocalWishlist,
    parseFormDataWithUploads
} from './adapters/storageUtils';

import { parseFormDataWithUploads } from './adapters/storageUtils';

// Route Handlers
import { handlePropertiesRoute } from './adapters/routes/properties';
import { handleEventsRoute } from './adapters/routes/events';
import { handleMarketplaceRoute } from './adapters/routes/marketplace';
import { handleTravelRoute } from './adapters/routes/travel';
import { handleStayRequestsRoute } from './adapters/routes/stayRequests';
import { handleProfilesRoute } from './adapters/routes/profiles';
import { handlePeopleRoute } from './adapters/routes/people';
import { handleCareerRoute } from './adapters/routes/career';
import { handleWishlistRoute } from './adapters/routes/wishlist';
import { handleConnectionsRoute } from './adapters/routes/connections';
import { handleNotificationsRoute } from './adapters/routes/notifications';
import { handleContactRoute } from './adapters/routes/contact';

/**
 * Route request cleanly to Supabase PostgREST tables & Auth
 */
export async function executeSupabaseRequest(args) {
    if (!supabase) {
        return { error: { status: 'CUSTOM_ERROR', error: 'Supabase client not initialized' } };
    }

    const url = typeof args === 'string' ? args : args.url || '';
    const method = (typeof args === 'object' && args.method ? args.method.toUpperCase() : 'GET');
    let body = typeof args === 'object' ? args.body : undefined;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {}
    }
    const params = typeof args === 'object' && args.params ? args.params : {};

    const [pathOnly, queryString] = url.split('?');
    const cleanUrl = pathOnly.replace(/^\/+|\/+$/g, '');

    const queryParams = { ...params };
    if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value;
        }
    }

    const context = { cleanUrl, method, body, queryParams };

    try {
        let response;

        // 0. GENERIC FILE UPLOADS
        if ((cleanUrl === 'upload' || cleanUrl.startsWith('upload/') || cleanUrl.endsWith('/upload')) && method === 'POST') {
            const uploaded = body instanceof FormData ? await parseFormDataWithUploads(body, 'uploads') : {};
            const urls = uploaded.images || (uploaded.url ? [uploaded.url] : (uploaded.avatar ? [uploaded.avatar] : (uploaded.file ? [uploaded.file] : [])));
            return { data: { urls, url: urls[0] || null, data: { urls, url: urls[0] || null }, success: true } };
        }

        // 1. PROPERTIES / ACCOMMODATIONS
        response = await handlePropertiesRoute(context);
        if (response !== undefined) return response;

        // 2. EVENTS
        response = await handleEventsRoute(context);
        if (response !== undefined) return response;

        // 3. BUY & SELL / MARKETPLACE
        response = await handleMarketplaceRoute(context);
        if (response !== undefined) return response;

        // 4. TRAVEL / TRIPS
        response = await handleTravelRoute(context);
        if (response !== undefined) return response;

        // 5. STAY REQUESTS
        response = await handleStayRequestsRoute(context);
        if (response !== undefined) return response;

        // 6. PROFILES / HOST / USER
        response = await handleProfilesRoute(context);
        if (response !== undefined) return response;

        // 7. PEOPLE / EXPERTS / PROFESSIONALS
        response = await handlePeopleRoute(context);
        if (response !== undefined) return response;

        // 8. CAREER, JOBS & APPLICATIONS
        response = await handleCareerRoute(context);
        if (response !== undefined) return response;

        // 9. WISHLIST
        response = await handleWishlistRoute(context);
        if (response !== undefined) return response;

        // 10. CONNECTION REQUESTS
        response = await handleConnectionsRoute(context);
        if (response !== undefined) return response;

        // 11. NOTIFICATIONS
        response = await handleNotificationsRoute(context);
        if (response !== undefined) return response;

        // 12. CONTACT FORM SUBMISSIONS & ADMIN MESSAGES
        response = await handleContactRoute(context);
        if (response !== undefined) return response;

        // Default empty response
        return { data: {} };
    } catch (err) {
        console.error(`Supabase execute error on [${method}] ${cleanUrl}:`, err);
        return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Query failed' } };
    }
}
