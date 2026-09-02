import { supabase } from '@/lib/supabaseClient';
import { PROPERTY_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId } from '../userUtils';
import { enrichPropertiesWithHostDetails } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { normalizeImages } from '@/lib/imageUtils';
import { normalizeCountryName, getCountryByName, getCountryByCode } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handlePropertiesRoute({ cleanUrl, method, body, queryParams }) {
        // ── 1. PROPERTIES / ACCOMMODATIONS ─────────────────────────
        if (cleanUrl.startsWith('propert') || cleanUrl.startsWith('accommodation') || cleanUrl.startsWith('admin/properties') || cleanUrl.startsWith('admin/pending/pending-properties') || cleanUrl.startsWith('admin/approved/approved-properties') || cleanUrl.startsWith('admin/rejected/rejected-properties')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('properties').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.host_id || data.user_id,
                        recipientId: data.host_id || data.user_id,
                        userEmail: data.host_email || data.email,
                        title: '🎉 Accommodation Approved & Verified!',
                        message: `Great news! Your space "${data.title || 'Accommodation'}" has been approved by NextKinLife admin and is now live and verified.`,
                        type: NOTIFICATION_TYPES.PROPERTY_APPROVED,
                        entityType: 'property',
                        entityId: data.id || id,
                        actionUrl: `/rooms/${data.id || id}`,
                        link: `/rooms/${data.id || id}`,
                        metadata: data
                    });
                }
                return { data: { success: true, property: data, message: 'Property approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('properties').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.host_id || data.user_id,
                        recipientId: data.host_id || data.user_id,
                        userEmail: data.host_email || data.email,
                        title: '⚠️ Accommodation Listing Update',
                        message: `Your accommodation listing "${data.title || 'Accommodation'}" requires revisions according to community guidelines.`,
                        type: NOTIFICATION_TYPES.PROPERTY_REJECTED,
                        entityType: 'property',
                        entityId: data.id || id,
                        actionUrl: `/account-v2?tab=listings`,
                        link: `/account-v2?tab=listings`,
                        metadata: data
                    });
                }
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
                payload.status = 'pending'
                payload.is_approved = false

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

                await notifyAdminsOfUserSubmission({
                    title: `🏡 New Accommodation Listed: ${data?.title || payload.title || 'Space'}`,
                    message: `Host (${data?.email || data?.phone || 'Host'}) created a new listing in ${data?.city || data?.country || 'NextKinLife'}.`,
                    type: NOTIFICATION_TYPES.PROPERTY_SUBMITTED,
                    entityType: 'property',
                    entityId: data?.id,
                    actionUrl: `/admin/properties`,
                    link: `/admin/properties`,
                    userId: data?.host_id || data?.user_id,
                    userEmail: data?.email,
                    userName: data?.host_name || data?.hostName,
                    metadata: data
                });

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
                    const rawPhotos = payload.photo || payload.photos || payload.image || payload.images;
                    if (rawPhotos) {
                        const { data: cur } = await supabase.from('properties').select('photos, images').eq('id', id).maybeSingle();
                        const curPhotos = normalizeImages(cur?.photos || []);
                        const curImages = normalizeImages(cur?.images || []);
                        const newPhotos = normalizeImages(rawPhotos);
                        const combined = [...new Set([...curPhotos, ...curImages, ...newPhotos])];
                        payload.photos = combined;
                        payload.images = combined;
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

                if (cleanUrl.includes('submit')) {
                    await notifyAdminsOfUserSubmission({
                        title: `🏡 Accommodation Submitted for Review: ${data?.title || 'Listing'}`,
                        message: `Host (${data?.email || data?.phone || 'Host'}) submitted space "${data?.title || 'Accommodation'}" in ${data?.city || data?.country || 'NextKinLife'} for admin review.`,
                        type: NOTIFICATION_TYPES.PROPERTY_SUBMITTED,
                        entityType: 'property',
                        entityId: data?.id,
                        actionUrl: `/admin/properties`,
                        link: `/admin/properties`,
                        userId: data?.host_id || data?.user_id,
                        userEmail: data?.email,
                        userName: data?.host_name || data?.hostName,
                        metadata: data
                    });
                }

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
            } else {
                // Accommodations requirement: show approved listings and initially pending/unverified listings (exclude rejected)
                query = query.neq('status', 'rejected')
            }

            const propCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName;
            if (propCountryParam && propCountryParam.toLowerCase() !== 'all' && propCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(propCountryParam);
                const countryObj = getCountryByName(propCountryParam) || getCountryByCode(propCountryParam);
                const isoCode = countryObj?.code || '';
                if (norm === 'United States of America' || propCountryParam.toLowerCase() === 'usa' || propCountryParam.toLowerCase() === 'us' || propCountryParam.toLowerCase() === 'united states') {
                    query = query.in('country', ['United States of America', 'United States', 'USA', 'US']);
                } else {
                    const filters = [`country.ilike.%${propCountryParam}%`, `country.ilike.%${norm}%`];
                    if (isoCode) filters.push(`country.ilike.%${isoCode}%`);
                    query = query.or(filters.join(','));
                }
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichPropertiesWithHostDetails(data || [])
            return { data: { properties: enriched, total: enriched.length } }
        }
}
