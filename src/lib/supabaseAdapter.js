import { supabase } from '@/lib/supabaseClient'
import { uploadToSupabaseStorage } from '@/lib/storageUtils'

/**
 * Direct Supabase API Adapter
 * Executes REST-like queries and mutations directly against Supabase database tables & auth.
 */

// Helper to get active user ID
async function getCurrentUserId() {
    try {
        if (!supabase) return null
        const { data } = await supabase.auth.getSession()
        return data?.session?.user?.id || null
    } catch {
        return null
    }
}

/**
 * Helper to extract fields and upload files from FormData
 */
async function parseFormDataWithUploads(formData, folder = 'uploads') {
    if (!formData || typeof formData.entries !== 'function') return formData || {}

    const result = {}
    const uploadedUrls = []

    for (const [key, value] of formData.entries()) {
        if (value instanceof File || (value && typeof value === 'object' && value.name && value.size)) {
            try {
                const publicUrl = await uploadToSupabaseStorage(value, folder)
                if (publicUrl) {
                    uploadedUrls.push(publicUrl)
                }
            } catch (uploadErr) {
                console.error(`Failed to upload file field [${key}] to Supabase:`, uploadErr)
            }
        } else {
            // Check for JSON string fields like existingImages
            if (key === 'existingImages') {
                try {
                    result[key] = JSON.parse(value)
                } catch {
                    result[key] = value
                }
            } else {
                result[key] = value
            }
        }
    }

    if (uploadedUrls.length > 0) {
        const existing = Array.isArray(result.existingImages) ? result.existingImages : []
        result.images = [...existing, ...uploadedUrls]
    }

    return result
}

const VALID_PROPERTY_COLUMNS = new Set([
    'id', 'host_id', 'host_name', 'hostName', 'user_name', 'phone', 'email',
    'title', 'description', 'category_id', 'property_type', 'privacy_type',
    'guests', 'guest_capacity', 'bedrooms', 'bathrooms', 'pets_allowed',
    'area', 'address', 'city', 'state', 'country', 'zip_code', 'photos',
    'images', 'video', 'amenities', 'rules', 'legal_docs', 'price_per_night',
    'price_per_month', 'price_per_hour', 'price', 'currency', 'status',
    'is_approved', 'rejection_reason', 'created_at', 'updated_at'
]);

function sanitizePropertyData(data) {
    if (!data || typeof data !== 'object') return {};
    const sanitized = {};

    // CamelCase to snake_case mappings
    if (data.categoryId && !data.category_id) sanitized.category_id = data.categoryId;
    if (data.category && !data.category_id) sanitized.category_id = data.category;
    if (data.propertyType && !data.property_type) sanitized.property_type = data.propertyType;
    if (data.privacyType && !data.privacy_type) sanitized.privacy_type = data.privacyType;
    if (data.petsAllowed !== undefined && data.pets_allowed === undefined) sanitized.pets_allowed = Boolean(data.petsAllowed);
    if (data.guestCapacity !== undefined && data.guest_capacity === undefined) sanitized.guest_capacity = Number(data.guestCapacity) || 1;
    if (data.capacity !== undefined && data.guests === undefined) sanitized.guests = Number(data.capacity) || 1;
    if (data.guests !== undefined) sanitized.guests = Number(data.guests) || 1;
    if (data.bedrooms !== undefined) sanitized.bedrooms = Number(data.bedrooms) || 0;
    if (data.bathrooms !== undefined) sanitized.bathrooms = Number(data.bathrooms) || 0;
    if (data.area !== undefined) sanitized.area = Number(data.area) || 0;
    if (data.sqft !== undefined && data.area === undefined) sanitized.area = Number(data.sqft) || 0;

    // Address mappings
    if (data.street_address && !data.address) sanitized.address = data.street_address;
    if (data.streetAddress && !data.address) sanitized.address = data.streetAddress;
    if (data.pincode && !data.zip_code) sanitized.zip_code = data.pincode;
    if (data.zipCode && !data.zip_code) sanitized.zip_code = data.zipCode;

    // Pricing mappings
    if (data.pricePerHour !== undefined) sanitized.price_per_hour = Number(data.pricePerHour) || 0;
    if (data.pricePerNight !== undefined) {
        sanitized.price_per_night = Number(data.pricePerNight) || 0;
        if (!sanitized.price) sanitized.price = Number(data.pricePerNight) || 0;
    }
    if (data.pricePerMonth !== undefined) {
        sanitized.price_per_month = Number(data.pricePerMonth) || 0;
        sanitized.price = Number(data.pricePerMonth) || sanitized.price || 0;
    }
    if (data.rent !== undefined && !sanitized.price) sanitized.price = Number(data.rent) || 0;
    if (data.price !== undefined) sanitized.price = Number(data.price) || 0;

    // Arrays & Media
    if (Array.isArray(data.amenities)) sanitized.amenities = data.amenities;
    if (Array.isArray(data.rules)) sanitized.rules = data.rules;
    if (Array.isArray(data.images)) {
        sanitized.images = data.images;
        sanitized.photos = data.images;
    }
    if (Array.isArray(data.photos)) {
        sanitized.photos = data.photos;
        if (!sanitized.images || sanitized.images.length === 0) sanitized.images = data.photos;
    }

    for (const [key, val] of Object.entries(data)) {
        if (VALID_PROPERTY_COLUMNS.has(key) && val !== undefined && sanitized[key] === undefined) {
            sanitized[key] = val;
        }
    }
    return sanitized;
}

const VALID_PROFILE_COLUMNS = new Set([
    'id', 'email', 'name', 'full_name', 'firstName', 'lastName',
    'role', 'status', 'is_approved', 'is_blocked', 'is_verified',
    'is_featured', 'phone', 'city', 'state', 'country', 'zip_code',
    'address', 'street_address', 'whatsapp', 'facebook', 'instagram',
    'id_proof_type', 'id_photo', 'selfie_photo', 'avatar_url', 'profile_image',
    'occupation', 'headline', 'profession', 'rejection_reason', 'block_reason'
]);

function sanitizeProfileData(data) {
    if (!data || typeof data !== 'object') return {};
    const sanitized = {};
    if (data.host_full_name && !data.full_name) sanitized.full_name = data.host_full_name;
    if (data.host_phone && !data.phone) sanitized.phone = data.host_phone;
    if (data.host_city && !data.city) sanitized.city = data.host_city;
    if (data.host_country && !data.country) sanitized.country = data.host_country;
    if (data.host_state && !data.state) sanitized.state = data.host_state;
    if (data.host_address && !data.address) sanitized.address = data.host_address;
    if (data.street_address && !data.address) sanitized.address = data.street_address;
    if (data.address && !data.street_address) sanitized.street_address = data.address;
    if (data.pincode && !data.zip_code) sanitized.zip_code = data.pincode;
    if (data.zipCode && !data.zip_code) sanitized.zip_code = data.zipCode;

    for (const [key, val] of Object.entries(data)) {
        if (VALID_PROFILE_COLUMNS.has(key) && val !== undefined && sanitized[key] === undefined) {
            sanitized[key] = val;
        }
    }
    return sanitized;
}

/**
 * Route request to Supabase table queries
 * @param {string|object} args - query url or object { url, method, body, params, headers }
 * @returns {Promise<{ data?: any, error?: any }>}
 */
export async function executeSupabaseRequest(args) {
    if (!supabase) {
        return { error: { status: 'CUSTOM_ERROR', error: 'Supabase client not initialized' } }
    }

    const url = typeof args === 'string' ? args : args.url || ''
    const method = (typeof args === 'object' && args.method ? args.method.toUpperCase() : 'GET')
    const body = typeof args === 'object' ? args.body : undefined
    const params = typeof args === 'object' && args.params ? args.params : {}

    // Extract query string parameters from URL if present
    const [pathOnly, queryString] = url.split('?')
    const cleanUrl = pathOnly.replace(/^\/+|\/+$/g, '') // remove leading/trailing slashes
    
    const queryParams = { ...params }
    if (queryString) {
        const searchParams = new URLSearchParams(queryString)
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value
        }
    }

    try {
        // ── 1. PROPERTIES ──────────────────────────────────────────
        if (cleanUrl.startsWith('property') || cleanUrl.startsWith('accommodations')) {
            if (cleanUrl === 'property/all' || cleanUrl === 'property/approved' || cleanUrl === 'property') {
                let query = supabase.from('properties').select('*')
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                if (queryParams.city) {
                    query = query.ilike('city', `%${queryParams.city}%`)
                }
                if (queryParams.state) {
                    query = query.ilike('state', `%${queryParams.state}%`)
                }
                if (queryParams.limit) {
                    query = query.limit(Number(queryParams.limit))
                }
                const { data, error } = await query
                if (error) throw error
                return { data: { properties: data || [], total: data?.length || 0 } }
            }

            if (cleanUrl === 'property/my-listings') {
                const userId = await getCurrentUserId()
                let query = supabase.from('properties').select('*')
                if (userId) {
                    query = query.eq('host_id', userId)
                }
                const { data, error } = await query
                if (error) {
                    return { data: { properties: [] } }
                }
                return { data: { properties: data || [] } }
            }

            if ((cleanUrl === 'property/create-draft' || cleanUrl === 'property/create' || cleanUrl === 'property') && method === 'POST') {
                const userId = await getCurrentUserId()
                const rawData = (body instanceof FormData) ? await parseFormDataWithUploads(body, 'properties') : (body || {})
                const payload = sanitizePropertyData(rawData)
                if (userId) payload.host_id = userId
                payload.status = payload.status || 'draft'
                const { data, error } = await supabase.from('properties').insert(payload).select().maybeSingle()
                if (error) {
                    console.error('Supabase property create error:', error)
                    return { error: { status: 400, error: error.message } }
                }
                return { data: { property: data, propertyId: data?.id, data: data, id: data?.id, message: 'Property created' } }
            }

            // Upload Property Photos
            if (cleanUrl.startsWith('property/media/upload') || cleanUrl.startsWith('property/media')) {
                const parts = cleanUrl.split('/')
                const propertyId = parts[parts.length - 1]
                let uploadedUrl = null

                if (body instanceof FormData) {
                    const file = body.get('photo') || body.get('file') || body.get('image')
                    if (file) {
                        uploadedUrl = await uploadToSupabaseStorage(file, 'properties')
                    }
                }

                if (propertyId && uploadedUrl) {
                    const { data: prop } = await supabase.from('properties').select('images, photos').eq('id', propertyId).maybeSingle()
                    const existingImgs = Array.isArray(prop?.images) ? prop.images : (Array.isArray(prop?.photos) ? prop.photos : [])
                    const updatedImgs = [...existingImgs, uploadedUrl]
                    await supabase.from('properties').update({ images: updatedImgs, photos: updatedImgs }).eq('id', propertyId)
                }

                return { data: { success: true, url: uploadedUrl, message: 'Image uploaded successfully' } }
            }

            const propertyMatch = cleanUrl.match(/^property\/([^/]+)$/)
            if (propertyMatch && method === 'GET') {
                const id = propertyMatch[1]
                const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: { property: null, host: null } }
                return { data: { property: data, host: null } }
            }

            if (cleanUrl.startsWith('property/basic-info') || cleanUrl.startsWith('property/address') || cleanUrl.startsWith('property/pricing') || cleanUrl.startsWith('property/amenities') || cleanUrl.startsWith('property/rules') || cleanUrl.startsWith('property/submit')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const rawData = (body instanceof FormData) ? await parseFormDataWithUploads(body, 'properties') : (body || {})
                    const payload = sanitizePropertyData(rawData)
                    if (cleanUrl.startsWith('property/submit')) {
                        payload.status = 'pending'
                        payload.is_approved = false
                    }
                    const { data, error } = await supabase.from('properties').update(payload).eq('id', id).select().maybeSingle()
                    if (error) {
                        console.error('Supabase property update error:', error)
                    }
                    if (data) return { data: { property: data, propertyId: data.id, data: data, id: data.id, success: true } }
                }
                return { data: { success: true, message: 'Property updated' } }
            }

            if (cleanUrl.startsWith('property/delete/') && method === 'DELETE') {
                const id = cleanUrl.split('/')[2]
                if (id) {
                    await supabase.from('properties').delete().eq('id', id)
                }
                return { data: { success: true, message: 'Property deleted' } }
            }

            // Generic properties fallback
            const { data } = await supabase.from('properties').select('*').limit(20)
            return { data: { properties: data || [] } }
        }

        // ── 2. HOST PROFILE ─────────────────────────────────────────
        if (cleanUrl.startsWith('host') || cleanUrl.startsWith('admin/approved') || cleanUrl.startsWith('admin/pending') || cleanUrl.startsWith('admin/rejected') || cleanUrl.startsWith('admin/host')) {
            if (cleanUrl === 'host/get') {
                const userId = await getCurrentUserId()
                if (!userId) return { data: { host: null } }
                const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                if (data) return { data: { host: data } }

                // Fallback from auth session
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user?.id === userId) {
                    const fallbackUser = {
                        id: userId,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                        role: 'user',
                        status: 'pending',
                        is_approved: false
                    }
                    await supabase.from('profiles').upsert(fallbackUser, { onConflict: 'id' })
                    return { data: { host: fallbackUser } }
                }
                return { data: { host: null } }
            }

            if (cleanUrl === 'admin/approved/approved-host-details' || cleanUrl === 'admin/host/approved') {
                let query = supabase.from('profiles').select('*').eq('is_approved', true)
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data, error } = await query
                if (error) return { data: [] }
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/pending/pending-host-details' || cleanUrl === 'admin/host/pending') {
                let query = supabase.from('profiles').select('*').or('is_approved.eq.false,status.eq.pending').eq('role', 'host')
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data, error } = await query
                if (error) return { data: [] }
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/rejected/rejected-host-details' || cleanUrl === 'admin/host/rejected') {
                let query = supabase.from('profiles').select('*').or('status.eq.rejected,is_blocked.eq.true').eq('role', 'host')
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data, error } = await query
                if (error) return { data: [] }
                return { data: data || [] }
            }

            // Admin approve/reject actions
            if (cleanUrl.startsWith('admin/host/approve') || cleanUrl.startsWith('admin/approved/')) {
                const parts = cleanUrl.split('/')
                const hostId = parts[parts.length - 1]
                if (hostId) {
                    const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true }).eq('id', hostId).select().maybeSingle()
                    return { data: { success: true, host: data, message: 'Host approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/host/reject') || cleanUrl.startsWith('admin/rejected/')) {
                const parts = cleanUrl.split('/')
                const hostId = parts[parts.length - 1]
                if (hostId) {
                    const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', hostId).select().maybeSingle()
                    return { data: { success: true, host: data, message: 'Host rejected' } }
                }
            }

            if (cleanUrl === 'host/save' || cleanUrl.startsWith('host/update')) {
                const userId = await getCurrentUserId()
                if (!userId) {
                    return { error: { status: 401, error: 'Unauthorized: Please sign in to submit your host application' } }
                }
                const parsedBody = (body instanceof FormData) ? await parseFormDataWithUploads(body, 'hosts') : body
                const sanitized = sanitizeProfileData(parsedBody)
                sanitized.role = 'host'
                sanitized.status = 'pending'
                sanitized.is_approved = false
                const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...sanitized }, { onConflict: 'id' }).select().maybeSingle()
                if (error) {
                    console.error('Supabase host save error:', error)
                    return { error: { status: 400, error: error.message } }
                }
                return { data: { host: data || { id: userId, ...sanitized, ...parsedBody } } }
            }
            return { data: { host: null } }
        }

        // ── 3. EVENTS ───────────────────────────────────────────────
        if (cleanUrl.startsWith('events') || cleanUrl.startsWith('event')) {
            if (cleanUrl === 'events/approved' || cleanUrl === 'events/all' || cleanUrl === 'events') {
                let query = supabase.from('events').select('*')
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                if (queryParams.limit) {
                    query = query.limit(Number(queryParams.limit))
                }
                const { data, error } = await query
                if (error) throw error
                return { data: { events: data || [], total: data?.length || 0 } }
            }

            const eventIdMatch = cleanUrl.match(/^events\/([^/]+)$/)
            if (eventIdMatch && method === 'GET') {
                const id = eventIdMatch[1]
                const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: { event: null } }
                return { data: { event: data } }
            }

            if (method === 'POST' && (cleanUrl === 'events' || cleanUrl === 'events/create')) {
                const userId = await getCurrentUserId()
                let payload = body
                if (body instanceof FormData) {
                    payload = await parseFormDataWithUploads(body, 'events')
                }
                const { data, error } = await supabase.from('events').insert({ ...(payload || {}), host_id: userId }).select().maybeSingle()
                if (error) throw error
                return { data: { event: data } }
            }

            const { data } = await supabase.from('events').select('*').limit(20)
            return { data: { events: data || [] } }
        }

        // ── 4. MARKETPLACE / BUY-SELL ──────────────────────────────
        if (cleanUrl.startsWith('buy-sell') || cleanUrl.startsWith('marketplace')) {
            if (cleanUrl === 'buy-sell/get' || cleanUrl === 'buy-sell/all' || cleanUrl === 'buy-sell') {
                let query = supabase.from('buy_sell').select('*')
                if (queryParams.country) {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                if (queryParams.category) {
                    query = query.eq('category', queryParams.category)
                }
                if (queryParams.limit) {
                    query = query.limit(Number(queryParams.limit))
                }
                const { data, error } = await query
                if (error) throw error
                return { data: { listings: data || [], total: data?.length || 0 } }
            }

            if (cleanUrl === 'buy-sell/my-buy-sell') {
                const userId = await getCurrentUserId()
                let query = supabase.from('buy_sell').select('*')
                if (userId) {
                    query = query.eq('user_id', userId)
                }
                const { data, error } = await query
                if (error) return { data: { listings: [] } }
                return { data: { listings: data || [] } }
            }

            const buySellMatch = cleanUrl.match(/^buy-sell\/get\/([^/]+)$/)
            if (buySellMatch && method === 'GET') {
                const id = buySellMatch[1]
                const { data, error } = await supabase.from('buy_sell').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: { listing: null } }
                return { data: { listing: data } }
            }

            if (cleanUrl === 'buy-sell/create' && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body
                if (body instanceof FormData) {
                    payload = await parseFormDataWithUploads(body, 'marketplace')
                }
                const { data, error } = await supabase.from('buy_sell').insert({ ...(payload || {}), user_id: userId }).select().maybeSingle()
                if (error) throw error
                return { data: { listing: data } }
            }

            const { data } = await supabase.from('buy_sell').select('*').limit(20)
            return { data: { listings: data || [] } }
        }

        // ── 5. TRAVEL / TRIPS ───────────────────────────────────────
        if (cleanUrl.startsWith('travel')) {
            if (cleanUrl === 'travel/trips' || cleanUrl === 'travel/trips/search') {
                let query = supabase.from('travel_trips').select('*')
                if (queryParams.country) {
                    query = query.or(`destination.ilike.%${queryParams.country}%,origin.ilike.%${queryParams.country}%`)
                }
                if (queryParams.limit) {
                    query = query.limit(Number(queryParams.limit))
                }
                const { data, error } = await query
                if (error) throw error
                return { data: { trips: data || [], total: data?.length || 0 } }
            }

            if (cleanUrl === 'travel/trips/me') {
                const userId = await getCurrentUserId()
                let query = supabase.from('travel_trips').select('*')
                if (userId) query = query.eq('host_id', userId)
                const { data, error } = await query
                if (error) return { data: { trips: [] } }
                return { data: { trips: data || [] } }
            }

            if (cleanUrl === 'travel/trips' && method === 'POST') {
                const userId = await getCurrentUserId()
                const { data, error } = await supabase.from('travel_trips').insert({ ...(body || {}), host_id: userId }).select().maybeSingle()
                if (error) throw error
                return { data: { trip: data } }
            }

            const tripMatch = cleanUrl.match(/^travel\/trips\/([^/]+)$/)
            if (tripMatch && method === 'GET') {
                const id = tripMatch[1]
                const { data, error } = await supabase.from('travel_trips').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: { trip: null } }
                return { data: { trip: data } }
            }

            const { data } = await supabase.from('travel_trips').select('*').limit(20)
            return { data: { trips: data || [] } }
        }

        // ── 6. STAY REQUESTS ────────────────────────────────────────
        if (cleanUrl.startsWith('stay-request')) {
            let query = supabase.from('stay_requests').select('*')
            if (queryParams.country) {
                query = query.ilike('country', `%${queryParams.country}%`)
            }
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) return { data: { requests: [] } }
            return { data: { requests: data || [] } }
        }

        // ── 7. JOBS / CAREERS ───────────────────────────────────────
        if (cleanUrl.startsWith('career') || cleanUrl.startsWith('jobs')) {
            let query = supabase.from('jobs').select('*')
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) return { data: { jobs: [] } }
            return { data: { jobs: data || [] } }
        }

        // ── 8. NOTIFICATIONS ────────────────────────────────────────
        if (cleanUrl.startsWith('notification')) {
            return { data: { notifications: [] } }
        }

        // ── 9. PEOPLE / CONNECTIONS ─────────────────────────────────
        if (cleanUrl.startsWith('people') || cleanUrl.startsWith('connections') || cleanUrl.startsWith('connection')) {
            let query = supabase.from('profiles').select('*')
            if (queryParams.country) query = query.ilike('country', `%${queryParams.country}%`)
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) return { data: { people: [] } }
            return { data: { people: data || [] } }
        }

        // ── 10. AUTH / ME ───────────────────────────────────────────
        if (cleanUrl === 'auth/me' || cleanUrl === 'user/me') {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    profile_image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
                    ...session.user.user_metadata
                }
                return { data: { user } }
            }
            return { data: { user: null } }
        }

        // ── 11. FILE UPLOAD ─────────────────────────────────────────
        if (cleanUrl === 'upload' && method === 'POST') {
            let file = null
            if (body instanceof FormData) {
                file = body.get('file') || body.get('image') || body.get('photo')
            }
            if (file) {
                const publicUrl = await uploadToSupabaseStorage(file, 'uploads')
                return { data: { url: publicUrl, success: true, message: 'Upload successful' } }
            }
            return { data: { url: '', message: 'Upload processed' } }
        }

        // Fallback default
        return { data: {} }
    } catch (err) {
        console.error(`Supabase Adapter Error on [${method}] ${cleanUrl}:`, err)
        return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Supabase Query Failed' } }
    }
}
