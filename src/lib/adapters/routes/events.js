import { supabase } from '@/lib/supabaseClient';
import { EVENT_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { enrichEventsWithHostDetails } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { normalizeImages } from '@/lib/imageUtils';
import { normalizeCountryName, getCountryByName, getCountryByCode } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handleEventsRoute({ cleanUrl, method, body, queryParams }) {
        // ── 2. EVENTS ───────────────────────────────────────────────
        if (cleanUrl.startsWith('events') || cleanUrl.startsWith('event') || cleanUrl.startsWith('admin/events') || cleanUrl.startsWith('admin/pending/pending-events') || cleanUrl.startsWith('admin/approved/approved-events') || cleanUrl.startsWith('admin/rejected/rejected-events')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('events').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.organizer_id || data.user_id || data.host_id,
                        recipientId: data.organizer_id || data.user_id || data.host_id,
                        userEmail: data.organizer_email || data.email,
                        title: '🎉 Event Approved!',
                        message: `Your event "${data.title || 'Event'}" has been approved by NextKinLife admin and is now live!`,
                        type: NOTIFICATION_TYPES.EVENT_APPROVED,
                        entityType: 'event',
                        entityId: data.id || id,
                        actionUrl: `/events/${data.id || id}`,
                        link: `/events/${data.id || id}`,
                        metadata: data
                    });
                }
                return { data: { success: true, event: data, message: 'Event approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('events').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.organizer_id || data.user_id || data.host_id,
                        recipientId: data.organizer_id || data.user_id || data.host_id,
                        userEmail: data.organizer_email || data.email,
                        title: '⚠️ Event Status Update',
                        message: `Your event "${data.title || 'Event'}" requires revisions according to community guidelines.`,
                        type: NOTIFICATION_TYPES.EVENT_REJECTED,
                        entityType: 'event',
                        entityId: data.id || id,
                        actionUrl: `/account-v2?tab=events`,
                        link: `/account-v2?tab=events`,
                        metadata: data
                    });
                }
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
                    q = q.ilike('organizer_email', `%${userEmail.trim()}%`)
                }
                const { data } = await q
                const enriched = await enrichEventsWithHostDetails(data || [])
                return { data: { events: enriched, data: enriched } }
            }
            if (cleanUrl.endsWith('/join') && method === 'POST') {
                const parts = cleanUrl.split('/')
                const id = parts[1] === 'join' ? parts[0] : parts[1]
                const userId = await getCurrentUserId()
                const { data: cur } = await supabase.from('events').select('attendees_count').eq('id', id).maybeSingle()
                await supabase.from('events').update({ attendees_count: (cur?.attendees_count || 0) + 1 }).eq('id', id)

                if (userId) {
                    try {
                        const { data: prof } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle()
                        let meta = {}
                        try { meta = JSON.parse(prof?.street_address || '{}') } catch {}
                        meta.event_registrations = Array.isArray(meta.event_registrations) ? meta.event_registrations : []
                        if (!meta.event_registrations.includes(String(id))) {
                            meta.event_registrations.push(String(id))
                        }
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId)
                    } catch (e) {
                        console.warn('Error saving event registration metadata:', e)
                    }
                }

                return { data: { success: true, is_registered: true } }
            }
            if (cleanUrl.endsWith('/leave') && method === 'POST') {
                const parts = cleanUrl.split('/')
                const id = parts[1] === 'leave' ? parts[0] : parts[1]
                const userId = await getCurrentUserId()
                const { data: cur } = await supabase.from('events').select('attendees_count').eq('id', id).maybeSingle()
                await supabase.from('events').update({ attendees_count: Math.max(0, (cur?.attendees_count || 1) - 1) }).eq('id', id)

                if (userId) {
                    try {
                        const { data: prof } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle()
                        let meta = {}
                        try { meta = JSON.parse(prof?.street_address || '{}') } catch {}
                        meta.event_registrations = Array.isArray(meta.event_registrations) ? meta.event_registrations : []
                        meta.event_registrations = meta.event_registrations.filter(eventId => String(eventId) !== String(id))
                        await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', userId)
                    } catch (e) {
                        console.warn('Error updating event leave metadata:', e)
                    }
                }

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
                
                const allImgs = normalizeImages([
                    ...(Array.isArray(payload.galleryImages) ? payload.galleryImages : (payload.galleryImages ? [payload.galleryImages] : [])),
                    ...(Array.isArray(payload.images) ? payload.images : (payload.images ? [payload.images] : [])),
                    ...(Array.isArray(payload.existingImages) ? payload.existingImages : (payload.existingImages ? [payload.existingImages] : [])),
                    payload.banner_image, payload.bannerImage, payload.banner
                ].filter(Boolean));

                payload.banner_image = allImgs[0] || payload.banner_image || null;
                payload.images = allImgs;
                payload.status = payload.status || 'pending'
                payload.is_approved = false

                const clean = sanitizePayload(payload, EVENT_COLUMNS)
                const { data, error } = await supabase.from('events').insert(clean).select().maybeSingle()
                if (error) throw error

                await notifyAdminsOfUserSubmission({
                    title: `📅 New Community Event: ${data?.title || payload.title || 'Event'}`,
                    message: `${payload.organizer_name || 'Organizer'} (${payload.organizer_email || 'N/A'}) created event "${data?.title || payload.title}" in ${data?.city || data?.country || 'Community'} for ${data?.start_date || 'upcoming'}.`,
                    type: NOTIFICATION_TYPES.EVENT_SUBMITTED,
                    entityType: 'event',
                    entityId: data?.id,
                    actionUrl: `/admin/events`,
                    link: `/admin/events`,
                    userId: userObj?.id || userObj?._id,
                    userEmail: payload.organizer_email,
                    userName: payload.organizer_name,
                    metadata: data
                });

                return { data: { event: data, id: data?.id, success: true } }
            }
            if (cleanUrl.startsWith('events/media/')) {
                const id = cleanUrl.split('/').pop()
                const uploaded = body instanceof FormData ? await parseFormDataWithUploads(body, 'events') : { ...(body || {}) }
                
                const allImgs = normalizeImages([
                    ...(Array.isArray(uploaded.galleryImages) ? uploaded.galleryImages : (uploaded.galleryImages ? [uploaded.galleryImages] : [])),
                    ...(Array.isArray(uploaded.images) ? uploaded.images : (uploaded.images ? [uploaded.images] : [])),
                    uploaded.bannerImage,
                    uploaded.banner_image,
                    uploaded.banner
                ].filter(Boolean));

                const updatePayload = {};
                if (uploaded.bannerImage || uploaded.banner_image || uploaded.banner) {
                    updatePayload.banner_image = uploaded.bannerImage || uploaded.banner_image || uploaded.banner || allImgs[0] || null;
                }
                if (allImgs.length > 0) {
                    const { data: existEv } = await supabase.from('events').select('images,banner_image').eq('id', id).maybeSingle();
                    const existingList = Array.isArray(existEv?.images) ? existEv.images : [];
                    const mergedImages = Array.from(new Set([...existingList, ...allImgs]));
                    updatePayload.images = mergedImages;
                    if (!updatePayload.banner_image && !existEv?.banner_image) {
                        updatePayload.banner_image = mergedImages[0] || null;
                    }
                }

                if (id && Object.keys(updatePayload).length > 0) {
                    await supabase.from('events').update(sanitizePayload(updatePayload, EVENT_COLUMNS)).eq('id', id);
                }
                return { data: { success: true, ...uploaded, ...updatePayload } }
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
                const eventId = eventSingleMatch[1]
                const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle()
                const userId = await getCurrentUserId()
                let isRegistered = false
                if (userId) {
                    try {
                        const { data: prof } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle()
                        let meta = {}
                        try { meta = JSON.parse(prof?.street_address || '{}') } catch {}
                        const regs = Array.isArray(meta.event_registrations) ? meta.event_registrations : []
                        isRegistered = regs.includes(String(eventId))
                    } catch (e) {
                        console.warn('Error checking event registration status:', e)
                    }
                }
                const enriched = await enrichEventsWithHostDetails(data)
                return { data: { event: enriched, is_registered: isRegistered } }
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

            const countryParam = queryParams.country || queryParams.country_name || queryParams.name || queryParams.code;
            const codeParam = queryParams.code || queryParams.country_code;
            if (countryParam && countryParam.toLowerCase() !== 'all' && countryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(countryParam);
                const countryObj = getCountryByName(countryParam) || getCountryByCode(countryParam) || (codeParam ? getCountryByCode(codeParam) : null);
                const isoCode = (countryObj?.code || codeParam || (countryParam.length === 2 ? countryParam : '')).toUpperCase();
                const countryName = countryObj?.name || norm || countryParam;

                if (norm === 'United States of America' || countryParam.toLowerCase() === 'usa' || countryParam.toLowerCase() === 'us' || countryParam.toLowerCase() === 'united states' || isoCode === 'US') {
                    query = query.or(`country.in.("United States of America","United States","USA","US"),country.eq.US,event_mode.ilike.%online%`);
                } else {
                    const filters = [
                        `country.ilike.%${countryParam}%`,
                        `country.ilike.%${countryName}%`,
                        `event_mode.ilike.%online%`
                    ];
                    if (isoCode) {
                        filters.push(`country.eq.${isoCode}`);
                        filters.push(`country.ilike.%${isoCode}%`);
                    }
                    query = query.or(filters.join(','));
                }
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichEventsWithHostDetails(data || [])
            return { data: { events: enriched, total: enriched.length } }
        }
}
