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
    'id', 'title', 'status', 'price', 'host_id', 'host_name', 'destination', 'origin',
    'travel_date', 'departure_time', 'seats_available', 'created_at', 'updated_at'
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

        const cleanHost = host ? { ...host } : null
        if (cleanHost) {
            delete cleanHost.id_proof_type
            delete cleanHost.id_photo
            delete cleanHost.rejection_reason
            delete cleanHost.block_reason
        }

        const hostObj = cleanHost ? {
            ...cleanHost,
            full_name: hostFullName,
            name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            profile_image: hostImg,
            avatar_url: hostImg,
            is_approved: hostIsApproved,
            status: hostStatus,
            User: cleanHost
        } : {
            full_name: hostFullName,
            name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            profile_image: hostImg,
            avatar_url: hostImg,
            is_approved: true,
            status: 'approved',
            User: {
                full_name: hostFullName,
                name: hostFullName,
                email: hostEmail,
                profile_image: hostImg,
                avatar_url: hostImg,
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
export const enrichStayWithUserDetails = (items) => enrichWithProfiles(items, 'user_id')

export async function enrichTravelWithHostDetails(items) {
    const isSingle = !Array.isArray(items);
    const list = Array.isArray(items) ? items : (items ? [items] : []);
    if (!list.length) return isSingle ? null : [];

    const base = await enrichWithProfiles(list, 'host_id');
    const formatted = base.map(trip => {
        if (!trip) return trip;
        let meta = {};
        if (trip.title && (trip.title.startsWith('{') || trip.title.startsWith('['))) {
            try {
                meta = JSON.parse(trip.title);
            } catch {}
        }

        const host = trip.Host || trip.host || trip.User || trip.user || {};
        const hostFullName = host.full_name || host.name || trip.host_name || 'Traveler';
        
        const rawOrigin = trip.origin || '';
        const rawDest = trip.destination || '';

        const fromCity = meta.from_city || (rawOrigin ? rawOrigin.split(',')[0].trim() : (host.city || 'Hyderabad'));
        const fromCountry = meta.from_country || (rawOrigin.includes(',') ? rawOrigin.split(',')[1].trim() : (host.country || 'India'));
        
        const toCity = meta.to_city || (rawDest ? rawDest.split(',')[0].trim() : 'San Francisco');
        const toCountry = meta.to_country || (rawDest.includes(',') ? rawDest.split(',')[1].trim() : 'USA');

        const travelDate = trip.travel_date || trip.created_at || '2026-09-15';
        const departureTime = trip.departure_time || '10:00 AM';
        const arrivalDate = meta.arrival_date || travelDate;
        const arrivalTime = meta.arrival_time || '08:00 PM';
        const airline = meta.airline || 'Commercial Airline';
        const flightNumber = meta.flight_number || '';

        const userObj = {
            id: trip.host_id || host.id,
            user_id: trip.host_id || host.id,
            fullName: hostFullName,
            full_name: hostFullName,
            name: hostFullName,
            image: host.profile_image || host.avatar_url || null,
            profile_image: host.profile_image || host.avatar_url || null,
            avatar_url: host.profile_image || host.avatar_url || null,
            city: host.city || fromCity,
            country: host.country || fromCountry,
            verified: Boolean(host.is_approved),
            whatsapp: host.whatsapp || host.phone || '',
            phone: host.phone || '',
            email: host.email || ''
        };

        const flightObj = {
            airline: airline,
            flightName: airline,
            flightNumber: flightNumber,
            flight_number: flightNumber,
            from: fromCity,
            to: toCity,
            from_city: fromCity,
            to_city: toCity,
            from_country: fromCountry,
            to_country: toCountry,
            fromCountry: fromCountry,
            toCountry: toCountry,
            departureDate: travelDate,
            departure_date: travelDate,
            departureTime: departureTime,
            departure_time: departureTime,
            arrivalDate: arrivalDate,
            arrival_date: arrivalDate,
            arrivalTime: arrivalTime,
            arrival_time: arrivalTime,
            seatsAvailable: trip.seats_available || 1,
            seats_available: trip.seats_available || 1
        };

        const tripMeta = {
            age: meta.age || host.age || '25-35',
            languages: meta.languages || host.languages || ['English', 'Hindi']
        };

        return {
            ...trip,
            id: trip.id,
            host_id: trip.host_id,
            user_id: trip.host_id,
            host_name: hostFullName,
            title: `${fromCity} to ${toCity}`,
            origin: fromCountry ? `${fromCity}, ${fromCountry}` : fromCity,
            destination: toCountry ? `${toCity}, ${toCountry}` : toCity,
            from_city: fromCity,
            fromCity: fromCity,
            from_country: fromCountry,
            fromCountry: fromCountry,
            to_city: toCity,
            toCity: toCity,
            to_country: toCountry,
            toCountry: toCountry,
            travel_date: travelDate,
            travelDate: travelDate,
            date: travelDate,
            departure_time: departureTime,
            departureTime: departureTime,
            time: departureTime,
            arrival_date: arrivalDate,
            arrival_time: arrivalTime,
            airline: airline,
            flight_number: flightNumber,
            price: Number(trip.price) || 0,
            seats_available: trip.seats_available || 1,
            status: trip.status || 'approved',
            user: userObj,
            User: userObj,
            host: userObj,
            Host: userObj,
            flight: flightObj,
            trip_meta: tripMeta,
            matches: [],
            socials: {
                whatsapp: host.whatsapp || host.phone || '',
                email: host.email || '',
                phone: host.phone || '',
                instagram: host.instagram || '',
                facebook: host.facebook || '',
                twitter: host.twitter || ''
            }
        };
    });

    return isSingle ? formatted[0] : formatted;
}

export function formatPersonProfile(p) {
    if (!p) return null;
    let meta = {};
    if (p.street_address && (p.street_address.startsWith('{') || p.street_address.startsWith('['))) {
        try {
            meta = JSON.parse(p.street_address);
        } catch {}
    } else if (p.address && (p.address.startsWith('{') || p.address.startsWith('['))) {
        try {
            meta = JSON.parse(p.address);
        } catch {}
    }

    const fullName = p.full_name || p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Expert Advisor';
    const profession = p.profession || p.headline || p.occupation || 'Verified Advisor';
    const headline = p.headline || p.profession || p.occupation || '';
    const avatar = p.profile_image || p.avatar_url || p.image || null;
    const city = p.city || '';
    const state = p.state || '';
    const country = p.country || 'India';
    const location = city && country ? `${city}, ${country}` : (city || state || country || 'Global');

    const rawHourly = meta.hourly_rate ?? p.hourly_rate ?? p.hourlyRate ?? p.pricing?.consultation ?? null;
    const hourlyRate = (rawHourly !== null && rawHourly !== undefined && !isNaN(Number(rawHourly)) && Number(rawHourly) > 0) ? Number(rawHourly) : null;
    const currency = meta.currency || p.currency || 'INR';
    const bio = meta.bio || p.bio || (headline ? `Specialized in ${headline}` : `Professional advisor in ${location}`);
    const category = meta.category || p.category || (profession.toLowerCase().includes('legal') ? 'legal' : (profession.toLowerCase().includes('tax') ? 'finance' : 'relocation'));
    const skills = (meta.skills && meta.skills.length > 0) ? meta.skills : (Array.isArray(p.skills) ? p.skills : [profession, 'Expat Assistance', 'Community Support']);
    const languages = (meta.languages && meta.languages.length > 0) ? meta.languages : (Array.isArray(p.languages) ? p.languages : ['English', 'Hindi']);
    const educations = (meta.educations && meta.educations.length > 0) ? meta.educations : (Array.isArray(p.educations) ? p.educations : []);
    const experience = meta.experience || p.experience || null;

    return {
        ...p,
        id: p.id,
        user_id: p.id,
        name: fullName,
        full_name: fullName,
        fullName: fullName,
        profession: profession,
        headline: headline,
        occupation: p.occupation || profession,
        bio: bio,
        category: category,
        country: country,
        state: state,
        city: city,
        location: location,
        avatar: avatar,
        avatar_url: avatar,
        profile_image: avatar,
        image: avatar,
        verified: Boolean(p.is_approved || p.is_verified),
        is_approved: Boolean(p.is_approved),
        isApproved: Boolean(p.is_approved),
        status: p.status || (p.is_approved ? 'approved' : 'pending'),
        skills: skills,
        languages: languages,
        educations: educations,
        experience: experience,
        hourlyRate: hourlyRate,
        hourly_rate: hourlyRate,
        pricing: {
            consultation: hourlyRate,
            currency: currency,
            type: meta.pricing_type || 'hourly'
        },
        currency: currency,
        stats: {
            rating: 0,
            review_count: 0,
            followers_count: 0
        },
        rating: 0,
        review_count: 0,
        socials: {
            whatsapp: p.whatsapp || p.phone || '',
            email: p.email || '',
            phone: p.phone || '',
            instagram: p.instagram || '',
            facebook: p.facebook || ''
        },
        contact_preferences: {
            allow_whatsapp: true,
            allow_email: true,
            allow_phone: false
        }
    };
}

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

                // Submit step -> pending admin approval
                if (cleanUrl.includes('submit')) {
                    payload.status = 'pending';
                    payload.is_approved = false;
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
            let query = supabase.from('properties').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.eq('status', 'approved')
            }

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
            let query = supabase.from('events').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.eq('status', 'approved')
            }
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
            let query = supabase.from('buy_sell').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.eq('status', 'approved')
            }
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichBuySellWithHostDetails(data || [])
            return { data: { listings: enriched, total: enriched.length } }
        }

        // ── 4. TRAVEL / TRIPS ───────────────────────────────────────
        if (cleanUrl.startsWith('travel') || cleanUrl.startsWith('trips') || cleanUrl.startsWith('admin/travel') || cleanUrl.startsWith('admin/trips') || cleanUrl.startsWith('admin/pending/pending-travel') || cleanUrl.startsWith('admin/approved/approved-travel') || cleanUrl.startsWith('admin/rejected/rejected-travel')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('travel_trips').update({ status: 'approved' }).eq('id', id).select().maybeSingle()
                return { data: { success: true, trip: data, message: 'Trip approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('travel_trips').update({ status: 'rejected' }).eq('id', id).select().maybeSingle()
                return { data: { success: true, trip: data, message: 'Trip rejected' } }
            }
            if ((cleanUrl.includes('/delete/') || cleanUrl.endsWith('/delete')) && method === 'DELETE') {
                const id = cleanUrl.split('/').pop()
                await supabase.from('travel_trips').delete().eq('id', id)
                return { data: { success: true } }
            }

            if ((cleanUrl === 'travel/trips' || cleanUrl === 'trips' || cleanUrl === 'travel/create' || cleanUrl === 'travel/trips/create') && method === 'POST') {
                const userObj = await getCurrentUserObject()
                const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'travel') : { ...(body || {}) }
                
                const fromCity = payload.from_city || payload.fromCity || payload.from || payload.origin || ''
                const fromCountry = payload.from_country || payload.fromCountry || ''
                const toCity = payload.to_city || payload.toCity || payload.to || payload.destination || ''
                const toCountry = payload.to_country || payload.toCountry || ''

                const originStr = fromCity ? (fromCountry ? `${fromCity}, ${fromCountry}` : fromCity) : (payload.origin || '')
                const destStr = toCity ? (toCountry ? `${toCity}, ${toCountry}` : toCity) : (payload.destination || '')

                const meta = {
                    airline: payload.airline || payload.flight?.airline || 'Commercial Airline',
                    flight_number: payload.flight_number || payload.flightNumber || payload.flight?.flightNumber || '',
                    flightName: payload.flightName || payload.airline || '',
                    from_country: fromCountry,
                    from_state: payload.from_state || payload.fromState || '',
                    from_city: fromCity,
                    to_country: toCountry,
                    to_state: payload.to_state || payload.toState || '',
                    to_city: toCity,
                    arrival_date: payload.arrival_date || payload.arrivalDate || payload.travel_date || '',
                    arrival_time: payload.arrival_time || payload.arrivalTime || '',
                    age: payload.age || null,
                    languages: payload.languages || [],
                    travelers_count: Number(payload.travelers_count || payload.travelersCount || 1)
                };

                payload.host_id = userId || payload.host_id || payload.user_id
                payload.host_name = userObj?.full_name || userObj?.name || [userObj?.first_name, userObj?.last_name].filter(Boolean).join(' ') || payload.host_name || 'Traveler'
                payload.status = 'pending'
                payload.origin = originStr
                payload.destination = destStr
                payload.travel_date = payload.travel_date || payload.departureDate || payload.departure_date || payload.date || new Date().toISOString()
                payload.departure_time = payload.departure_time || payload.departureTime || payload.time || '10:00 AM'
                payload.seats_available = Number(payload.travelers_count || payload.travelersCount || payload.seats_available || 1)
                payload.price = Number(payload.price || 0)
                payload.title = JSON.stringify(meta)

                const clean = sanitizePayload(payload, TRAVEL_TRIP_COLUMNS)
                const { data, error } = await supabase.from('travel_trips').insert(clean).select().maybeSingle()
                if (error) throw error
                const enriched = await enrichTravelWithHostDetails(data)
                return { data: { trip: enriched, results: [enriched], trips: [enriched], success: true } }
            }

            if (cleanUrl === 'travel/trips/me' || cleanUrl === 'trips/me' || cleanUrl === 'travel/me') {
                const userId = await getCurrentUserId()
                let q = supabase.from('travel_trips').select('*').order('created_at', { ascending: false })
                if (userId) q = q.eq('host_id', userId)
                const { data } = await q
                const enriched = await enrichTravelWithHostDetails(data || [])
                return { data: { results: enriched, trips: enriched, data: enriched, total: enriched.length, count: enriched.length } }
            }

            const singleTripMatch = cleanUrl.match(/^(?:travel\/trips|trips)\/([^/]+)$/) || (cleanUrl.startsWith('travel/') && !['travel/trips', 'travel/me', 'travel/create', 'travel/search', 'travel/all', 'travel/approved', 'travel/pending', 'travel/rejected', 'travel/get'].includes(cleanUrl) ? cleanUrl.match(/^travel\/([^/]+)$/) : null);
            if (singleTripMatch && method === 'GET' && !['trips', 'all', 'approved', 'pending', 'rejected', 'me', 'search', 'get', 'create'].includes(singleTripMatch[1])) {
                const { data } = await supabase.from('travel_trips').select('*').eq('id', singleTripMatch[1]).maybeSingle()
                const enriched = await enrichTravelWithHostDetails(data)
                return { data: { trip: enriched, results: enriched ? [enriched] : [], data: enriched } }
            }

            let query = supabase.from('travel_trips').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.eq('status', 'approved')
            }

            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichTravelWithHostDetails(data || [])
            return {
                data: {
                    results: enriched,
                    trips: enriched,
                    data: enriched,
                    total: enriched.length,
                    count: enriched.length,
                    success: true
                }
            }
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
            let query = supabase.from('stay_requests').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.eq('status', 'approved')
            }
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
                        id: userId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined),
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

        // ── 7. PEOPLE / EXPERTS / PROFESSIONALS ─────────────────────
        if (cleanUrl === 'people' || cleanUrl.startsWith('people/') || cleanUrl.startsWith('admin/people') || cleanUrl.startsWith('admin/professionals') || cleanUrl.startsWith('admin/pending/pending-people') || cleanUrl.startsWith('admin/approved/approved-people') || cleanUrl.startsWith('admin/rejected/rejected-people')) {
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()

            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, is_verified: true, role: 'expert' }).eq('id', id).select().maybeSingle()
                return { data: { success: true, profile: data ? formatPersonProfile(data) : null, message: 'Expert approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                return { data: { success: true, profile: data ? formatPersonProfile(data) : null, message: 'Expert rejected' } }
            }

            // File Upload for People (POST people/upload)
            if (cleanUrl === 'people/upload' && method === 'POST') {
                const uploaded = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : {}
                const urls = uploaded.images || (uploaded.url ? [uploaded.url] : (uploaded.avatar ? [uploaded.avatar] : []))
                return { data: { urls: urls, url: urls[0] || null, success: true } }
            }

            // Create / Update expert profile (POST people or PUT people/me)
            if ((cleanUrl === 'people' && method === 'POST') || ((cleanUrl === 'people/me' || cleanUrl.startsWith('people/me/')) && (method === 'PUT' || method === 'PATCH' || method === 'POST'))) {
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) }
                
                payload.id = userId || payload.id
                payload.full_name = payload.full_name || payload.name || payload.fullName
                payload.name = payload.full_name
                payload.profession = payload.profession || payload.headline || payload.occupation || 'Verified Advisor'
                payload.headline = payload.headline || payload.profession
                payload.occupation = payload.occupation || payload.profession
                payload.profile_image = payload.avatar || payload.profile_image || payload.avatar_url
                payload.avatar_url = payload.profile_image
                payload.status = payload.status || 'pending'
                payload.is_approved = false
                payload.role = 'expert'

                // Pack rich metadata into street_address so hourly_rate, bio, educations, skills, pricing are never lost in Postgres
                const rawHourly = payload.hourlyRate ?? payload.hourly_rate ?? payload.pricing?.consultation ?? null;
                const meta = {
                    hourly_rate: (rawHourly !== null && rawHourly !== undefined && !isNaN(Number(rawHourly)) && Number(rawHourly) > 0) ? Number(rawHourly) : null,
                    currency: payload.currency || payload.pricing?.currency || 'INR',
                    pricing_type: payload.pricingType || payload.pricing?.type || 'hourly',
                    bio: payload.bio || payload.description || null,
                    category: payload.category || null,
                    skills: Array.isArray(payload.skills) ? payload.skills : (payload.skills ? String(payload.skills).split(',').map(s => s.trim()).filter(Boolean) : []),
                    languages: Array.isArray(payload.languages) ? payload.languages : (payload.languages ? String(payload.languages).split(',').map(s => s.trim()).filter(Boolean) : []),
                    experience: payload.experience || null,
                    educations: Array.isArray(payload.educations) && payload.educations.length > 0
                        ? payload.educations
                        : (payload.education_degree ? [{
                            degree: payload.education_degree,
                            institution: payload.education_school || 'University / Institute',
                            year: payload.education_year || ''
                        }] : [])
                };
                payload.street_address = JSON.stringify(meta);

                const cleanProfile = sanitizePayload(payload, PROFILE_COLUMNS)
                const { data, error } = await supabase.from('profiles').upsert(cleanProfile).select().maybeSingle()
                if (error) throw error
                const formatted = formatPersonProfile(data)
                return { data: { profile: formatted, data: formatted, success: true } }
            }

            // Current logged-in user expert profile (GET people/me)
            if (cleanUrl === 'people/me' && method === 'GET') {
                if (!userId) return { data: null }
                const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                const formatted = data ? formatPersonProfile(data) : null
                return { data: { profile: formatted, data: formatted } }
            }

            // Single Profile (GET people/profile/:id or GET people/:id)
            const singlePersonMatch = cleanUrl.match(/^people\/(?:profile\/)?([^/]+)$/)
            if (singlePersonMatch && method === 'GET' && !['search', 'me', 'all', 'approved', 'pending', 'rejected', 'upload', 'followers', 'following', 'reviews'].includes(singlePersonMatch[1])) {
                const { data } = await supabase.from('profiles').select('*').eq('id', singlePersonMatch[1]).maybeSingle()
                const formatted = data ? formatPersonProfile(data) : null
                return { data: { profile: formatted, data: formatted } }
            }

            // Reviews endpoint
            if (cleanUrl.includes('reviews')) {
                return { data: { reviews: [], data: [], total: 0, count: 0, rating: 0 } }
            }

            // Followers / Following endpoint
            if (cleanUrl.includes('follow')) {
                return { data: { success: true, followed: true, data: [] } }
            }

            // Public List of People / Professionals (GET people or GET people/search)
            let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.or('status.eq.approved,is_approved.eq.true')
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const formattedList = (data || []).map(formatPersonProfile)

            return {
                data: {
                    people: formattedList,
                    profiles: formattedList,
                    results: formattedList,
                    items: formattedList,
                    data: formattedList,
                    total: formattedList.length,
                    count: formattedList.length,
                    success: true
                }
            }
        }

        // ── 8. CAREER & JOBS ────────────────────────────────────────
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
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
            
            if (!userId) {
                return { data: { wishlist: [], items: [], total: 0, count: 0, isWishlisted: false, is_wishlisted: false, success: false } }
            }

            // Get current user profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
            let profileMeta = {}
            if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                try {
                    profileMeta = JSON.parse(profile.street_address)
                } catch {}
            }
            let userWishlist = Array.isArray(profileMeta.wishlist) ? profileMeta.wishlist : []

            const normalizeItemType = (t) => {
                const clean = (t || '').toLowerCase().replace(/[-_\s]/g, '')
                if (clean === 'buysell' || clean === 'marketplace' || clean === 'product') return 'buysell'
                if (clean === 'property' || clean === 'stay' || clean === 'stays') return 'property'
                if (clean === 'stayrequest' || clean === 'stayrequests') return 'stay-request'
                if (clean === 'event' || clean === 'events') return 'event'
                if (clean === 'trip' || clean === 'travel' || clean === 'traveltrip' || clean === 'trips') return 'trip'
                if (clean === 'expert' || clean === 'people' || clean === 'profile' || clean === 'professional' || clean === 'experts') return 'expert'
                return clean
            }

            // 1. Check status: wishlist/check/:type/:id or wishlist/check
            if (cleanUrl.startsWith('wishlist/check')) {
                const parts = cleanUrl.split('/')
                const typeParam = parts[2] || queryParams.type
                const idParam = parts[3] || queryParams.id || queryParams.itemId
                const targetNorm = normalizeItemType(typeParam)
                const isSaved = userWishlist.some(i => 
                    (String(i.id) === String(idParam) || String(i.item_id) === String(idParam)) &&
                    (!targetNorm || normalizeItemType(i.type) === targetNorm)
                )
                return { data: { isWishlisted: Boolean(isSaved), is_wishlisted: Boolean(isSaved), isSaved: Boolean(isSaved), saved: Boolean(isSaved), success: true } }
            }

            // 2. Toggle status: wishlist/toggle (POST)
            if (cleanUrl.includes('toggle') && method === 'POST') {
                const targetId = body?.id || body?.itemId || body?.item_id
                const targetType = normalizeItemType(body?.type || body?.itemType || 'property')
                
                if (!targetId) {
                    return { data: { success: false, isWishlisted: false } }
                }

                const existsIndex = userWishlist.findIndex(i => 
                    (String(i.id) === String(targetId) || String(i.item_id) === String(targetId)) &&
                    (!targetType || normalizeItemType(i.type) === targetType)
                )
                let newSavedState = false
                
                if (existsIndex >= 0) {
                    userWishlist.splice(existsIndex, 1)
                    newSavedState = false
                } else {
                    userWishlist.push({
                        id: targetId,
                        item_id: targetId,
                        type: targetType,
                        created_at: new Date().toISOString()
                    })
                    newSavedState = true
                }

                profileMeta.wishlist = userWishlist
                await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)

                return { data: { success: true, isWishlisted: newSavedState, is_wishlisted: newSavedState, isSaved: newSavedState, saved: newSavedState } }
            }

            // 3. Add to wishlist: wishlist/add (POST)
            if (cleanUrl.includes('add') && method === 'POST') {
                const targetId = body?.id || body?.itemId || body?.item_id
                const targetType = normalizeItemType(body?.type || body?.itemType || 'property')
                if (targetId && !userWishlist.some(i => (String(i.id) === String(targetId) || String(i.item_id) === String(targetId)) && normalizeItemType(i.type) === targetType)) {
                    userWishlist.push({
                        id: targetId,
                        item_id: targetId,
                        type: targetType,
                        created_at: new Date().toISOString()
                    })
                    profileMeta.wishlist = userWishlist
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)
                }
                return { data: { success: true, isWishlisted: true, is_wishlisted: true } }
            }

            // 4. Remove from wishlist: wishlist/:type/:id or DELETE
            if (method === 'DELETE' || (cleanUrl.startsWith('wishlist/') && !['wishlist', 'wishlist/all'].includes(cleanUrl))) {
                const parts = cleanUrl.split('/')
                const targetId = parts.length > 2 ? parts[parts.length - 1] : parts[1]
                const typeParam = parts.length > 2 ? parts[1] : null
                const targetNorm = typeParam ? normalizeItemType(typeParam) : null
                userWishlist = userWishlist.filter(i => {
                    const idMatch = String(i.id) === String(targetId) || String(i.item_id) === String(targetId)
                    if (!idMatch) return true
                    if (targetNorm && normalizeItemType(i.type) !== targetNorm) return true
                    return false
                })
                profileMeta.wishlist = userWishlist
                await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)
                return { data: { success: true, isWishlisted: false, is_wishlisted: false } }
            }

            // 5. Get Wishlist List (GET wishlist)
            const targetNormalizedType = normalizeItemType(queryParams.type)
            let filteredList = targetNormalizedType && targetNormalizedType !== 'all' 
                ? userWishlist.filter(i => normalizeItemType(i.type) === targetNormalizedType) 
                : userWishlist

            // Enrich items with real details from DB
            const enrichedList = await Promise.all(filteredList.map(async (wItem) => {
                const t = normalizeItemType(wItem.type)
                let details = null
                try {
                    if (t === 'property') {
                        const { data } = await supabase.from('properties').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? (await enrichPropertiesWithHostDetails(data)) : null
                    } else if (t === 'event') {
                        const { data } = await supabase.from('events').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? (await enrichEventsWithHostDetails(data)) : null
                    } else if (t === 'buysell') {
                        const { data } = await supabase.from('buy_sell').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? (await enrichBuySellWithHostDetails(data)) : null
                    } else if (t === 'trip') {
                        const { data } = await supabase.from('travel_trips').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? (await enrichTravelWithHostDetails(data)) : null
                    } else if (t === 'expert') {
                        const { data } = await supabase.from('profiles').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? formatPersonProfile(data) : null
                    }
                } catch {}

                return {
                    ...wItem,
                    id: wItem.id,
                    item_id: wItem.id,
                    type: wItem.type,
                    details: details || { id: wItem.id, title: 'Saved Item' }
                }
            }))

            return {
                data: {
                    wishlist: enrichedList,
                    items: enrichedList,
                    total: enrichedList.length,
                    count: enrichedList.length,
                    success: true
                }
            }
        }

        // ── 9. CONNECTION REQUESTS ───────────────────────────────────
        if (cleanUrl.startsWith('connection-requests') || cleanUrl.startsWith('connections')) {
            const userObj = await getCurrentUserObject()
            const currentUserId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()

            // 1. Send Connection Request: POST connection-requests
            if ((cleanUrl === 'connection-requests' || cleanUrl === 'connections') && method === 'POST') {
                if (!currentUserId) {
                    return { error: { status: 401, data: { message: 'Authentication required' } } }
                }

                const targetUserId = body?.targetUserId || body?.target_user_id || body?.recipient_id || body?.owner_id
                if (!targetUserId) {
                    return { error: { status: 400, data: { message: 'Target user ID is required' } } }
                }

                if (String(currentUserId) === String(targetUserId)) {
                    return { error: { status: 400, data: { message: 'Cannot connect with yourself' } } }
                }

                const itemId = body?.itemId || body?.item_id || ''
                const itemTitle = body?.itemTitle || body?.item_title || ''
                const itemType = body?.itemType || body?.item_type || 'accommodations'
                const requesterName = userObj?.name || userObj?.full_name || body?.requesterName || 'Community Member'
                const requesterEmail = userObj?.email || body?.requesterEmail || ''
                const requesterPhone = userObj?.phone || body?.requesterPhone || ''

                // Get target user profile
                const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle()
                let targetMeta = {}
                if (targetProfile?.street_address && (targetProfile.street_address.startsWith('{') || targetProfile.street_address.startsWith('['))) {
                    try { targetMeta = JSON.parse(targetProfile.street_address) } catch {}
                }
                targetMeta.incoming_requests = Array.isArray(targetMeta.incoming_requests) ? targetMeta.incoming_requests : []

                // Get current user profile
                const { data: currentProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let currentMeta = {}
                if (currentProfile?.street_address && (currentProfile.street_address.startsWith('{') || currentProfile.street_address.startsWith('['))) {
                    try { currentMeta = JSON.parse(currentProfile.street_address) } catch {}
                }
                currentMeta.outgoing_requests = Array.isArray(currentMeta.outgoing_requests) ? currentMeta.outgoing_requests : []

                const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
                const newRequest = {
                    id: requestId,
                    requestId: requestId,
                    requester_id: currentUserId,
                    requesterId: currentUserId,
                    requester_name: requesterName,
                    requesterName: requesterName,
                    requester_email: requesterEmail,
                    requesterEmail: requesterEmail,
                    requester_phone: requesterPhone,
                    requesterPhone: requesterPhone,
                    target_user_id: targetUserId,
                    targetUserId: targetUserId,
                    target_name: body?.targetName || targetProfile?.name || targetProfile?.full_name || 'Host',
                    targetName: body?.targetName || targetProfile?.name || targetProfile?.full_name || 'Host',
                    item_id: itemId,
                    itemId: itemId,
                    item_title: itemTitle,
                    itemTitle: itemTitle,
                    item_type: itemType,
                    itemType: itemType,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }

                // Deduplicate/Update existing
                const existingIdx = targetMeta.incoming_requests.findIndex(r => 
                    String(r.requesterId || r.requester_id) === String(currentUserId) &&
                    (!itemId || String(r.itemId || r.item_id) === String(itemId))
                )
                if (existingIdx >= 0) {
                    targetMeta.incoming_requests[existingIdx] = { ...targetMeta.incoming_requests[existingIdx], ...newRequest, status: 'pending', updated_at: new Date().toISOString() }
                } else {
                    targetMeta.incoming_requests.unshift(newRequest)
                }

                const outIdx = currentMeta.outgoing_requests.findIndex(r => 
                    String(r.targetUserId || r.target_user_id) === String(targetUserId) &&
                    (!itemId || String(r.itemId || r.item_id) === String(itemId))
                )
                if (outIdx >= 0) {
                    currentMeta.outgoing_requests[outIdx] = { ...currentMeta.outgoing_requests[outIdx], ...newRequest, status: 'pending', updated_at: new Date().toISOString() }
                } else {
                    currentMeta.outgoing_requests.unshift(newRequest)
                }

                // Save to database
                await Promise.all([
                    supabase.from('profiles').update({ street_address: JSON.stringify(targetMeta) }).eq('id', targetUserId),
                    supabase.from('profiles').update({ street_address: JSON.stringify(currentMeta) }).eq('id', currentUserId)
                ])

                return { data: { success: true, message: 'Connection request sent successfully', data: newRequest } }
            }

            // 2. Get Incoming Connection Requests: GET connection-requests/incoming
            if (cleanUrl.startsWith('connection-requests/incoming')) {
                if (!currentUserId) {
                    return { data: { data: [], count: 0, totalPages: 1 } }
                }

                const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let meta = {}
                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try { meta = JSON.parse(profile.street_address) } catch {}
                }
                const incoming = Array.isArray(meta.incoming_requests) ? meta.incoming_requests : []
                return {
                    data: {
                        data: incoming,
                        count: incoming.length,
                        total: incoming.length,
                        totalPages: Math.ceil(incoming.length / (parseInt(queryParams.limit) || 10)) || 1
                    }
                }
            }

            // 3. Get Outgoing Connection Requests: GET connection-requests/outgoing
            if (cleanUrl.startsWith('connection-requests/outgoing')) {
                if (!currentUserId) {
                    return { data: { data: [], count: 0, totalPages: 1 } }
                }

                const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let meta = {}
                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try { meta = JSON.parse(profile.street_address) } catch {}
                }
                const outgoing = Array.isArray(meta.outgoing_requests) ? meta.outgoing_requests : []
                return {
                    data: {
                        data: outgoing,
                        count: outgoing.length,
                        total: outgoing.length,
                        totalPages: Math.ceil(outgoing.length / (parseInt(queryParams.limit) || 10)) || 1
                    }
                }
            }

            // 4. Get Connection Status: GET connection-requests/status/:targetUserId
            if (cleanUrl.startsWith('connection-requests/status')) {
                const targetUserId = cleanUrl.split('/')[2] || queryParams.targetUserId
                const itemId = queryParams.itemId || ''

                if (!targetUserId || !currentUserId) {
                    return { data: { status: 'none', isConnected: false, isOwner: false } }
                }

                if (String(targetUserId) === String(currentUserId)) {
                    return { data: { status: 'accepted', isConnected: true, isOwner: true } }
                }

                // Check requester's outgoing requests
                const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let myMeta = {}
                if (myProfile?.street_address && (myProfile.street_address.startsWith('{') || myProfile.street_address.startsWith('['))) {
                    try { myMeta = JSON.parse(myProfile.street_address) } catch {}
                }
                const outgoing = Array.isArray(myMeta.outgoing_requests) ? myMeta.outgoing_requests : []
                const matched = outgoing.find(r => 
                    String(r.targetUserId || r.target_user_id) === String(targetUserId) &&
                    (!itemId || !r.itemId || !r.item_id || String(r.itemId || r.item_id) === String(itemId))
                )

                let currentStatus = matched ? matched.status : 'none'

                // Check if target user profile has real social contacts to unlock on accepted
                if (currentStatus === 'accepted') {
                    const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle()
                    let targetMeta = {}
                    if (targetProfile?.street_address && (targetProfile.street_address.startsWith('{') || targetProfile.street_address.startsWith('['))) {
                        try { targetMeta = JSON.parse(targetProfile.street_address) } catch {}
                    }
                    return {
                        data: {
                            status: 'accepted',
                            isConnected: true,
                            isOwner: false,
                            data: {
                                status: 'accepted',
                                targetWhatsapp: targetProfile?.whatsapp || targetMeta?.whatsapp || targetProfile?.phone || '',
                                targetPhone: targetProfile?.phone || targetMeta?.phone || '',
                                targetEmail: targetProfile?.email || targetMeta?.email || '',
                                targetInstagram: targetProfile?.instagram || targetMeta?.instagram || '',
                                targetFacebook: targetProfile?.facebook || targetMeta?.facebook || '',
                                targetLinkedin: targetProfile?.linkedin || targetMeta?.linkedin || '',
                                targetTwitter: targetProfile?.twitter || targetMeta?.twitter || ''
                            }
                        }
                    }
                }

                return {
                    data: {
                        status: currentStatus,
                        isConnected: currentStatus === 'accepted',
                        isOwner: false,
                        data: { status: currentStatus }
                    }
                }
            }

            // 5. Accept / Decline Connection Request: PATCH or PUT connection-requests/:requestId/status
            if (cleanUrl.match(/^connection-requests\/[^/]+\/status$/) && (method === 'PATCH' || method === 'PUT' || method === 'POST')) {
                if (!currentUserId) {
                    return { error: { status: 401, data: { message: 'Authentication required' } } }
                }

                const requestId = cleanUrl.split('/')[1]
                const newStatus = (body?.status || body?.action || 'accepted').toLowerCase()
                const finalStatus = (newStatus === 'accept' || newStatus === 'accepted') ? 'accepted' : 'rejected'

                // Load receiver profile (current user)
                const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
                let myMeta = {}
                if (myProfile?.street_address && (myProfile.street_address.startsWith('{') || myProfile.street_address.startsWith('['))) {
                    try { myMeta = JSON.parse(myProfile.street_address) } catch {}
                }
                myMeta.incoming_requests = Array.isArray(myMeta.incoming_requests) ? myMeta.incoming_requests : []

                const reqIndex = myMeta.incoming_requests.findIndex(r => String(r.id || r.requestId) === String(requestId))
                if (reqIndex < 0) {
                    return { error: { status: 404, data: { message: 'Connection request not found' } } }
                }

                const targetReq = myMeta.incoming_requests[reqIndex]
                // SECURITY CHECK: Current user must be the recipient!
                if (String(targetReq.targetUserId || targetReq.target_user_id) !== String(currentUserId)) {
                    return { error: { status: 403, data: { message: 'Unauthorized to update this request' } } }
                }

                targetReq.status = finalStatus
                targetReq.updated_at = new Date().toISOString()
                myMeta.incoming_requests[reqIndex] = targetReq

                // Update requester's outgoing requests
                const requesterId = targetReq.requesterId || targetReq.requester_id
                const { data: reqProfile } = await supabase.from('profiles').select('*').eq('id', requesterId).maybeSingle()
                let reqMeta = {}
                if (reqProfile?.street_address && (reqProfile.street_address.startsWith('{') || reqProfile.street_address.startsWith('['))) {
                    try { reqMeta = JSON.parse(reqProfile.street_address) } catch {}
                }
                reqMeta.outgoing_requests = Array.isArray(reqMeta.outgoing_requests) ? reqMeta.outgoing_requests : []
                const outIdx = reqMeta.outgoing_requests.findIndex(r => String(r.id || r.requestId) === String(requestId) || (String(r.targetUserId || r.target_user_id) === String(currentUserId) && String(r.itemId || r.item_id) === String(targetReq.itemId || targetReq.item_id)))
                if (outIdx >= 0) {
                    reqMeta.outgoing_requests[outIdx].status = finalStatus
                    reqMeta.outgoing_requests[outIdx].updated_at = new Date().toISOString()
                }

                // If accepted, add to connections
                if (finalStatus === 'accepted') {
                    myMeta.connections = Array.isArray(myMeta.connections) ? myMeta.connections : []
                    if (!myMeta.connections.some(c => String(c.userId || c.user_id) === String(requesterId))) {
                        myMeta.connections.push({ userId: requesterId, user_id: requesterId, itemId: targetReq.itemId, item_id: targetReq.item_id, status: 'accepted', updated_at: new Date().toISOString() })
                    }

                    reqMeta.connections = Array.isArray(reqMeta.connections) ? reqMeta.connections : []
                    if (!reqMeta.connections.some(c => String(c.userId || c.user_id) === String(currentUserId))) {
                        reqMeta.connections.push({ userId: currentUserId, user_id: currentUserId, itemId: targetReq.itemId, item_id: targetReq.item_id, status: 'accepted', updated_at: new Date().toISOString() })
                    }
                }

                await Promise.all([
                    supabase.from('profiles').update({ street_address: JSON.stringify(myMeta) }).eq('id', currentUserId),
                    supabase.from('profiles').update({ street_address: JSON.stringify(reqMeta) }).eq('id', requesterId)
                ])

                return { data: { success: true, message: `Request ${finalStatus}`, data: targetReq } }
            }
        }

        // ── 10. NOTIFICATIONS ────────────────────────────────────────
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
