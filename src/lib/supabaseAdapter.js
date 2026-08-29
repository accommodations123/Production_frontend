import { supabase } from '@/lib/supabaseClient'
import { uploadToSupabaseStorage, uploadMultipleToSupabaseStorage } from '@/lib/storageUtils'

/**
 * Clean & Streamlined Supabase Adapter & PostgREST Router
 * Handles all database queries, mutations, profile enrichments, and storage uploads.
 */

// ── Database Schema Column Whitelists ──────────────────────────────
const PROFILE_COLUMNS = new Set([
    'id', 'email', 'name', 'full_name', 'firstName', 'lastName', 'role', 'status',
    'is_approved', 'is_blocked', 'is_verified', 'is_featured', 'phone', 'city',
    'country', 'occupation', 'headline', 'profession', 'rejection_reason', 'block_reason',
    'last_login_at', 'created_at', 'updated_at', 'state', 'zip_code', 'address',
    'street_address', 'whatsapp', 'facebook', 'instagram', 'id_proof_type', 'id_photo',
    'selfie_photo', 'profile_image', 'avatar_url'
]);

const EVENT_COLUMNS = new Set([
    'id', 'title', 'description', 'category', 'event_mode', 'location', 'venue_name',
    'venue_description', 'city', 'state', 'country', 'zip_code', 'landmark',
    'parking_info', 'accessibility_info', 'start_date', 'end_date', 'time', 'end_time',
    'price', 'capacity', 'organizer_name', 'organizer_email', 'phone', 'event_url',
    'banner_image', 'images', 'what_is_included', 'what_is_not_included', 'status',
    'is_approved', 'created_at', 'updated_at'
]);

const PROPERTY_COLUMNS = new Set([
    'id', 'host_id', 'host_name', 'hostName', 'user_name', 'phone', 'email', 'title',
    'description', 'category_id', 'property_type', 'privacy_type', 'guests', 'guest_capacity',
    'bedrooms', 'bathrooms', 'pets_allowed', 'area', 'address', 'city', 'state', 'country',
    'zip_code', 'photos', 'images', 'video', 'amenities', 'rules', 'legal_docs',
    'price_per_night', 'price_per_month', 'price_per_hour', 'price', 'currency', 'status',
    'is_approved', 'rejection_reason', 'created_at', 'updated_at'
]);

const BUY_SELL_COLUMNS = new Set([
    'id', 'title', 'name', 'description', 'category', 'status', 'price', 'currency',
    'city', 'country', 'zip_code', 'images', 'user_id', 'email', 'phone', 'whatsapp',
    'condition', 'created_at', 'updated_at'
]);

const TRAVEL_TRIP_COLUMNS = new Set([
    'id', 'title', 'status', 'price', 'host_id', 'destination', 'origin',
    'created_at', 'updated_at'
]);

const STAY_REQUEST_COLUMNS = new Set([
    'id', 'title', 'description', 'status', 'is_approved', 'currency', 'city',
    'country', 'images', 'photos', 'user_id', 'email', 'phone', 'guests', 'budget',
    'check_in', 'check_out', 'room_type', 'created_at', 'updated_at'
]);

const JOB_COLUMNS = new Set([
    'id', 'title', 'description', 'status', 'currency', 'location', 'job_type',
    'experience_level', 'salary_min', 'salary_max', 'requirements', 'skills',
    'responsibilities', 'created_at', 'updated_at'
]);

function sanitizePayload(payload, allowedColumns) {
    if (!payload || typeof payload !== 'object') return payload;
    const clean = {};
    for (const [key, value] of Object.entries(payload)) {
        if (allowedColumns.has(key)) {
            clean[key] = value;
        }
    }
    return clean;
}

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

// ── Profile Enrichment Helpers ─────────────────────────────────────
export async function enrichWithProfiles(items, idKey = 'host_id') {
    if (!items) return []
    const isSingle = !Array.isArray(items)
    const array = isSingle ? [items] : items
    if (array.length === 0) return isSingle ? items : []

    const userIds = [...new Set(array.map(item => item?.[idKey] || item?.user_id || item?.created_by).filter(Boolean))]
    const emails = [...new Set(array.map(item => item?.organizer_email || item?.email).filter(Boolean))]
    const userMap = new Map()
    const emailMap = new Map()

    if (userIds.length > 0) {
        try {
            const { data: userProfiles } = await supabase.from('profiles').select('*').in('id', userIds)
            if (userProfiles && Array.isArray(userProfiles)) {
                for (const u of userProfiles) {
                    userMap.set(u.id, u)
                    if (u.email) emailMap.set(u.email.toLowerCase(), u)
                }
            }
        } catch (err) {
            console.warn('Error fetching profiles by id:', err)
        }
    }

    if (emails.length > 0) {
        try {
            const missingEmails = emails.filter(em => !emailMap.has(em.toLowerCase()))
            if (missingEmails.length > 0) {
                const { data: emailProfiles } = await supabase.from('profiles').select('*').in('email', missingEmails)
                if (emailProfiles && Array.isArray(emailProfiles)) {
                    for (const u of emailProfiles) {
                        if (u.id) userMap.set(u.id, u)
                        if (u.email) emailMap.set(u.email.toLowerCase(), u)
                    }
                }
            }
        } catch (err) {
            console.warn('Error fetching profiles by email:', err)
        }
    }

    const enriched = array.map(item => {
        if (!item) return item
        const host = (item[idKey] ? userMap.get(item[idKey]) : null) ||
                     (item.user_id ? userMap.get(item.user_id) : null) ||
                     (item.created_by ? userMap.get(item.created_by) : null) ||
                     (item.organizer_email ? emailMap.get(item.organizer_email.toLowerCase()) : null)

        const hostFullName = host?.full_name || host?.name || [host?.first_name, host?.last_name].filter(Boolean).join(' ') || item.host_name || item.hostName || item.organizer_name || item.organizer || "Host"
        const hostPhone = host?.phone || host?.whatsapp || item.phone || null
        const hostEmail = host?.email || item.email || item.organizer_email || null
        const hostImg = host?.profile_image || host?.avatar_url || host?.selfie_photo || item.host_image || null
        const hostIsApproved = host?.is_approved !== undefined ? Boolean(host.is_approved) : (host?.status === 'approved')
        const hostStatus = host?.status || (hostIsApproved ? 'approved' : 'pending')

        const hostObj = host ? {
            ...host,
            full_name: hostFullName,
            name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            profile_image: hostImg,
            selfie_photo: hostImg,
            is_approved: hostIsApproved,
            status: hostStatus,
            User: host
        } : {
            full_name: hostFullName,
            name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            profile_image: hostImg,
            selfie_photo: hostImg,
            is_approved: true,
            status: 'approved',
            User: {
                full_name: hostFullName,
                name: hostFullName,
                email: hostEmail,
                profile_image: hostImg,
                selfie_photo: hostImg,
            }
        }

        return {
            ...item,
            host_name: hostFullName,
            hostName: hostFullName,
            organizer_name: item.organizer_name || hostFullName,
            phone: item.phone || hostPhone,
            email: item.email || hostEmail,
            host_phone: hostPhone,
            host_email: hostEmail,
            host_status: hostStatus,
            host_is_approved: hostIsApproved,
            Host: hostObj,
            host: hostObj,
            User: hostObj.User || hostObj,
            user: hostObj.User || hostObj,
        }
    })

    return isSingle ? enriched[0] : enriched
}

export const enrichPropertiesWithHostDetails = (items) => enrichWithProfiles(items, 'host_id')
export const enrichEventsWithHostDetails = (items) => enrichWithProfiles(items, 'host_id')
export const enrichBuySellWithHostDetails = (items) => enrichWithProfiles(items, 'user_id')

// ── Wishlist Local Fallback Helpers ────────────────────────────────
function getLocalWishlist(userId) {
    try {
        const raw = localStorage.getItem(`user_wishlist_${userId || 'guest'}`)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function setLocalWishlist(userId, list) {
    try {
        localStorage.setItem(`user_wishlist_${userId || 'guest'}`, JSON.stringify(list))
    } catch {}
}

// ── Parse Form Data with Supabase Uploads ──────────────────────────
export async function parseFormDataWithUploads(formData, folder = 'uploads') {
    const parsed = {}
    const uploadPromises = []

    for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
            uploadPromises.push(
                uploadToSupabaseStorage(value, folder).then(url => {
                    if (key.endsWith('[]') || key === 'images' || key === 'photos' || key === 'galleryImages') {
                        const cleanKey = key.replace('[]', '')
                        parsed[cleanKey] = parsed[cleanKey] || []
                        parsed[cleanKey].push(url)
                    } else {
                        parsed[key] = url
                    }
                })
            )
        } else if (typeof value === 'string') {
            try {
                parsed[key] = JSON.parse(value)
            } catch {
                parsed[key] = value
            }
        } else {
            parsed[key] = value
        }
    }

    if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
    }

    return parsed
}

/**
 * Route request cleanly to Supabase PostgREST tables & Auth
 */
export async function executeSupabaseRequest(args) {
    if (!supabase) {
        return { error: { status: 'CUSTOM_ERROR', error: 'Supabase client not initialized' } }
    }

    const url = typeof args === 'string' ? args : args.url || ''
    const method = (typeof args === 'object' && args.method ? args.method.toUpperCase() : 'GET')
    let body = typeof args === 'object' ? args.body : undefined
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body)
        } catch {}
    }
    const params = typeof args === 'object' && args.params ? args.params : {}

    const [pathOnly, queryString] = url.split('?')
    const cleanUrl = pathOnly.replace(/^\/+|\/+$/g, '')

    const queryParams = { ...params }
    if (queryString) {
        const searchParams = new URLSearchParams(queryString)
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value
        }
    }

    try {
        // ── 1. PROPERTIES / ACCOMMODATIONS ─────────────────────────
        if (cleanUrl.startsWith('propert') || cleanUrl.startsWith('accommodation') || cleanUrl.startsWith('admin/properties') || cleanUrl.startsWith('admin/pending/pending-properties') || cleanUrl.startsWith('admin/approved/approved-properties') || cleanUrl.startsWith('admin/rejected/rejected-properties')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('properties').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                return { data: { success: true, property: data, message: 'Property approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('properties').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                return { data: { success: true, property: data, message: 'Property rejected' } }
            }
            if (cleanUrl.includes('pending') && method === 'GET') {
                const { data } = await supabase.from('properties').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                return { data: await enrichPropertiesWithHostDetails(data || []) }
            }
            if (cleanUrl.includes('rejected') && method === 'GET') {
                const { data } = await supabase.from('properties').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                return { data: await enrichPropertiesWithHostDetails(data || []) }
            }
            if (cleanUrl === 'property/my-listings' || cleanUrl === 'property/my-properties') {
                const userId = await getCurrentUserId()
                let q = supabase.from('properties').select('*').order('created_at', { ascending: false })
                if (userId) q = q.eq('host_id', userId)
                const { data } = await q
                return { data: { properties: await enrichPropertiesWithHostDetails(data || []) } }
            }
            if ((cleanUrl.startsWith('property/create') || cleanUrl === 'property' || cleanUrl === 'property/create-draft') && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'properties') : { ...(body || {}) }
                payload.host_id = userId || payload.host_id
                payload.status = payload.status || 'pending'

                // Map aliases
                if (payload.categoryId && !payload.category_id) payload.category_id = payload.categoryId;
                if (payload.propertyType && !payload.property_type) payload.property_type = payload.propertyType;
                if (payload.privacyType && !payload.privacy_type) payload.privacy_type = payload.privacyType;
                if (payload.street_address && !payload.address) payload.address = payload.street_address;
                if (payload.address && !payload.street_address) payload.street_address = payload.address;
                if (payload.petsAllowed !== undefined) payload.pets_allowed = Boolean(Number(payload.petsAllowed));
                if (payload.area !== undefined) payload.area = Number(payload.area) || null;
                if (payload.guests !== undefined) payload.guests = Number(payload.guests) || 1;
                if (payload.bedrooms !== undefined) payload.bedrooms = Number(payload.bedrooms) || 0;
                if (payload.bathrooms !== undefined) payload.bathrooms = Number(payload.bathrooms) || 0;

                // Price mapping
                if (payload.pricePerHour !== undefined || payload.priceNight !== undefined || payload.pricePerNight !== undefined || payload.priceWeek !== undefined || payload.priceMonth !== undefined || payload.pricePerMonth !== undefined || payload.price !== undefined || payload.rent !== undefined) {
                    const night = Number(payload.priceNight ?? payload.pricePerNight ?? payload.price_per_night ?? payload.price) || 0;
                    const month = Number(payload.priceMonth ?? payload.pricePerMonth ?? payload.price_per_month) || 0;
                    const hour = Number(payload.pricePerHour ?? payload.price_per_hour) || 0;
                    payload.price_per_night = night;
                    payload.price_per_month = month;
                    payload.price_per_hour = hour;
                    payload.price = night || month || hour || Number(payload.price) || 0;
                }

                payload.images = payload.images || payload.photos || []
                payload.photos = payload.photos || payload.images || []

                const clean = sanitizePayload(payload, PROPERTY_COLUMNS)
                const { data, error } = await supabase.from('properties').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { propertyId: data?.id, id: data?.id, data, property: data, success: true } }
            }

            // Step & general updates: property/basic-info/:id, property/address/:id, property/pricing/:id, property/amenities/:id, property/rules/:id, property/media/:id, property/submit/:id, property/update/:id
            if (cleanUrl.startsWith('property/') && (method === 'PUT' || method === 'PATCH' || method === 'POST') && !cleanUrl.includes('create') && !cleanUrl.includes('delete') && !cleanUrl.startsWith('property/get')) {
                const id = cleanUrl.split('/').pop()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'properties') : { ...(body || {}) }

                // Map aliases
                if (payload.categoryId && !payload.category_id) payload.category_id = payload.categoryId;
                if (payload.propertyType && !payload.property_type) payload.property_type = payload.propertyType;
                if (payload.privacyType && !payload.privacy_type) payload.privacy_type = payload.privacyType;
                if (payload.street_address && !payload.address) payload.address = payload.street_address;
                if (payload.address && !payload.street_address) payload.street_address = payload.address;
                if (payload.petsAllowed !== undefined) payload.pets_allowed = Boolean(Number(payload.petsAllowed));
                if (payload.area !== undefined) payload.area = Number(payload.area) || null;
                if (payload.guests !== undefined) payload.guests = Number(payload.guests) || 1;
                if (payload.bedrooms !== undefined) payload.bedrooms = Number(payload.bedrooms) || 0;
                if (payload.bathrooms !== undefined) payload.bathrooms = Number(payload.bathrooms) || 0;

                // Price mapping
                if (payload.pricePerHour !== undefined || payload.priceNight !== undefined || payload.pricePerNight !== undefined || payload.priceWeek !== undefined || payload.priceMonth !== undefined || payload.pricePerMonth !== undefined || payload.price !== undefined || payload.rent !== undefined) {
                    const night = Number(payload.priceNight ?? payload.pricePerNight ?? payload.price_per_night ?? payload.price) || 0;
                    const month = Number(payload.priceMonth ?? payload.pricePerMonth ?? payload.price_per_month) || 0;
                    const hour = Number(payload.pricePerHour ?? payload.price_per_hour) || 0;
                    payload.price_per_night = night;
                    payload.price_per_month = month;
                    payload.price_per_hour = hour;
                    payload.price = night || month || hour || Number(payload.price) || 0;
                }

                // Photos / Media
                if (cleanUrl.includes('media') || cleanUrl.includes('photos') || cleanUrl.includes('photo')) {
                    const photoUrl = payload.photo || payload.photos || payload.image || payload.images;
                    if (photoUrl) {
                        const { data: cur } = await supabase.from('properties').select('photos, images').eq('id', id).maybeSingle();
                        const curPhotos = Array.isArray(cur?.photos) ? cur.photos : [];
                        const curImages = Array.isArray(cur?.images) ? cur.images : [];
                        const added = Array.isArray(photoUrl) ? photoUrl : [photoUrl];
                        payload.photos = [...new Set([...curPhotos, ...added])];
                        payload.images = [...new Set([...curImages, ...added])];
                    }
                }

                // Submit step
                if (cleanUrl.includes('submit')) {
                    payload.status = 'approved';
                    payload.is_approved = true;
                }

                const clean = sanitizePayload(payload, PROPERTY_COLUMNS)
                const { data, error } = await supabase.from('properties').update(clean).eq('id', id).select().maybeSingle()
                if (error) throw error
                return { data: { property: data, data, success: true } }
            }

            if (cleanUrl.startsWith('property/delete/') || (cleanUrl.startsWith('property/') && method === 'DELETE')) {
                const id = cleanUrl.split('/').pop()
                await supabase.from('properties').delete().eq('id', id)
                return { data: { success: true } }
            }

            // Single Item: matches /property/get/:id or /property/:id or /accommodations/:id
            const singleMatch = cleanUrl.match(/^(?:property\/get|property|properties|accommodations)\/([^/]+)$/)
            if (singleMatch && method === 'GET' && !['get', 'all', 'approved', 'pending', 'rejected', 'my-listings', 'my-properties', 'search'].includes(singleMatch[1])) {
                const { data } = await supabase.from('properties').select('*').eq('id', singleMatch[1]).maybeSingle()
                return { data: { property: await enrichPropertiesWithHostDetails(data) } }
            }

            // Public List
            let query = supabase.from('properties').select('*').neq('status', 'rejected').order('created_at', { ascending: false })
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichPropertiesWithHostDetails(data || [])
            return { data: { properties: enriched, total: enriched.length } }
        }

        // ── 2. EVENTS ───────────────────────────────────────────────
        if (cleanUrl.startsWith('events') || cleanUrl.startsWith('event') || cleanUrl.startsWith('admin/events') || cleanUrl.startsWith('admin/pending/pending-events') || cleanUrl.startsWith('admin/approved/approved-events') || cleanUrl.startsWith('admin/rejected/rejected-events')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('events').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                return { data: { success: true, event: data, message: 'Event approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('events').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                return { data: { success: true, event: data, message: 'Event rejected' } }
            }
            if (cleanUrl.includes('pending') && method === 'GET') {
                const { data } = await supabase.from('events').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                return { data: await enrichEventsWithHostDetails(data || []) }
            }
            if (cleanUrl.includes('rejected') && method === 'GET') {
                const { data } = await supabase.from('events').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                return { data: await enrichEventsWithHostDetails(data || []) }
            }
            if (cleanUrl === 'events/my-events' || cleanUrl === 'events/my-listings' || cleanUrl === 'events/host/my-events') {
                const userObj = await getCurrentUserObject()
                const userEmail = userObj?.email || userObj?.user?.email
                let q = supabase.from('events').select('*').order('created_at', { ascending: false })
                if (userEmail) {
                    q = q.eq('organizer_email', userEmail)
                }
                const { data } = await q
                return { data: { events: await enrichEventsWithHostDetails(data || []) } }
            }
            if (cleanUrl.endsWith('/join') && method === 'POST') {
                const id = cleanUrl.split('/')[1]
                const { data: cur } = await supabase.from('events').select('attendees_count').eq('id', id).maybeSingle()
                await supabase.from('events').update({ attendees_count: (cur?.attendees_count || 0) + 1 }).eq('id', id)
                return { data: { success: true, is_registered: true } }
            }
            if (cleanUrl.endsWith('/leave') && method === 'POST') {
                const id = cleanUrl.split('/')[1]
                const { data: cur } = await supabase.from('events').select('attendees_count').eq('id', id).maybeSingle()
                await supabase.from('events').update({ attendees_count: Math.max(0, (cur?.attendees_count || 1) - 1) }).eq('id', id)
                return { data: { success: true, is_registered: false } }
            }
            if (cleanUrl.includes('reviews')) {
                const parts = cleanUrl.split('/')
                const eventId = parts[2]
                if (cleanUrl.endsWith('/rating')) {
                    const { data: revs } = await supabase.from('event_reviews').select('rating').eq('event_id', eventId)
                    const count = revs?.length || 0
                    const avg = count ? (revs.reduce((a, b) => a + (Number(b.rating) || 0), 0) / count) : 0
                    return { data: { rating: Number(avg.toFixed(1)), count } }
                }
                if (method === 'GET') {
                    const { data: revs } = await supabase.from('event_reviews').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
                    return { data: { reviews: revs || [], total: revs?.length || 0 } }
                }
                if (method === 'POST') {
                    const userId = await getCurrentUserId()
                    const { data: newRev } = await supabase.from('event_reviews').insert({ ...(body || {}), event_id: eventId, user_id: userId }).select().maybeSingle()
                    return { data: { success: true, review: newRev || body } }
                }
            }
            if ((cleanUrl.startsWith('events/create') || cleanUrl === 'events') && method === 'POST') {
                const userObj = await getCurrentUserObject()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'events') : { ...(body || {}) }
                
                // Map and normalize event fields
                payload.organizer_email = payload.organizer_email || payload.email || userObj?.email
                payload.organizer_name = payload.organizer_name || payload.host_name || userObj?.full_name || userObj?.name || 'Organizer'
                payload.phone = payload.phone || userObj?.phone
                payload.start_date = payload.start_date || payload.date
                payload.category = payload.category || payload.event_type || 'meetup'
                payload.banner_image = payload.banner_image || payload.bannerImage || payload.banner
                payload.images = payload.images || payload.galleryImages || (payload.banner_image ? [payload.banner_image] : [])
                payload.status = payload.status || 'pending'
                payload.is_approved = false

                const clean = sanitizePayload(payload, EVENT_COLUMNS)
                const { data, error } = await supabase.from('events').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { event: data, id: data?.id, success: true } }
            }
            if (cleanUrl.startsWith('events/media/')) {
                const id = cleanUrl.split('/').pop()
                const uploaded = body instanceof FormData ? await parseFormDataWithUploads(body, 'events') : {}
                if (id && (uploaded.banner_image || uploaded.images)) {
                    await supabase.from('events').update(sanitizePayload(uploaded, EVENT_COLUMNS)).eq('id', id)
                }
                return { data: { success: true, ...uploaded } }
            }
            if (cleanUrl.startsWith('events/basic-info/') || cleanUrl.startsWith('events/location/') || cleanUrl.startsWith('events/venue/') || cleanUrl.startsWith('events/schedule/') || cleanUrl.startsWith('events/pricing/') || cleanUrl.startsWith('events/submit/') || cleanUrl.startsWith('events/update/')) {
                const id = cleanUrl.split('/').pop()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'events') : { ...(body || {}) }
                if (cleanUrl.startsWith('events/submit/')) payload.status = 'pending'
                const clean = sanitizePayload(payload, EVENT_COLUMNS)
                const { data, error } = await supabase.from('events').update(clean).eq('id', id).select().maybeSingle()
                if (error) throw error
                return { data: { event: data, success: true } }
            }
            if (cleanUrl.startsWith('events/delete/') || (cleanUrl.startsWith('events/') && method === 'DELETE')) {
                const id = cleanUrl.split('/').pop()
                await supabase.from('events').delete().eq('id', id)
                return { data: { success: true } }
            }

            // Single Item: matches /events/get/:id or /events/:id
            const eventSingleMatch = cleanUrl.match(/^(?:events\/get|events|event)\/([^/]+)$/)
            if (eventSingleMatch && method === 'GET' && !['get', 'all', 'approved', 'pending', 'rejected', 'my-events', 'my-listings', 'host', 'search'].includes(eventSingleMatch[1])) {
                const { data } = await supabase.from('events').select('*').eq('id', eventSingleMatch[1]).maybeSingle()
                return { data: { event: await enrichEventsWithHostDetails(data), is_registered: false } }
            }

            // Public List
            let query = supabase.from('events').select('*').neq('status', 'rejected').order('created_at', { ascending: false })
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichEventsWithHostDetails(data || [])
            return { data: { events: enriched, total: enriched.length } }
        }

        // ── 3. BUY & SELL / MARKETPLACE ─────────────────────────────
        if (cleanUrl.startsWith('buy-sell') || cleanUrl.startsWith('marketplace') || cleanUrl.startsWith('admin/buysell') || cleanUrl.startsWith('admin/buy-sell')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('buy_sell').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                return { data: { success: true, listing: data } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('buy_sell').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                return { data: { success: true, listing: data } }
            }
            if (cleanUrl.includes('sold')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.indexOf('sold') - 1] || parts.pop()
                const { data } = await supabase.from('buy_sell').update({ is_sold: true, status: 'sold' }).eq('id', id).select().maybeSingle()
                return { data: { success: true, listing: data } }
            }
            if (cleanUrl.includes('pending') && method === 'GET') {
                const { data } = await supabase.from('buy_sell').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                return { data: await enrichBuySellWithHostDetails(data || []) }
            }
            if (cleanUrl.includes('my-listings') || cleanUrl.includes('my-items') || cleanUrl.includes('my-buy-sell')) {
                const userId = await getCurrentUserId()
                let q = supabase.from('buy_sell').select('*').order('created_at', { ascending: false })
                if (userId) q = q.eq('user_id', userId)
                const { data } = await q
                return { data: { listings: await enrichBuySellWithHostDetails(data || []) } }
            }
            if ((cleanUrl.startsWith('buy-sell/create') || cleanUrl === 'buy-sell' || cleanUrl === 'marketplace/create') && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'marketplace') : { ...(body || {}) }
                payload.user_id = userId || payload.user_id || payload.host_id
                payload.title = payload.title || payload.name
                payload.images = payload.images || payload.photos || []
                payload.status = payload.status || 'pending'
                const clean = sanitizePayload(payload, BUY_SELL_COLUMNS)
                const { data, error } = await supabase.from('buy_sell').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { listing: data, success: true } }
            }
            if (cleanUrl.startsWith('buy-sell/update/') || (cleanUrl.startsWith('buy-sell/') && (method === 'PUT' || method === 'PATCH') && !cleanUrl.includes('sold'))) {
                const id = cleanUrl.split('/').pop()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'marketplace') : { ...(body || {}) }
                const clean = sanitizePayload(payload, BUY_SELL_COLUMNS)
                const { data, error } = await supabase.from('buy_sell').update(clean).eq('id', id).select().maybeSingle()
                if (error) throw error
                return { data: { listing: data, success: true } }
            }
            if (cleanUrl.startsWith('buy-sell/delete/') || (cleanUrl.startsWith('buy-sell/') && method === 'DELETE')) {
                const id = cleanUrl.split('/').pop()
                await supabase.from('buy_sell').delete().eq('id', id)
                return { data: { success: true } }
            }

            // Single Item: matches /buy-sell/get/:id or /buy-sell/:id or /marketplace/:id
            const singleItemMatch = cleanUrl.match(/^(?:buy-sell\/get|buy-sell|marketplace)\/([^/]+)$/)
            if (singleItemMatch && method === 'GET' && !['get', 'all', 'approved', 'pending', 'rejected', 'my-listings', 'my-buy-sell', 'my-items', 'search'].includes(singleItemMatch[1])) {
                const { data } = await supabase.from('buy_sell').select('*').eq('id', singleItemMatch[1]).maybeSingle()
                return { data: { listing: await enrichBuySellWithHostDetails(data) } }
            }

            // Public Listings: /buy-sell/get, /buy-sell/approved, /buy-sell/all, /buy-sell, /marketplace
            let query = supabase.from('buy_sell').select('*').neq('status', 'rejected').order('created_at', { ascending: false })
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichBuySellWithHostDetails(data || [])
            return { data: { listings: enriched, total: enriched.length } }
        }

        // ── 4. TRAVEL / TRIPS ───────────────────────────────────────
        if (cleanUrl.startsWith('travel') || cleanUrl.startsWith('trips')) {
            if ((cleanUrl === 'travel/trips' || cleanUrl === 'trips') && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'travel') : { ...(body || {}) }
                payload.host_id = userId || payload.host_id || payload.user_id
                payload.status = payload.status || 'pending'
                const clean = sanitizePayload(payload, TRAVEL_TRIP_COLUMNS)
                const { data, error } = await supabase.from('travel_trips').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { trip: data, success: true } }
            }
            if (cleanUrl === 'travel/trips/me' || cleanUrl === 'trips/me') {
                const userId = await getCurrentUserId()
                let q = supabase.from('travel_trips').select('*').order('created_at', { ascending: false })
                if (userId) q = q.eq('host_id', userId)
                const { data } = await q
                return { data: { trips: await enrichWithProfiles(data || [], 'host_id') } }
            }
            const singleTripMatch = cleanUrl.match(/^(?:travel\/trips|trips)\/([^/]+)$/)
            if (singleTripMatch && method === 'GET' && !['all', 'approved', 'me', 'search'].includes(singleTripMatch[1])) {
                const { data } = await supabase.from('travel_trips').select('*').eq('id', singleTripMatch[1]).maybeSingle()
                return { data: { trip: await enrichWithProfiles(data, 'host_id') } }
            }

            let query = supabase.from('travel_trips').select('*').neq('status', 'rejected').order('created_at', { ascending: false })
            const { data } = await query
            const enriched = await enrichWithProfiles(data || [], 'host_id')
            return { data: { trips: enriched, total: enriched.length } }
        }

        // ── 5. STAY REQUESTS ────────────────────────────────────────
        if (cleanUrl.startsWith('stay-request')) {
            if (cleanUrl === 'stay-request/create' && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'stay_requests') : { ...(body || {}) }
                payload.user_id = userId || payload.user_id || payload.host_id
                payload.status = payload.status || 'pending'
                const clean = sanitizePayload(payload, STAY_REQUEST_COLUMNS)
                const { data, error } = await supabase.from('stay_requests').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { request: data, success: true } }
            }
            let query = supabase.from('stay_requests').select('*').neq('status', 'rejected').order('created_at', { ascending: false })
            const { data } = await query
            const enriched = await enrichWithProfiles(data || [], 'user_id')
            return { data: { requests: enriched, total: enriched.length } }
        }

        // ── 6. PROFILES / HOST / USER ──────────────────────────────
        if (cleanUrl.startsWith('host') || cleanUrl.startsWith('profiles') || cleanUrl.startsWith('user') || cleanUrl.startsWith('admin/approved/approved-host') || cleanUrl.startsWith('admin/pending/pending-host') || cleanUrl.startsWith('admin/rejected/rejected-host') || cleanUrl === 'auth/me' || cleanUrl === 'auth/user') {
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
            const userEmail = userObj?.email || userObj?.user?.email

            // Admin Host Approval Actions
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, role: 'host' }).eq('id', id).select().maybeSingle()
                return { data: { success: true, host: data, profile: data, message: 'Host approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                return { data: { success: true, host: data, profile: data, message: 'Host rejected' } }
            }
            if (cleanUrl.includes('pending') && method === 'GET') {
                const { data } = await supabase.from('profiles').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                return { data: { hosts: data || [], profiles: data || [] } }
            }
            if (cleanUrl.includes('rejected') && method === 'GET') {
                const { data } = await supabase.from('profiles').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                return { data: { hosts: data || [], profiles: data || [] } }
            }

            // Current logged-in user profile & host status
            if (cleanUrl === 'host/profile' || cleanUrl === 'host/me' || cleanUrl === 'host/get' || cleanUrl === 'auth/me' || cleanUrl === 'auth/user' || cleanUrl === 'user/profile' || cleanUrl === 'user/me' || cleanUrl === 'user/get' || cleanUrl === 'profiles/me') {
                if (!userId && !userEmail) return { data: { host: null, user: null, profile: null } }

                let profile = null
                if (userId) {
                    try {
                        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                        profile = data
                    } catch {}
                }
                if (!profile && userEmail) {
                    try {
                        const { data } = await supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle()
                        profile = data
                    } catch {}
                }

                // If brand new user, initialize as standard user (NOT approved host)
                if (!profile && (userId || userEmail)) {
                    const fallbackProfile = {
                        id: userId || '4ff1273a-306d-4227-be1e-8f1d7127bf10',
                        email: userEmail,
                        full_name: userObj?.full_name || userObj?.name || [userObj?.first_name, userObj?.last_name].filter(Boolean).join(' ') || (userEmail ? userEmail.split('@')[0] : 'User'),
                        phone: userObj?.phone || null,
                        role: 'user',
                        status: null,
                        is_approved: false,
                    }
                    try {
                        const { data } = await supabase.from('profiles').upsert(fallbackProfile).select().maybeSingle()
                        profile = data || fallbackProfile
                    } catch {
                        profile = fallbackProfile
                    }
                }

                return { data: { host: profile, user: profile, profile, data: profile } }
            }

            // Host application submission by user -> status: 'pending', is_approved: false
            if ((cleanUrl === 'host/save' || cleanUrl === 'host/update' || cleanUrl.startsWith('host/update/')) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                const id = cleanUrl.split('/').pop() || userId
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) }
                
                // Map common alias fields
                if (payload.userId && !payload.id) payload.id = payload.userId;
                if (payload.user_id && !payload.id) payload.id = payload.user_id;
                if (payload.name && !payload.full_name) payload.full_name = payload.name;
                if (payload.address && !payload.street_address) payload.street_address = payload.address;

                payload.id = (id && id !== 'save' && id !== 'update') ? id : (userId || payload.id);
                payload.status = payload.status || 'pending'
                payload.is_approved = false
                payload.role = payload.role || 'user'

                const cleanProfile = sanitizePayload(payload, PROFILE_COLUMNS)

                const { data, error } = await supabase.from('profiles').upsert(cleanProfile).select().maybeSingle()
                if (error) throw error
                return { data: { host: data, profile: data, success: true } }
            }

            const hostIdMatch = cleanUrl.match(/^(?:host|profiles|user)\/([^/]+)$/)
            if (hostIdMatch && method === 'GET' && !['profile', 'me', 'save', 'update', 'get', 'search', 'all'].includes(hostIdMatch[1])) {
                const { data } = await supabase.from('profiles').select('*').eq('id', hostIdMatch[1]).maybeSingle()
                return { data: { host: data, profile: data, user: data } }
            }

            // List of approved hosts (for directory / admin)
            const { data } = await supabase.from('profiles').select('*').or('status.eq.approved,is_approved.eq.true').limit(50)
            return { data: { profiles: data || [], hosts: data || [] } }
        }

        // ── 7. CAREER & JOBS ────────────────────────────────────────
        if (cleanUrl.startsWith('career') || cleanUrl.startsWith('jobs')) {
            if ((cleanUrl === 'career/create' || cleanUrl === 'jobs/create' || cleanUrl === 'jobs') && method === 'POST') {
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'jobs') : { ...(body || {}) }
                payload.status = payload.status || 'active'
                const clean = sanitizePayload(payload, JOB_COLUMNS)
                const { data, error } = await supabase.from('jobs').insert(clean).select().maybeSingle()
                if (error) throw error
                return { data: { job: data, success: true } }
            }
            const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
            return { data: { jobs: data || [] } }
        }

        // ── 8. WISHLIST ─────────────────────────────────────────────
        if (cleanUrl.startsWith('wishlist')) {
            const userId = await getCurrentUserId()
            if (cleanUrl.includes('toggle') && method === 'POST') {
                const itemId = body?.itemId || body?.item_id || cleanUrl.split('/').pop()
                const current = getLocalWishlist(userId)
                const exists = current.some(i => i.id === itemId || i.item_id === itemId)
                const updated = exists ? current.filter(i => i.id !== itemId && i.item_id !== itemId) : [...current, { id: itemId, item_id: itemId, created_at: new Date().toISOString() }]
                setLocalWishlist(userId, updated)
                return { data: { success: true, isWishlisted: !exists } }
            }
            const items = getLocalWishlist(userId)
            return { data: { wishlist: items, total: items.length } }
        }

        // ── 9. NOTIFICATIONS ────────────────────────────────────────
        if (cleanUrl.startsWith('notifications')) {
            return { data: { notifications: [], unreadCount: 0 } }
        }

        // Default empty response
        return { data: {} }
    } catch (err) {
        console.error(`Supabase execute error on [${method}] ${cleanUrl}:`, err)
        return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Query failed' } }
    }
}
