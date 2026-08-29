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
        if (data?.session?.user?.id) return data.session.user.id
        
        // Check localStorage fallback
        const stored = localStorage.getItem('user')
        if (stored) {
            const parsed = JSON.parse(stored)
            return parsed?.id || parsed?.user_id || parsed?.user?.id || null
        }
        return null
    } catch {
        return null
    }
}

// Wishlist helper utilities for storage and normalization
let hasWishlistTableInDb = null

function mapItemTypeToAliases(type) {
    if (!type) return ['property', 'accommodations', 'stay', 'stay-request', 'stay_request', 'stay-requests', 'stay_requests', 'event', 'events', 'buysell', 'buy-sell', 'marketplace', 'product', 'trip', 'travel', 'travel_trip', 'expert', 'people', 'person']
    const t = String(type).toLowerCase()
    if (['property', 'accommodations', 'stay'].includes(t)) return ['property', 'accommodations', 'stay']
    if (['stay-request', 'stay_request', 'stay-requests', 'stay_requests', 'seeker', 'seekers'].includes(t)) return ['stay-request', 'stay_request', 'stay-requests', 'stay_requests', 'seeker', 'seekers']
    if (['event', 'events'].includes(t)) return ['event', 'events']
    if (['buysell', 'buy-sell', 'marketplace', 'product'].includes(t)) return ['buysell', 'buy-sell', 'marketplace', 'product']
    if (['trip', 'travel', 'travel_trip'].includes(t)) return ['trip', 'travel', 'travel_trip']
    if (['expert', 'people', 'person'].includes(t)) return ['expert', 'people', 'person']
    return [t]
}

function getLocalWishlistRows(userId, filterType) {
    try {
        const key = `user_wishlist_${userId || 'guest'}`
        const raw = localStorage.getItem(key)
        const list = raw ? JSON.parse(raw) : []
        if (!filterType) return list
        const aliases = mapItemTypeToAliases(filterType)
        return list.filter(item => aliases.includes(String(item.item_type || item.type).toLowerCase()))
    } catch {
        return []
    }
}

function toggleLocalWishlist(userId, itemId, forceState, itemType = 'property') {
    try {
        const key = `user_wishlist_${userId || 'guest'}`
        const raw = localStorage.getItem(key)
        let list = raw ? JSON.parse(raw) : []
        const existsIndex = list.findIndex(i => String(i.item_id || i.id) === String(itemId))
        
        let newState = false
        if (typeof forceState === 'boolean') {
            newState = forceState
            if (forceState && existsIndex === -1) {
                list.push({ id: `local_${Date.now()}`, item_id: itemId, item_type: itemType, created_at: new Date().toISOString() })
            } else if (!forceState && existsIndex !== -1) {
                list.splice(existsIndex, 1)
            }
        } else {
            if (existsIndex !== -1) {
                list.splice(existsIndex, 1)
                newState = false
            } else {
                list.push({ id: `local_${Date.now()}`, item_id: itemId, item_type: itemType, created_at: new Date().toISOString() })
                newState = true
            }
        }
        localStorage.setItem(key, JSON.stringify(list))
        return newState
    } catch {
        return false
    }
}

function isLocalWishlisted(userId, itemId) {
    try {
        const key = `user_wishlist_${userId || 'guest'}`
        const raw = localStorage.getItem(key)
        const list = raw ? JSON.parse(raw) : []
        return list.some(i => String(i.item_id || i.id) === String(itemId))
    } catch {
        return false
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

async function enrichPropertiesWithHostDetails(items) {
    if (!items) return []
    const isSingle = !Array.isArray(items)
    const array = isSingle ? [items] : items
    if (array.length === 0) return isSingle ? items : []

    const hostIds = [...new Set(array.map(p => p?.host_id).filter(Boolean))]
    const hostMap = new Map()

    if (hostIds.length > 0) {
        try {
            const { data: hostProfiles } = await supabase.from('profiles').select('*').in('id', hostIds)
            if (hostProfiles && Array.isArray(hostProfiles)) {
                for (const h of hostProfiles) {
                    hostMap.set(h.id, h)
                }
            }
        } catch (err) {
            console.warn('Error fetching host profiles for properties:', err)
        }
    }

    const enriched = array.map(p => {
        if (!p) return p
        const host = p.host_id ? hostMap.get(p.host_id) : null

        const hostFullName = host?.full_name || host?.name || [host?.first_name, host?.last_name].filter(Boolean).join(' ') || p.host_name || p.hostName || p.user_name || null
        const hostPhone = host?.phone || host?.whatsapp || p.phone || null
        const hostEmail = host?.email || p.email || null
        const hostImg = host?.profile_image || host?.avatar_url || p.host_image || null
        const hostIsApproved = host?.is_approved !== undefined ? Boolean(host.is_approved) : (host?.status === 'approved')
        const hostStatus = host?.status || (hostIsApproved ? 'approved' : 'pending')

        const hostObj = host ? {
            ...host,
            name: hostFullName,
            full_name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            profile_image: hostImg,
            is_approved: hostIsApproved,
            status: hostStatus,
            User: host
        } : (p.host || null)

        return {
            ...p,
            host_name: hostFullName,
            hostName: hostFullName,
            user_name: hostFullName,
            phone: hostPhone,
            email: hostEmail,
            host_phone: hostPhone,
            host_email: hostEmail,
            host_status: hostStatus,
            host_is_approved: hostIsApproved,
            host: hostObj,
            User: hostObj || p.User || null
        }
    })

    return isSingle ? enriched[0] : enriched
}

const VALID_PROFILE_COLUMNS = new Set([
    'id', 'email', 'name', 'full_name', 'firstName', 'lastName',
    'role', 'status', 'is_approved', 'is_blocked', 'is_verified',
    'is_featured', 'phone', 'city', 'state', 'country', 'zip_code',
    'address', 'street_address', 'whatsapp', 'facebook', 'instagram',
    'id_proof_type', 'id_photo', 'selfie_photo', 'avatar_url', 'profile_image',
    'occupation', 'headline', 'profession', 'rejection_reason', 'block_reason'
]);

function enrichProfile(p) {
    if (!p || typeof p !== 'object') return p;
    let extra = {};
    if (typeof p.occupation === 'string' && p.occupation.trim().startsWith('{')) {
        try {
            extra = JSON.parse(p.occupation);
        } catch (e) {
            console.warn('Failed to parse profile occupation JSON:', e);
        }
    }
    const expMatch = String(extra.experience || p.experience || p.headline || p.profession || '').match(/(\d+)\s*(?:years?|yrs?)/i);
    const resolvedExp = extra.experience || p.experience || (expMatch ? `${expMatch[1]} years` : '5 years');
    const resolvedRate = Number(extra.hourlyRate ?? p.hourlyRate ?? extra.pricing?.consultation ?? p.hourly_rate ?? (p.pricing?.consultation) ?? 50);
    const resolvedCurrency = extra.currency || p.currency || (p.pricing?.currency) || 'USD';
    const resolvedBio = extra.bio || p.bio || p.description || (p.headline ? `Specialized in ${p.headline}. Dedicated to providing seamless relocation and consulting support.` : 'Experienced professional dedicated to helping expats navigate relocation, housing, and local integration seamlessly.');
    const resolvedSkills = (Array.isArray(extra.skills) && extra.skills.length > 0)
        ? extra.skills
        : (Array.isArray(p.skills) && p.skills.length > 0)
            ? p.skills
            : (p.profession && p.profession !== 'Advisor')
                ? p.profession.split(/[,|•/]/).map(s => s.trim()).filter(Boolean)
                : ['Full Stack Development', 'Technical Consulting', 'Software Engineering'];

    return {
        ...p,
        ...extra,
        name: p.name || p.full_name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : '') || 'Expert Advisor',
        profession: p.profession || p.headline || extra.profession || 'Verified Advisor',
        headline: p.headline || p.profession || extra.headline || 'Verified Advisor',
        bio: resolvedBio,
        experience: resolvedExp,
        yearsOfExperience: expMatch ? parseInt(expMatch[1], 10) : 5,
        hourlyRate: resolvedRate,
        hourly_rate: resolvedRate,
        currency: resolvedCurrency,
        pricing: {
            consultation: resolvedRate,
            currency: resolvedCurrency,
            type: extra.pricing?.type || 'hourly'
        },
        skills: resolvedSkills,
        category: extra.category || p.category || 'tech-mentorship',
        languages: (Array.isArray(extra.languages) && extra.languages.length > 0) ? extra.languages : ['English'],
        experiences: (Array.isArray(extra.experiences) && extra.experiences.length > 0) ? extra.experiences : [
            {
                role: p.profession || p.headline || 'Full Stack Developer',
                company: (extra.category || p.category || 'Tech & Mentorship').replace(/-/g, ' ').toUpperCase(),
                period: resolvedExp || '5+ years',
                duration: resolvedExp || '5+ years',
                description: resolvedBio || 'Proven track record delivering solutions and advising clients.'
            }
        ],
        educations: (Array.isArray(extra.educations) && extra.educations.length > 0) ? extra.educations : (Array.isArray(p.educations) ? p.educations : []),
        services: (Array.isArray(extra.services) && extra.services.length > 0) ? extra.services : [
            {
                id: 'consult-1',
                name: '1-on-1 Advisory Consultation',
                title: '1-on-1 Advisory Consultation',
                price: resolvedRate,
                rate: resolvedRate,
                currency: resolvedCurrency,
                duration: '1 Hour',
                description: 'Personalized guidance, review, and direct expert consultation.'
            }
        ]
    };
}

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

    // Pack extended expert fields into occupation JSON string
    const extraMeta = {
        hourlyRate: data.hourlyRate ?? data.hourly_rate ?? data.pricing?.consultation ?? data.rate,
        currency: data.currency ?? data.pricing?.currency ?? 'USD',
        experience: data.experience ?? data.yearsOfExperience ?? data.years_of_experience,
        bio: data.bio ?? data.description,
        skills: data.skills,
        specializations: data.specializations,
        category: data.category,
        website: data.website,
        telegram: data.telegram,
        languages: data.languages,
        experiences: data.experiences,
        educations: data.educations,
        services: data.services,
        portfolio: data.portfolio,
        availability: data.availability,
        pricing: data.pricing
    };
    
    if (Object.values(extraMeta).some(v => v !== undefined && v !== null && v !== '')) {
        sanitized.occupation = JSON.stringify(extraMeta);
    }

    for (const [key, val] of Object.entries(data)) {
        if (VALID_PROFILE_COLUMNS.has(key) && val !== undefined && sanitized[key] === undefined) {
            sanitized[key] = val;
        }
    }
    return sanitized;
}

const VALID_BUY_SELL_COLUMNS = new Set([
    'id', 'user_id', 'host_id', 'title', 'description', 'price', 'category', 'subcategory',
    'condition', 'images', 'image', 'photos', 'country', 'state', 'city', 'zip_code',
    'street_address', 'address', 'name', 'phone', 'email', 'status', 'is_approved',
    'make', 'model', 'year', 'mileage', 'fuel_type', 'transmission',
    'created_at', 'updated_at'
]);

function sanitizeBuySellData(data, userId) {
    if (!data || typeof data !== 'object') return {};
    const sanitized = {};

    if (userId) {
        sanitized.user_id = userId;
    }

    if (data.title) sanitized.title = String(data.title).trim();
    if (data.description) sanitized.description = String(data.description).trim();
    if (data.price !== undefined && data.price !== null && data.price !== '') {
        sanitized.price = Number(data.price) || 0;
    } else {
        sanitized.price = 0;
    }

    if (data.category) sanitized.category = String(data.category).trim();
    if (data.subcategory) sanitized.subcategory = String(data.subcategory).trim();
    if (data.condition) sanitized.condition = String(data.condition).trim();

    // Location fields
    if (data.country) sanitized.country = typeof data.country === 'string' ? data.country : data.country?.name || '';
    if (data.state) sanitized.state = String(data.state).trim();
    if (data.city) sanitized.city = String(data.city).trim();
    if (data.zip_code || data.zipCode || data.pincode) {
        sanitized.zip_code = String(data.zip_code || data.zipCode || data.pincode).trim();
    }
    if (data.street_address || data.streetAddress || data.address) {
        sanitized.street_address = String(data.street_address || data.streetAddress || data.address).trim();
    }

    // Contact info
    if (data.name || data.seller_name) sanitized.name = String(data.name || data.seller_name).trim();
    if (data.phone || data.seller_phone || data.whatsapp) {
        sanitized.phone = String(data.phone || data.seller_phone || data.whatsapp).trim();
    }
    if (data.email || data.seller_email) sanitized.email = String(data.email || data.seller_email).trim();

    // Vehicles / dynamic fields
    if (data.make) sanitized.make = String(data.make).trim();
    if (data.model) sanitized.model = String(data.model).trim();
    if (data.year !== undefined && data.year !== null && String(data.year).trim() !== '') {
        const parsedYear = parseInt(data.year, 10);
        if (!isNaN(parsedYear)) sanitized.year = parsedYear;
    }
    if (data.mileage !== undefined && data.mileage !== null && String(data.mileage).trim() !== '') {
        const parsedMileage = Number(data.mileage);
        if (!isNaN(parsedMileage)) sanitized.mileage = parsedMileage;
    }
    if (data.fuel_type || data.fuelType) sanitized.fuel_type = String(data.fuel_type || data.fuelType).trim();
    if (data.transmission) sanitized.transmission = String(data.transmission).trim();

    // Status & Approval (new items must be pending review)
    sanitized.status = data.status || 'pending';
    sanitized.is_approved = data.is_approved !== undefined ? Boolean(data.is_approved) : false;

    // Images resolution
    let finalImages = [];
    if (Array.isArray(data.images)) {
        finalImages = data.images.filter(Boolean);
    } else if (Array.isArray(data.photos)) {
        finalImages = data.photos.filter(Boolean);
    } else if (Array.isArray(data.galleryImages)) {
        finalImages = data.galleryImages.filter(Boolean);
    } else if (Array.isArray(data.existingImages)) {
        finalImages = data.existingImages.filter(Boolean);
    } else if (typeof data.images === 'string' && data.images.startsWith('[')) {
        try { finalImages = JSON.parse(data.images); } catch {}
    } else if (typeof data.existingImages === 'string' && data.existingImages.startsWith('[')) {
        try { finalImages = JSON.parse(data.existingImages); } catch {}
    } else if (data.image) {
        finalImages = [data.image];
    }

    if (finalImages.length > 0) {
        sanitized.images = finalImages;
    }

    return sanitized;
}

const VALID_STAY_REQUEST_COLUMNS = new Set([
    'id',
    'user_id',
    'user_name',
    'username',
    'title',
    'description',
    'stay_description',
    'city',
    'country',
    'destination_city',
    'destination_country',
    'stay_type',
    'accommodation_type',
    'room_type',
    'budget',
    'check_in',
    'check_out',
    'guests',
    'status',
    'is_approved',
    'rejection_reason',
    'created_at',
    'updated_at',
    'currency',
    'user_email',
    'email',
    'phone',
    'user_phone',
    'photos',
    'images',
    'notes'
]);

function sanitizeStayRequestData(data, userId) {
    if (!data || typeof data !== 'object') return {};
    const sanitized = {};

    if (userId) {
        sanitized.user_id = String(userId);
    }

    const name = data.seekerName || data.seeker_name || data.user_name || data.userName || data.username || data.name || 'Stay Seeker';
    sanitized.user_name = String(name).trim();
    sanitized.username = String(name).trim();

    if (data.title) sanitized.title = String(data.title).trim();
    
    const desc = data.description || data.stay_description || '';
    if (desc) {
        sanitized.description = String(desc).trim();
        sanitized.stay_description = String(desc).trim();
    }

    const countryVal = typeof data.country === 'string' ? data.country : data.country?.name || '';
    if (countryVal) {
        sanitized.country = countryVal;
        sanitized.destination_country = countryVal;
    }

    const cityVal = data.city || data.destination_city || '';
    if (cityVal) {
        sanitized.city = String(cityVal).trim();
        sanitized.destination_city = String(cityVal).trim();
    }

    if (data.budget !== undefined && data.budget !== null && data.budget !== '') {
        sanitized.budget = Number(data.budget) || 0;
    }

    sanitized.currency = data.currency || 'INR';

    const stayTypeVal = data.stayType || data.stay_type || 'Long Term';
    sanitized.stay_type = String(stayTypeVal).trim();
    sanitized.accommodation_type = String(data.accommodation_type || data.accommodationType || stayTypeVal).trim();
    sanitized.room_type = String(data.room_type || data.roomType || 'Entire Place').trim();

    const emailVal = data.email || data.user_email || '';
    if (emailVal) {
        sanitized.email = String(emailVal).trim();
        sanitized.user_email = String(emailVal).trim();
    }

    const phoneVal = data.phone || data.user_phone || data.whatsappNumber || data.whatsapp || '';
    if (phoneVal) {
        sanitized.phone = String(phoneVal).trim();
        sanitized.user_phone = String(phoneVal).trim();
    }

    sanitized.status = data.status || 'pending';
    sanitized.is_approved = data.is_approved !== undefined ? Boolean(data.is_approved) : false;

    // Pack extra fields like whatsapp, linkedin, instagram, furnishing, state into notes so nothing is lost
    const extraNotes = {
        state: data.state || '',
        furnishing: data.furnishing || '',
        whatsapp: data.whatsappNumber || data.whatsapp || '',
        linkedin: data.linkedin || '',
        instagram: data.instagram || '',
        seekerName: name
    };
    sanitized.notes = JSON.stringify(extraNotes);

    // Keep ONLY valid table columns
    const cleaned = {};
    for (const key of Object.keys(sanitized)) {
        if (VALID_STAY_REQUEST_COLUMNS.has(key)) {
            cleaned[key] = sanitized[key];
        }
    }
    return cleaned;
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
        if (cleanUrl.startsWith('property') || cleanUrl.startsWith('accommodations') || cleanUrl.startsWith('admin/properties') || cleanUrl.startsWith('admin/pending/pending-properties') || cleanUrl.startsWith('admin/approved/approved-properties') || cleanUrl.startsWith('admin/rejected/rejected-properties')) {
            // Admin actions for properties
            if (cleanUrl.startsWith('admin/property/approve') || cleanUrl.startsWith('admin/properties/approve') || cleanUrl.startsWith('property/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('properties').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, property: data, message: 'Property approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/property/reject') || cleanUrl.startsWith('admin/properties/reject') || cleanUrl.startsWith('property/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('properties').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, property: data, message: 'Property rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-properties' || cleanUrl === 'admin/properties/pending') {
                let query = supabase.from('properties').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                if (queryParams.country) query = query.ilike('country', `%${queryParams.country}%`)
                const { data } = await query
                const enriched = await enrichPropertiesWithHostDetails(data || [])
                return { data: enriched }
            }

            if (cleanUrl === 'admin/approved/approved-properties' || cleanUrl === 'admin/properties/approved') {
                let query = supabase.from('properties').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country) query = query.ilike('country', `%${queryParams.country}%`)
                const { data } = await query
                const enriched = await enrichPropertiesWithHostDetails(data || [])
                return { data: enriched }
            }

            if (cleanUrl === 'admin/rejected/rejected-properties' || cleanUrl === 'admin/properties/rejected') {
                let query = supabase.from('properties').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country) query = query.ilike('country', `%${queryParams.country}%`)
                const { data } = await query
                const enriched = await enrichPropertiesWithHostDetails(data || [])
                return { data: enriched }
            }

            if (cleanUrl === 'property/all' || cleanUrl === 'property/approved' || cleanUrl === 'property' || cleanUrl === 'accommodations') {
                let query = supabase.from('properties').select('*').eq('status', 'approved').order('created_at', { ascending: false })
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
                const enriched = await enrichPropertiesWithHostDetails(data || [])
                return { data: { properties: enriched, total: enriched.length } }
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
                const enriched = await enrichPropertiesWithHostDetails(data || [])
                return { data: { properties: enriched } }
            }

            if ((cleanUrl === 'property/create-draft' || cleanUrl === 'property/create' || cleanUrl === 'property') && method === 'POST') {
                const userId = await getCurrentUserId()
                const rawData = (body instanceof FormData) ? await parseFormDataWithUploads(body, 'properties') : (body || {})
                const payload = sanitizePropertyData(rawData)
                if (userId) {
                    payload.host_id = userId
                    try {
                        const { data: hostProfile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                        if (hostProfile) {
                            const hostName = hostProfile.full_name || hostProfile.name || ''
                            if (hostName && !payload.host_name) payload.host_name = hostName
                            if (hostName && !payload.hostName) payload.hostName = hostName
                            if (hostName && !payload.user_name) payload.user_name = hostName
                            if (hostProfile.phone && !payload.phone) payload.phone = hostProfile.phone
                            if (hostProfile.email && !payload.email) payload.email = hostProfile.email
                        }
                    } catch (e) {}
                }
                payload.status = payload.status || 'draft'
                const { data, error } = await supabase.from('properties').insert(payload).select().maybeSingle()
                if (error) {
                    console.error('Supabase property create error:', error)
                    return { error: { status: 400, error: error.message } }
                }
                const enriched = await enrichPropertiesWithHostDetails(data)
                return { data: { property: enriched, propertyId: enriched?.id, data: enriched, id: enriched?.id, message: 'Property created' } }
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
                const enriched = await enrichPropertiesWithHostDetails(data)
                return { data: { property: enriched, host: enriched?.host || null } }
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
                    const enriched = data ? await enrichPropertiesWithHostDetails(data) : null
                    if (enriched) return { data: { property: enriched, propertyId: enriched.id, data: enriched, id: enriched.id, success: true } }
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
            const { data } = await supabase.from('properties').select('*').eq('status', 'approved').limit(20)
            const enriched = await enrichPropertiesWithHostDetails(data || [])
            return { data: { properties: enriched } }
        }

        // ── 2. HOST PROFILE ─────────────────────────────────────────
        if (cleanUrl.startsWith('host') || cleanUrl.startsWith('admin/approved') || cleanUrl.startsWith('admin/pending') || cleanUrl.startsWith('admin/rejected') || cleanUrl.startsWith('admin/host')) {
            if (cleanUrl === 'host/get') {
                const userId = await getCurrentUserId()
                if (!userId) return { data: { host: null } }
                const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                if (data) {
                    const isHost = data.role === 'host' || !!(data.id_proof_type || data.id_photo || data.selfie_photo)
                    return { data: { host: isHost ? data : null } }
                }

                // Fallback from auth session for normal user
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user?.id === userId) {
                    const fallbackUser = {
                        id: userId,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                        role: 'user',
                        status: null,
                        is_approved: false
                    }
                    await supabase.from('profiles').upsert(fallbackUser, { onConflict: 'id' })
                    return { data: { host: null } }
                }
                return { data: { host: null } }
            }

            if (cleanUrl === 'admin/approved/approved-host-details' || cleanUrl === 'admin/host/approved') {
                let query = supabase.from('profiles').select('*').or('is_approved.eq.true,status.eq.approved')
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

                // Try direct update first to avoid PostgREST 409 upsert conflicts on existing rows
                let { data, error } = await supabase.from('profiles').update(sanitized).eq('id', userId).select().maybeSingle()
                
                // If row didn't exist yet, insert/upsert it
                if (!data && (!error || error.code === 'PGRST116')) {
                    const upsertRes = await supabase.from('profiles').upsert({ id: userId, ...sanitized }, { onConflict: 'id' }).select().maybeSingle()
                    data = upsertRes.data
                    error = upsertRes.error
                }

                if (error) {
                    console.error('Supabase host save error:', error)
                    const errorMsg = error.details || error.hint || error.message || 'Database conflict occurred while saving host details'
                    return { error: { status: error.code === '23505' ? 409 : 400, error: errorMsg, message: errorMsg } }
                }
                return { data: { host: data || { id: userId, ...sanitized, ...parsedBody } } }
            }
            return { data: { host: null } }
        }

        // ── 3. EVENTS ───────────────────────────────────────────────
        if (cleanUrl.startsWith('events') || cleanUrl.startsWith('event') || cleanUrl.startsWith('admin/events') || cleanUrl.startsWith('admin/pending/pending-events') || cleanUrl.startsWith('admin/approved/approved-events') || cleanUrl.startsWith('admin/rejected/rejected-events')) {
            // Admin actions
            if (cleanUrl.startsWith('admin/events/approve') || cleanUrl.startsWith('admin/event/approve') || cleanUrl.startsWith('events/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('events').update({ status: 'approved' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, event: data, message: 'Event approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/events/reject') || cleanUrl.startsWith('admin/event/reject') || cleanUrl.startsWith('events/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('events').update({ status: 'rejected' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, event: data, message: 'Event rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-events' || cleanUrl === 'admin/events/pending' || cleanUrl === 'events/admin/pending') {
                let query = supabase.from('events').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/approved/approved-events' || cleanUrl === 'admin/events/approved' || cleanUrl === 'events/admin/approved') {
                let query = supabase.from('events').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/rejected/rejected-events' || cleanUrl === 'admin/events/rejected' || cleanUrl === 'events/admin/rejected') {
                let query = supabase.from('events').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'events/approved' || cleanUrl === 'events/all' || cleanUrl === 'events') {
                let query = supabase.from('events').select('*').eq('status', 'approved')
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
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
                const { data, error } = await supabase.from('events').insert({ ...(payload || {}), host_id: userId, status: 'pending' }).select().maybeSingle()
                if (error) throw error
                return { data: { event: data } }
            }

            const { data } = await supabase.from('events').select('*').eq('status', 'approved').limit(20)
            return { data: { events: data || [] } }
        }

        // ── 4. MARKETPLACE / BUY-SELL ──────────────────────────────
        if (cleanUrl.startsWith('buy-sell') || cleanUrl.startsWith('marketplace') || cleanUrl.startsWith('admin/buysell') || cleanUrl.startsWith('admin/buy-sell') || cleanUrl.startsWith('admin/pending/pending-buysell') || cleanUrl.startsWith('admin/approved/approved-buysell') || cleanUrl.startsWith('admin/rejected/rejected-buysell')) {
            // Admin actions
            if (cleanUrl.startsWith('admin/buysell/approve') || cleanUrl.startsWith('admin/buy-sell/approve') || cleanUrl.startsWith('buy-sell/approve') || cleanUrl.startsWith('marketplace/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('buy_sell').update({ status: 'approved' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, listing: data, message: 'Buy/Sell listing approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/buysell/reject') || cleanUrl.startsWith('admin/buy-sell/reject') || cleanUrl.startsWith('buy-sell/reject') || cleanUrl.startsWith('marketplace/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('buy_sell').update({ status: 'rejected' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, listing: data, message: 'Buy/Sell listing rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-buysell' || cleanUrl === 'admin/pending/pending-buy-sell' || cleanUrl === 'admin/buysell/pending' || cleanUrl === 'admin/buy-sell/pending' || cleanUrl === 'buy-sell/admin/pending') {
                let query = supabase.from('buy_sell').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/approved/approved-buysell' || cleanUrl === 'admin/approved/approved-buy-sell' || cleanUrl === 'admin/buysell/approved' || cleanUrl === 'admin/buy-sell/approved' || cleanUrl === 'buy-sell/admin/approved') {
                let query = supabase.from('buy_sell').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/rejected/rejected-buysell' || cleanUrl === 'admin/rejected/rejected-buy-sell' || cleanUrl === 'admin/buysell/rejected' || cleanUrl === 'admin/buy-sell/rejected' || cleanUrl === 'buy-sell/admin/rejected') {
                let query = supabase.from('buy_sell').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'buy-sell/get' || cleanUrl === 'buy-sell/all' || cleanUrl === 'buy-sell' || cleanUrl === 'marketplace') {
                let query = supabase.from('buy_sell').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                if (queryParams.state && queryParams.state !== 'All States' && queryParams.state !== 'All') {
                    query = query.ilike('state', `%${queryParams.state}%`)
                }
                if (queryParams.city && queryParams.city !== 'All Cities' && queryParams.city !== 'All') {
                    query = query.ilike('city', `%${queryParams.city}%`)
                }
                if (queryParams.category && queryParams.category !== 'All' && queryParams.category !== 'all') {
                    query = query.ilike('category', `%${queryParams.category}%`)
                }
                if (queryParams.subcategory && queryParams.subcategory !== 'All') {
                    query = query.ilike('subcategory', `%${queryParams.subcategory}%`)
                }
                if (queryParams.condition && queryParams.condition !== 'All') {
                    query = query.ilike('condition', `%${queryParams.condition}%`)
                }
                const minP = queryParams.minPrice ?? queryParams.priceMin
                if (minP !== undefined && minP !== '' && !isNaN(Number(minP))) {
                    query = query.gte('price', Number(minP))
                }
                const maxP = queryParams.maxPrice ?? queryParams.priceMax
                if (maxP !== undefined && maxP !== '' && !isNaN(Number(maxP))) {
                    query = query.lte('price', Number(maxP))
                }
                if (queryParams.search) {
                    const s = String(queryParams.search).trim()
                    if (s) {
                        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,category.ilike.%${s}%,city.ilike.%${s}%`)
                    }
                }
                if (queryParams.limit) {
                    query = query.limit(Number(queryParams.limit))
                }
                const { data, error } = await query
                if (error) {
                    console.warn('buy_sell fetch query error:', error)
                    return { data: { listings: [] } }
                }
                return { data: { listings: data || [], total: data?.length || 0 } }
            }

            if (cleanUrl === 'buy-sell/my-buy-sell' || cleanUrl === 'marketplace/my-listings') {
                const userId = await getCurrentUserId()
                let query = supabase.from('buy_sell').select('*').order('created_at', { ascending: false })
                if (userId) {
                    query = query.or(`user_id.eq.${userId},host_id.eq.${userId}`)
                }
                const { data, error } = await query
                if (error) return { data: { listings: [] } }
                return { data: { listings: data || [] } }
            }

            const buySellMatch = cleanUrl.match(/^(?:buy-sell\/get|marketplace|buy-sell)\/([^/]+)$/)
            if (buySellMatch && method === 'GET') {
                const id = buySellMatch[1]
                const { data, error } = await supabase.from('buy_sell').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: { listing: null } }
                return { data: { listing: data } }
            }

            if ((cleanUrl === 'buy-sell/create' || cleanUrl === 'marketplace/create' || cleanUrl === 'buy-sell') && method === 'POST') {
                const userId = await getCurrentUserId()
                let rawPayload = body
                if (body instanceof FormData) {
                    rawPayload = await parseFormDataWithUploads(body, 'marketplace')
                }
                const sanitized = sanitizeBuySellData(rawPayload, userId)

                let currentPayload = { ...sanitized, status: 'pending', is_approved: false }
                let insertRes = await supabase.from('buy_sell').insert(currentPayload).select().maybeSingle()
                
                // Adaptive recovery loop: dynamically strip non-existent columns reported by Supabase PostgREST PGRST204
                let attempts = 0
                while (insertRes.error && (insertRes.error.code === 'PGRST204' || insertRes.error.message?.includes('Could not find the')) && attempts < 10) {
                    attempts++
                    const match = insertRes.error.message?.match(/Could not find the '([^']+)' column/)
                    if (match && match[1] && currentPayload[match[1]] !== undefined) {
                        console.warn(`[Supabase buy_sell] table lacks column '${match[1]}', stripping and retrying...`)
                        delete currentPayload[match[1]]
                        insertRes = await supabase.from('buy_sell').insert(currentPayload).select().maybeSingle()
                    } else {
                        break
                    }
                }

                // If error involves host_id vs user_id
                if (insertRes.error && (insertRes.error.message?.includes('user_id') || insertRes.error.details?.includes('user_id'))) {
                    const { user_id, ...withoutUserId } = currentPayload
                    const retry = await supabase.from('buy_sell').insert({ ...withoutUserId, host_id: userId }).select().maybeSingle()
                    if (!retry.error) {
                        insertRes = retry
                    }
                }

                if (insertRes.error) {
                    console.error('Final buy_sell insert error:', insertRes.error)
                    return { error: { status: 400, error: insertRes.error.message || 'Failed to create listing', message: insertRes.error.message || 'Failed to create listing' } }
                }

                return { data: { success: true, listing: insertRes.data, listings: [insertRes.data], message: 'Listing created successfully' } }
            }

            const updateMatch = cleanUrl.match(/^(?:buy-sell\/update|marketplace\/update|buy-sell)\/([^/]+)$/)
            if (updateMatch && (method === 'PUT' || method === 'POST' || method === 'PATCH')) {
                const id = updateMatch[1]
                const userId = await getCurrentUserId()
                let rawPayload = body
                if (body instanceof FormData) {
                    rawPayload = await parseFormDataWithUploads(body, 'marketplace')
                }
                const sanitized = sanitizeBuySellData(rawPayload, userId)

                let currentPayload = { ...sanitized }
                let updateRes = await supabase.from('buy_sell').update(currentPayload).eq('id', id).select().maybeSingle()
                
                // Adaptive recovery loop for update
                let attempts = 0
                while (updateRes.error && (updateRes.error.code === 'PGRST204' || updateRes.error.message?.includes('Could not find the')) && attempts < 10) {
                    attempts++
                    const match = updateRes.error.message?.match(/Could not find the '([^']+)' column/)
                    if (match && match[1] && currentPayload[match[1]] !== undefined) {
                        console.warn(`[Supabase buy_sell update] table lacks column '${match[1]}', stripping and retrying...`)
                        delete currentPayload[match[1]]
                        updateRes = await supabase.from('buy_sell').update(currentPayload).eq('id', id).select().maybeSingle()
                    } else {
                        break
                    }
                }

                if (updateRes.error) {
                    console.error('Supabase buy_sell update error:', updateRes.error)
                    return { error: { status: 400, error: updateRes.error.message || 'Failed to update listing' } }
                }
                return { data: { success: true, listing: updateRes.data, message: 'Listing updated successfully' } }
            }

            const deleteMatch = cleanUrl.match(/^(?:buy-sell\/delete|marketplace\/delete|buy-sell)\/([^/]+)$/)
            if (deleteMatch && method === 'DELETE') {
                const id = deleteMatch[1]
                const { error } = await supabase.from('buy_sell').delete().eq('id', id)
                if (error) {
                    return { error: { status: 400, error: error.message || 'Failed to delete listing' } }
                }
                return { data: { success: true, message: 'Listing deleted successfully' } }
            }

            const { data } = await supabase.from('buy_sell').select('*').limit(20)
            return { data: { listings: data || [] } }
        }

        // ── 5. TRAVEL / TRIPS ───────────────────────────────────────
        if (cleanUrl.startsWith('travel') || cleanUrl.startsWith('admin/travel') || cleanUrl.startsWith('admin/pending/pending-travel') || cleanUrl.startsWith('admin/approved/approved-travel') || cleanUrl.startsWith('admin/rejected/rejected-travel') || cleanUrl.startsWith('admin/pending/pending-trips') || cleanUrl.startsWith('admin/approved/approved-trips') || cleanUrl.startsWith('admin/rejected/rejected-trips')) {
            // Admin actions
            if (cleanUrl.startsWith('admin/travel/approve') || cleanUrl.startsWith('admin/trips/approve') || cleanUrl.startsWith('travel/approve') || cleanUrl.startsWith('travel/trips/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('travel_trips').update({ status: 'approved' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, trip: data, message: 'Trip approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/travel/reject') || cleanUrl.startsWith('admin/trips/reject') || cleanUrl.startsWith('travel/reject') || cleanUrl.startsWith('travel/trips/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('travel_trips').update({ status: 'rejected' }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, trip: data, message: 'Trip rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-travel' || cleanUrl === 'admin/pending/pending-trips' || cleanUrl === 'admin/travel/pending' || cleanUrl === 'travel/admin/pending') {
                let query = supabase.from('travel_trips').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.or(`to_country.ilike.%${queryParams.country}%,from_country.ilike.%${queryParams.country}%,destination.ilike.%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/approved/approved-travel' || cleanUrl === 'admin/approved/approved-trips' || cleanUrl === 'admin/travel/approved' || cleanUrl === 'travel/admin/approved') {
                let query = supabase.from('travel_trips').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.or(`to_country.ilike.%${queryParams.country}%,from_country.ilike.%${queryParams.country}%,destination.ilike.%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/rejected/rejected-travel' || cleanUrl === 'admin/rejected/rejected-trips' || cleanUrl === 'admin/travel/rejected' || cleanUrl === 'travel/admin/rejected') {
                let query = supabase.from('travel_trips').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.or(`to_country.ilike.%${queryParams.country}%,from_country.ilike.%${queryParams.country}%,destination.ilike.%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'travel/trips' || cleanUrl === 'travel/trips/search') {
                let query = supabase.from('travel_trips').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.or(`destination.ilike.%${queryParams.country}%,origin.ilike.%${queryParams.country}%,to_country.ilike.%${queryParams.country}%,from_country.ilike.%${queryParams.country}%`)
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
                let query = supabase.from('travel_trips').select('*').order('created_at', { ascending: false })
                if (userId) query = query.eq('host_id', userId)
                const { data, error } = await query
                if (error) return { data: { trips: [] } }
                return { data: { trips: data || [] } }
            }

            if (cleanUrl === 'travel/trips' && method === 'POST') {
                const userId = await getCurrentUserId()
                const { data, error } = await supabase.from('travel_trips').insert({ ...(body || {}), host_id: userId, status: 'pending' }).select().maybeSingle()
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

            const { data } = await supabase.from('travel_trips').select('*').eq('status', 'approved').limit(20)
            return { data: { trips: data || [] } }
        }

        // ── 6. STAY REQUESTS ────────────────────────────────────────
        if (cleanUrl.startsWith('stay-request') || cleanUrl.startsWith('admin/stay-request') || cleanUrl.startsWith('admin/pending/pending-stay-requests') || cleanUrl.startsWith('admin/approved/approved-stay-requests') || cleanUrl.startsWith('admin/rejected/rejected-stay-requests')) {
            // Admin actions
            if (cleanUrl.startsWith('admin/stay-request/approve') || cleanUrl.startsWith('admin/stay-requests/approve') || cleanUrl.startsWith('stay-request/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('stay_requests').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, stay_request: data, message: 'Stay request approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/stay-request/reject') || cleanUrl.startsWith('admin/stay-requests/reject') || cleanUrl.startsWith('stay-request/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('stay_requests').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, stay_request: data, message: 'Stay request rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-stay-requests' || cleanUrl === 'admin/stay-requests/pending' || cleanUrl === 'stay-request/admin/pending') {
                let query = supabase.from('stay_requests').select('*').or('is_approved.eq.false,status.eq.pending').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/approved/approved-stay-requests' || cleanUrl === 'admin/stay-requests/approved' || cleanUrl === 'stay-request/admin/approved') {
                let query = supabase.from('stay_requests').select('*').or('is_approved.eq.true,status.eq.approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            if (cleanUrl === 'admin/rejected/rejected-stay-requests' || cleanUrl === 'admin/stay-requests/rejected' || cleanUrl === 'stay-request/admin/rejected') {
                let query = supabase.from('stay_requests').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: data || [] }
            }

            // 1. Create Stay Request: POST stay-request
            if ((cleanUrl === 'stay-request' || cleanUrl === 'stay-request/create') && method === 'POST') {
                const userId = await getCurrentUserId()
                const sanitized = sanitizeStayRequestData(body, userId)

                let currentPayload = { ...sanitized, status: 'pending', is_approved: false }
                let insertRes = await supabase.from('stay_requests').insert(currentPayload).select().maybeSingle()

                // Adaptive recovery loop for missing columns
                let attempts = 0
                while (insertRes.error && (insertRes.error.code === 'PGRST204' || insertRes.error.message?.includes('Could not find the')) && attempts < 10) {
                    attempts++
                    const match = insertRes.error.message?.match(/Could not find the '([^']+)' column/)
                    if (match && match[1] && currentPayload[match[1]] !== undefined) {
                        console.warn(`[Supabase stay_requests] table lacks column '${match[1]}', stripping and retrying...`)
                        delete currentPayload[match[1]]
                        insertRes = await supabase.from('stay_requests').insert(currentPayload).select().maybeSingle()
                    } else {
                        break
                    }
                }

                if (insertRes.error) {
                    console.error('Final stay_requests insert error:', insertRes.error)
                    return { error: { status: 400, error: insertRes.error.message || 'Failed to create stay request', message: insertRes.error.message || 'Failed to create stay request' } }
                }

                return { data: insertRes.data, message: 'Stay request created successfully', success: true }
            }

            // 2. Get My Stay Requests: GET stay-request/me
            if (cleanUrl === 'stay-request/me') {
                const userId = await getCurrentUserId()
                if (!userId) return { data: [] }
                const { data, error } = await supabase.from('stay_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
                if (error) return { data: [] }
                return { data: data || [] }
            }

            // 3. Single Stay Request: GET stay-request/request/:id or stay-request/:id
            const singleMatch = cleanUrl.match(/^stay-request\/(?:request\/)?([^/]+)$/)
            if (singleMatch && method === 'GET' && !['search', 'me', 'report', 'all'].includes(singleMatch[1])) {
                const id = singleMatch[1]
                const { data, error } = await supabase.from('stay_requests').select('*').eq('id', id).maybeSingle()
                if (error || !data) return { data: null }
                return { data }
            }

            // 4. Update Stay Request: PUT/PATCH stay-request/:id
            if (singleMatch && (method === 'PUT' || method === 'PATCH' || method === 'POST') && !['search', 'me', 'report', 'all', 'create'].includes(singleMatch[1])) {
                const id = singleMatch[1]
                const userId = await getCurrentUserId()
                const sanitized = sanitizeStayRequestData(body, userId)

                let currentPayload = { ...sanitized }
                let updateRes = await supabase.from('stay_requests').update(currentPayload).eq('id', id).select().maybeSingle()

                let attempts = 0
                while (updateRes.error && (updateRes.error.code === 'PGRST204' || updateRes.error.message?.includes('Could not find the')) && attempts < 10) {
                    attempts++
                    const match = updateRes.error.message?.match(/Could not find the '([^']+)' column/)
                    if (match && match[1] && currentPayload[match[1]] !== undefined) {
                        delete currentPayload[match[1]]
                        updateRes = await supabase.from('stay_requests').update(currentPayload).eq('id', id).select().maybeSingle()
                    } else {
                        break
                    }
                }

                if (updateRes.error) {
                    return { error: { status: 400, error: updateRes.error.message || 'Failed to update stay request' } }
                }
                return { data: updateRes.data, success: true }
            }

            // 5. Delete Stay Request: DELETE stay-request/:id
            if (singleMatch && method === 'DELETE') {
                const id = singleMatch[1]
                const { error } = await supabase.from('stay_requests').delete().eq('id', id)
                if (error) {
                    return { error: { status: 400, error: error.message || 'Failed to delete stay request' } }
                }
                return { data: { success: true, message: 'Deleted successfully' } }
            }

            // 6. Report Stay Request: POST stay-request/report
            if (cleanUrl === 'stay-request/report' && method === 'POST') {
                try {
                    await supabase.from('stay_request_reports').insert(body || {})
                } catch {}
                return { data: { success: true, message: 'Report submitted successfully' } }
            }

            // 7. Public Stay Requests Search & Listing: GET stay-request, GET stay-request/search
            // Only show APPROVED stay requests in the public UI
            let query = supabase.from('stay_requests').select('*').or('is_approved.eq.true,status.eq.approved').order('created_at', { ascending: false })
            if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                query = query.ilike('country', `%${queryParams.country}%`)
            }
            if (queryParams.state && queryParams.state !== 'All States' && queryParams.state !== 'All') {
                query = query.ilike('state', `%${queryParams.state}%`)
            }
            if (queryParams.city && queryParams.city !== 'All Cities' && queryParams.city !== 'All') {
                query = query.ilike('city', `%${queryParams.city}%`)
            }
            if (queryParams.budget || queryParams.minPrice) {
                query = query.gte('budget', Number(queryParams.budget || queryParams.minPrice))
            }
            if (queryParams.maxPrice) {
                query = query.lte('budget', Number(queryParams.maxPrice))
            }
            if (queryParams.stayType) {
                query = query.eq('stay_type', queryParams.stayType)
            }
            if (queryParams.furnishing) {
                query = query.eq('furnishing', queryParams.furnishing)
            }
            if (queryParams.search) {
                const s = String(queryParams.search).trim()
                if (s) {
                    query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,city.ilike.%${s}%,country.ilike.%${s}%`)
                }
            }
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            
            const { data, error } = await query
            if (error) {
                console.warn('stay_requests fetch query error:', error)
                return { data: [] }
            }
            return { data: data || [] }
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
        if (cleanUrl.startsWith('people') || cleanUrl.startsWith('connections') || cleanUrl.startsWith('connection') || cleanUrl.startsWith('admin/people') || cleanUrl.startsWith('admin/pending/pending-experts') || cleanUrl.startsWith('admin/approved/approved-experts') || cleanUrl.startsWith('admin/rejected/rejected-experts')) {
            // Admin actions for Experts/People
            if (cleanUrl.startsWith('admin/people/approve') || cleanUrl.startsWith('admin/experts/approve') || cleanUrl.startsWith('people/approve')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, profile: data, message: 'Profile approved' } }
                }
            }

            if (cleanUrl.startsWith('admin/people/reject') || cleanUrl.startsWith('admin/experts/reject') || cleanUrl.startsWith('people/reject')) {
                const parts = cleanUrl.split('/')
                const id = parts[parts.length - 1]
                if (id) {
                    const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                    return { data: { success: true, profile: data, message: 'Profile rejected' } }
                }
            }

            if (cleanUrl === 'admin/pending/pending-experts' || cleanUrl === 'admin/people/pending') {
                let query = supabase.from('profiles').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: (data || []).map(enrichProfile) }
            }

            if (cleanUrl === 'admin/approved/approved-experts' || cleanUrl === 'admin/people/approved') {
                let query = supabase.from('profiles').select('*').eq('status', 'approved').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: (data || []).map(enrichProfile) }
            }

            if (cleanUrl === 'admin/rejected/rejected-experts' || cleanUrl === 'admin/people/rejected') {
                let query = supabase.from('profiles').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                    query = query.ilike('country', `%${queryParams.country}%`)
                }
                const { data } = await query
                return { data: (data || []).map(enrichProfile) }
            }

            if (cleanUrl === 'people/me' || cleanUrl === 'people/profile/me') {
                const userId = await getCurrentUserId()
                if (!userId) return { data: { profile: null } }
                const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                if (data && (data.role === 'expert' || data.profession || data.headline || data.occupation || (data.bio && data.bio.trim().length > 0))) {
                    return { data: { profile: enrichProfile(data) } }
                }
                return { data: { profile: null } }
            }

            const profileMatch = cleanUrl.match(/^people\/profile\/([^/]+)$/)
            if (profileMatch && method === 'GET') {
                const id = profileMatch[1]
                const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
                return { data: { profile: data ? enrichProfile(data) : null } }
            }

            if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                const userId = await getCurrentUserId()
                if (userId) {
                    const parsedBody = (body instanceof FormData) ? await parseFormDataWithUploads(body, 'profiles') : body
                    const sanitized = sanitizeProfileData(parsedBody)
                    const isSubmittingExpertDetails = Boolean(sanitized.profession || sanitized.headline || sanitized.occupation || sanitized.bio || parsedBody?.profession || parsedBody?.headline || parsedBody?.bio)
                    const updatePayload = {
                        ...sanitized,
                        ...(isSubmittingExpertDetails ? { status: 'pending', is_approved: false } : {})
                    }
                    const { data } = await supabase.from('profiles').update(updatePayload).eq('id', userId).select().maybeSingle()
                    return { data: { profile: data ? enrichProfile(data) : sanitized, success: true } }
                }
            }

            let query = supabase.from('profiles').select('*').eq('status', 'approved')
            if (queryParams.country && queryParams.country !== 'Global' && queryParams.country !== 'All') {
                query = query.ilike('country', `%${queryParams.country}%`)
            }
            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) return { data: { people: [], profiles: [], items: [], results: [] } }
            const expertProfiles = (data || []).filter(p => p.role === 'expert' || p.profession || p.headline || p.occupation || (p.bio && p.bio.trim().length > 0)).map(enrichProfile)
            return {
                data: {
                    people: expertProfiles,
                    profiles: expertProfiles,
                    items: expertProfiles,
                    results: expertProfiles,
                    total: expertProfiles.length
                }
            }
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

        // ── 12. WISHLIST / FAVORITES ─────────────────────────────────
        if (cleanUrl.startsWith('wishlist')) {
            const userId = await getCurrentUserId()

            // 1. Check wishlist status: wishlist/check/:type/:id
            const checkMatch = cleanUrl.match(/^wishlist\/check\/([^/]+)\/([^/]+)$/)
            if (checkMatch && method === 'GET') {
                const rawType = checkMatch[1]
                const itemId = String(checkMatch[2])

                if (!userId) {
                    return { data: { isWishlisted: false, isSaved: false } }
                }

                // Check local synchronized storage first
                const isSavedLocal = isLocalWishlisted(userId, itemId)

                if (hasWishlistTableInDb === false) {
                    return { data: { isWishlisted: isSavedLocal, isSaved: isSavedLocal, status: isSavedLocal ? 'saved' : 'none' } }
                }

                try {
                    let { data, error } = await supabase
                        .from('wishlists')
                        .select('id, item_id')
                        .eq('user_id', userId)
                        .eq('item_id', itemId)
                        .maybeSingle()

                    if (error) {
                        // Mark table as missing if 404 / 42P01 / PGRST205
                        if (error.code === '42P01' || error.code === 'PGRST205' || String(error.message).includes('not found')) {
                            hasWishlistTableInDb = false
                        }
                    } else {
                        hasWishlistTableInDb = true
                    }

                    const isWishlisted = Boolean(data && !error) || isSavedLocal
                    return {
                        data: {
                            isWishlisted,
                            isSaved: isWishlisted,
                            status: isWishlisted ? 'saved' : 'none'
                        }
                    }
                } catch (e) {
                    hasWishlistTableInDb = false
                    return { data: { isWishlisted: isSavedLocal, isSaved: isSavedLocal } }
                }
            }

            // 2. Toggle wishlist: wishlist/toggle
            if (cleanUrl === 'wishlist/toggle' && method === 'POST') {
                if (!userId) {
                    return { error: { status: 401, error: 'Please sign in to save items to your wishlist' } }
                }

                const rawType = body?.item_type || body?.type || 'property'
                const itemId = String(body?.item_id || body?.id || '')

                if (!itemId) {
                    return { error: { status: 400, error: 'Missing item ID for wishlist' } }
                }

                const nextLocalState = toggleLocalWishlist(userId, itemId, undefined, rawType)

                if (hasWishlistTableInDb !== false) {
                    try {
                        let { data: existing, error: findErr } = await supabase
                            .from('wishlists')
                            .select('id')
                            .eq('user_id', userId)
                            .eq('item_id', itemId)
                            .maybeSingle()

                        if (findErr) {
                            if (findErr.code === '42P01' || findErr.code === 'PGRST205' || String(findErr.message).includes('not found')) {
                                hasWishlistTableInDb = false
                            }
                        } else {
                            hasWishlistTableInDb = true
                            if (existing?.id) {
                                await supabase.from('wishlists').delete().eq('id', existing.id)
                            } else {
                                await supabase.from('wishlists').insert({
                                    user_id: userId,
                                    item_id: itemId,
                                    item_type: rawType
                                })
                            }
                        }
                    } catch (e) {
                        hasWishlistTableInDb = false
                    }
                }

                return {
                    data: {
                        isWishlisted: nextLocalState,
                        isSaved: nextLocalState,
                        success: true,
                        message: nextLocalState ? 'Added to wishlist' : 'Removed from wishlist'
                    }
                }
            }

            // 3. Add to wishlist: wishlist/add
            if (cleanUrl === 'wishlist/add' && method === 'POST') {
                if (!userId) {
                    return { error: { status: 401, error: 'Please sign in to save items' } }
                }
                const rawType = body?.item_type || body?.type || 'property'
                const itemId = String(body?.item_id || body?.id || '')
                
                try {
                    let tableName = 'wishlists'
                    const { error } = await supabase.from('wishlists').upsert(
                        { user_id: userId, item_id: itemId, item_type: rawType },
                        { onConflict: 'user_id,item_id' }
                    )
                    if (error && error.code === '42P01') {
                        tableName = 'wishlist'
                        await supabase.from('wishlist').upsert(
                            { user_id: userId, item_id: itemId, item_type: rawType },
                            { onConflict: 'user_id,item_id' }
                        )
                    }
                } catch (e) {}

                toggleLocalWishlist(userId, itemId, true, rawType)
                return { data: { isWishlisted: true, isSaved: true, success: true } }
            }

            // 4. Remove from wishlist: wishlist/:type/:id
            const removeMatch = cleanUrl.match(/^wishlist\/([^/]+)\/([^/]+)$/)
            if (removeMatch && method === 'DELETE') {
                const itemId = String(removeMatch[2])
                if (userId) {
                    try {
                        await supabase.from('wishlists').delete().eq('user_id', userId).eq('item_id', itemId)
                    } catch {}
                    try {
                        await supabase.from('wishlist').delete().eq('user_id', userId).eq('item_id', itemId)
                    } catch {}
                    toggleLocalWishlist(userId, itemId, false)
                }
                return { data: { isWishlisted: false, isSaved: false, success: true } }
            }

            // 5. Get full wishlist list: wishlist
            if (cleanUrl === 'wishlist' && method === 'GET') {
                if (!userId) {
                    return { data: { wishlist: [], total: 0 } }
                }

                const filterType = queryParams.type || ''
                let rows = []

                try {
                    let query = supabase.from('wishlists').select('*').eq('user_id', userId)
                    if (filterType) {
                        const types = mapItemTypeToAliases(filterType)
                        query = query.in('item_type', types)
                    }
                    const { data, error } = await query
                    if (!error && data && data.length > 0) {
                        rows = data
                    } else if (error && error.code === '42P01') {
                        let query2 = supabase.from('wishlist').select('*').eq('user_id', userId)
                        if (filterType) {
                            const types = mapItemTypeToAliases(filterType)
                            query2 = query2.in('item_type', types)
                        }
                        const fallback = await query2
                        if (fallback.data && fallback.data.length > 0) rows = fallback.data
                    }
                } catch (e) {}

                if (rows.length === 0) {
                    rows = getLocalWishlistRows(userId, filterType)
                }

                // Fetch item details for each wishlist entry
                const enrichedList = await Promise.all(
                    rows.map(async (row) => {
                        const type = (row.item_type || '').toLowerCase()
                        const itemId = row.item_id
                        let details = null

                        try {
                            if (['property', 'accommodations', 'stay'].includes(type)) {
                                const { data } = await supabase.from('properties').select('*').eq('id', itemId).maybeSingle()
                                if (data) {
                                    const enriched = await enrichPropertiesWithHostDetails([data])
                                    details = enriched?.[0] || data
                                }
                            } else if (['stay-request', 'stay_request', 'stay-requests', 'stay_requests', 'seeker', 'seekers'].includes(type)) {
                                const { data } = await supabase.from('stay_requests').select('*').eq('id', itemId).maybeSingle()
                                details = data
                            } else if (['event', 'events'].includes(type)) {
                                const { data } = await supabase.from('events').select('*').eq('id', itemId).maybeSingle()
                                details = data
                            } else if (['buysell', 'buy-sell', 'marketplace', 'product'].includes(type)) {
                                const { data } = await supabase.from('buy_sell').select('*').eq('id', itemId).maybeSingle()
                                details = data
                            } else if (['trip', 'travel', 'travel_trip'].includes(type)) {
                                const { data } = await supabase.from('travel_trips').select('*').eq('id', itemId).maybeSingle()
                                details = data
                            } else if (['expert', 'people', 'person'].includes(type)) {
                                const { data } = await supabase.from('profiles').select('*').eq('id', itemId).maybeSingle()
                                details = data
                            }
                        } catch (err) {}

                        return {
                            ...row,
                            details: details || { id: itemId, name: 'Item', title: 'Saved Item' }
                        }
                    })
                )

                return { data: { wishlist: enrichedList.filter(Boolean), total: enrichedList.length } }
            }
        }

        // Fallback default
        return { data: {} }
    } catch (err) {
        console.error(`Supabase Adapter Error on [${method}] ${cleanUrl}:`, err)
        return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Supabase Query Failed' } }
    }
}
