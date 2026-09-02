import { supabase } from '@/lib/supabaseClient';
import { STAY_REQUEST_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { enrichStayRequests } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { normalizeCountryName } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handleStayRequestsRoute({ cleanUrl, method, body, queryParams }) {
        // ── 5. STAY REQUESTS ────────────────────────────────────────
        if (cleanUrl.startsWith('stay-request') || cleanUrl.startsWith('stay-requests') || cleanUrl.startsWith('admin/stay-request') || cleanUrl.startsWith('admin/stay-requests') || cleanUrl.startsWith('admin/pending/pending-stay-request') || cleanUrl.startsWith('admin/approved/approved-stay-request') || cleanUrl.startsWith('admin/rejected/rejected-stay-request')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('stay_requests').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id,
                        recipientId: data.user_id,
                        userEmail: data.email || data.contact_email,
                        title: '🎉 Stay Request Approved!',
                        message: `Your stay request for "${data.location || data.city || 'Accommodation'}" has been approved by NextKinLife admin and is now live!`,
                        type: NOTIFICATION_TYPES.STAY_REQUEST_APPROVED,
                        entityType: 'stay_request',
                        entityId: data.id || id,
                        actionUrl: `/accommodations`,
                        link: `/accommodations`,
                        metadata: data
                    });
                }
                return { data: { success: true, request: data, message: 'Stay request approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('stay_requests').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id,
                        recipientId: data.user_id,
                        userEmail: data.email || data.contact_email,
                        title: '⚠️ Stay Request Update',
                        message: `Your stay request requires revisions according to community guidelines.`,
                        type: NOTIFICATION_TYPES.STAY_REQUEST_REJECTED,
                        entityType: 'stay_request',
                        entityId: data.id || id,
                        actionUrl: `/accommodations`,
                        link: `/accommodations`,
                        metadata: data
                    });
                }
                return { data: { success: true, request: data, message: 'Stay request rejected' } }
            }
            if ((cleanUrl.includes('/delete/') || cleanUrl.endsWith('/delete')) && method === 'DELETE') {
                const id = cleanUrl.split('/').pop()
                await supabase.from('stay_requests').delete().eq('id', id)
                return { data: { success: true } }
            }

            // Create Stay Request (POST)
            if ((cleanUrl === 'stay-request' || cleanUrl === 'stay-requests' || cleanUrl === 'stay-request/create' || cleanUrl === 'stay-requests/create' || cleanUrl === 'stay-request/post') && method === 'POST') {
                const userObj = await getCurrentUserObject()
                const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'stay_requests') : { ...(body || {}) }
                
                const meta = {
                    displayTitle: payload.title || 'Looking for Accommodation',
                    seekerName: payload.seekerName || payload.seeker_name || userObj?.full_name || userObj?.name || 'Stay Seeker',
                    state: payload.state || '',
                    stayType: payload.stayType || payload.stay_type || 'Long Term',
                    furnishing: payload.furnishing || 'Furnished',
                    whatsappNumber: payload.whatsappNumber || payload.whatsapp || payload.phone || '',
                    linkedin: payload.linkedin || '',
                    instagram: payload.instagram || '',
                    facebook: payload.facebook || ''
                };

                const clean = {
                    user_id: userId || payload.user_id || payload.host_id || null,
                    user_name: meta.seekerName,
                    username: userObj?.email?.split('@')[0] || payload.username || '',
                    title: JSON.stringify(meta),
                    description: typeof payload.description === 'string' ? payload.description : '',
                    budget: Number(payload.budget || 0),
                    currency: payload.currency || 'USD',
                    city: payload.city || '',
                    country: payload.country || '',
                    phone: payload.phone || meta.whatsappNumber || '',
                    email: payload.email || userObj?.email || '',
                    status: payload.status || 'pending',
                    is_approved: payload.is_approved !== undefined ? payload.is_approved : false
                };

                const { data, error } = await supabase.from('stay_requests').insert(clean).select().maybeSingle()
                if (error) {
                    console.error('Supabase stay_requests insert error:', error)
                    throw error
                }
                const enriched = await enrichStayRequests(data ? [data] : [])
                const single = enriched[0] || data

                await notifyAdminsOfUserSubmission({
                    title: `🛏️ New Stay Request: ${meta.displayTitle || 'Looking for Accommodation'}`,
                    message: `${meta.seekerName || 'User'} (${clean.email || 'N/A'}) posted a stay request in ${clean.city || clean.country || 'Location'} (Budget: ${clean.currency} ${clean.budget}).`,
                    type: NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED,
                    entityType: 'stay_request',
                    entityId: data?.id,
                    actionUrl: '/admin/stay-requests',
                    link: '/admin/stay-requests',
                    userId: clean.user_id,
                    userEmail: clean.email,
                    userName: meta.seekerName,
                    metadata: single
                });

                return { data: { request: single, data: single, success: true } }
            }

            // My Stay Requests
            if (cleanUrl === 'stay-request/me' || cleanUrl === 'stay-requests/me') {
                const userId = await getCurrentUserId()
                let q = supabase.from('stay_requests').select('*').order('created_at', { ascending: false })
                if (userId) q = q.eq('user_id', userId)
                const { data } = await q
                const enriched = await enrichStayRequests(data || [])
                return { data: { requests: enriched, data: enriched, total: enriched.length } }
            }

            // Single Stay Request by ID
            const singleMatch = cleanUrl.match(/^(?:stay-request|stay-requests)\/(?:request\/)?([^/]+)$/)
            if (singleMatch && method === 'GET' && !['create', 'post', 'search', 'me', 'all', 'approved', 'pending', 'rejected'].includes(singleMatch[1])) {
                const { data } = await supabase.from('stay_requests').select('*').eq('id', singleMatch[1]).maybeSingle()
                const enriched = await enrichStayRequests(data ? [data] : [])
                return { data: { request: enriched[0] || data, data: enriched[0] || data } }
            }

            // List Stay Requests
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

            const stayCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName;
            if (stayCountryParam && stayCountryParam.toLowerCase() !== 'all' && stayCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(stayCountryParam);
                if (norm === 'United States of America' || stayCountryParam.toLowerCase() === 'usa' || stayCountryParam.toLowerCase() === 'us' || stayCountryParam.toLowerCase() === 'united states') {
                    query = query.in('country', ['United States of America', 'United States', 'USA', 'US']);
                } else {
                    query = query.or(`country.ilike.%${stayCountryParam}%,country.ilike.%${norm}%`);
                }
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data } = await query
            const enriched = await enrichStayRequests(data || [])
            return { data: { requests: enriched, data: enriched, total: enriched.length } }
        }
}
