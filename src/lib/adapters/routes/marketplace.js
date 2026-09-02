import { supabase } from '@/lib/supabaseClient';
import { BUY_SELL_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { enrichBuySellWithHostDetails } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { normalizeImages } from '@/lib/imageUtils';
import { normalizeCountryName } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handleMarketplaceRoute({ cleanUrl, method, body, queryParams }) {
        // ── 3. BUY & SELL / MARKETPLACE ─────────────────────────────
        if (cleanUrl.startsWith('buy-sell') || cleanUrl.startsWith('marketplace') || cleanUrl.startsWith('admin/buysell') || cleanUrl.startsWith('admin/buy-sell')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('buy_sell').update({ status: 'approved', is_approved: true }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id || data.seller_id,
                        recipientId: data.user_id || data.seller_id,
                        userEmail: data.email || data.seller_email,
                        title: '🎉 Marketplace Item Approved!',
                        message: `Your marketplace listing "${data.title || 'Product'}" has been approved by NextKinLife admin and is now live!`,
                        type: NOTIFICATION_TYPES.BUY_SELL_APPROVED,
                        entityType: 'buy_sell',
                        entityId: data.id || id,
                        actionUrl: `/marketplace`,
                        link: `/marketplace`,
                        metadata: data
                    });
                }
                return { data: { success: true, listing: data } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('buy_sell').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id || data.seller_id,
                        recipientId: data.user_id || data.seller_id,
                        userEmail: data.email || data.seller_email,
                        title: '⚠️ Marketplace Listing Update',
                        message: `Your marketplace listing "${data.title || 'Product'}" requires revisions according to community guidelines.`,
                        type: NOTIFICATION_TYPES.BUY_SELL_REJECTED,
                        entityType: 'buy_sell',
                        entityId: data.id || id,
                        actionUrl: `/account-v2?tab=buy-sell`,
                        link: `/account-v2?tab=buy-sell`,
                        metadata: data
                    });
                }
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
                const userObj = await getCurrentUserObject()
                const userEmail = userObj?.email || userObj?.user?.email
                const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
                let q = supabase.from('buy_sell').select('*').order('created_at', { ascending: false })
                if (userId && userEmail) {
                    q = q.or(`user_id.eq.${userId},email.ilike.%${userEmail.trim()}%,seller_email.ilike.%${userEmail.trim()}%`)
                } else if (userId) {
                    q = q.eq('user_id', userId)
                } else if (userEmail) {
                    q = q.or(`email.ilike.%${userEmail.trim()}%,seller_email.ilike.%${userEmail.trim()}%`)
                }
                const { data } = await q
                const enriched = await enrichBuySellWithHostDetails(data || [])
                return { data: enriched, listings: enriched }
            }
            if ((cleanUrl.startsWith('buy-sell/create') || cleanUrl === 'buy-sell' || cleanUrl === 'marketplace/create') && method === 'POST') {
                const userId = await getCurrentUserId()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'marketplace') : { ...(body || {}) }
                payload.user_id = userId || payload.user_id || payload.host_id
                payload.title = payload.title || payload.name
                
                const allImgs = normalizeImages([
                    ...(Array.isArray(payload.galleryImages) ? payload.galleryImages : (payload.galleryImages ? [payload.galleryImages] : [])),
                    ...(Array.isArray(payload.images) ? payload.images : (payload.images ? [payload.images] : [])),
                    ...(Array.isArray(payload.photos) ? payload.photos : (payload.photos ? [payload.photos] : [])),
                    ...(Array.isArray(payload.existingImages) ? payload.existingImages : (payload.existingImages ? [payload.existingImages] : []))
                ].filter(Boolean));

                payload.images = allImgs;
                payload.status = payload.status || 'pending'
                const clean = sanitizePayload(payload, BUY_SELL_COLUMNS)
                const { data, error } = await supabase.from('buy_sell').insert(clean).select().maybeSingle()
                if (error) throw error

                await notifyAdminsOfUserSubmission({
                    title: `🛍️ New Marketplace Item: ${data?.title || payload.title || 'Product'}`,
                    message: `User posted "${data?.title || payload.title}" for sale (${data?.currency || 'INR'} ${data?.price || ''}) in ${data?.city || data?.country || 'Community'}.`,
                    type: NOTIFICATION_TYPES.BUY_SELL_SUBMITTED,
                    entityType: 'buy_sell',
                    entityId: data?.id,
                    actionUrl: '/admin/buysell',
                    link: '/admin/buysell',
                    userId: data?.user_id,
                    userEmail: data?.email,
                    metadata: data
                });

                return { data: { listing: data, success: true } }
            }
            if (cleanUrl.startsWith('buy-sell/update/') || (cleanUrl.startsWith('buy-sell/') && (method === 'PUT' || method === 'PATCH') && !cleanUrl.includes('sold'))) {
                const id = cleanUrl.split('/').pop()
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'marketplace') : { ...(body || {}) }
                
                if (payload.galleryImages || payload.existingImages || payload.photos || payload.images) {
                    payload.images = normalizeImages([
                        ...(Array.isArray(payload.galleryImages) ? payload.galleryImages : (payload.galleryImages ? [payload.galleryImages] : [])),
                        ...(Array.isArray(payload.images) ? payload.images : (payload.images ? [payload.images] : [])),
                        ...(Array.isArray(payload.photos) ? payload.photos : (payload.photos ? [payload.photos] : [])),
                        ...(Array.isArray(payload.existingImages) ? payload.existingImages : (payload.existingImages ? [payload.existingImages] : []))
                    ].filter(Boolean));
                }

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

            const buySellCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName;
            if (buySellCountryParam && buySellCountryParam.toLowerCase() !== 'all' && buySellCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(buySellCountryParam);
                if (norm === 'United States of America' || buySellCountryParam.toLowerCase() === 'usa' || buySellCountryParam.toLowerCase() === 'us' || buySellCountryParam.toLowerCase() === 'united states') {
                    query = query.in('country', ['United States of America', 'United States', 'USA', 'US']);
                } else {
                    query = query.or(`country.ilike.%${buySellCountryParam}%,country.ilike.%${norm}%`);
                }
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichBuySellWithHostDetails(data || [])
            return { data: { listings: enriched, total: enriched.length } }
        }
}
