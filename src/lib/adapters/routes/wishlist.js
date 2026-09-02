import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { getLocalWishlist, setLocalWishlist } from '../storageUtils';
import {
    enrichPropertiesWithHostDetails,
    enrichEventsWithHostDetails,
    enrichBuySellWithHostDetails,
    enrichTravelWithHostDetails
} from '../enrichmentUtils';

export async function handleWishlistRoute({ cleanUrl, method, body, queryParams }) {
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
}
