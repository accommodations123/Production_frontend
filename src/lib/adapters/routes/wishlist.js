import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { getLocalWishlist, setLocalWishlist } from '../storageUtils';
import {
    enrichPropertiesWithHostDetails,
    enrichEventsWithHostDetails,
    enrichBuySellWithHostDetails,
    enrichTravelWithHostDetails,
    enrichStayRequests,
    formatPersonProfile
} from '../enrichmentUtils';

export async function handleWishlistRoute({ cleanUrl, method, body, queryParams }) {
        // ── 8. WISHLIST ─────────────────────────────────────────────
        if (cleanUrl.startsWith('wishlist')) {
            const userObj = await getCurrentUserObject()
            let userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
            
            if (!userId && typeof window !== 'undefined') {
                try {
                    const rawUser = localStorage.getItem('user')
                    if (rawUser) {
                        const parsed = JSON.parse(rawUser)
                        userId = parsed?.id || parsed?.user?.id || parsed?._id
                    }
                } catch {}
            }

            // Always fetch genuine profile street_address JSON directly from Supabase DB to guarantee real wishlist metadata
            let profileMeta = {}
            if (userId) {
                try {
                    const { data: dbProfile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle()
                    if (dbProfile?.street_address && typeof dbProfile.street_address === 'string' && (dbProfile.street_address.startsWith('{') || dbProfile.street_address.startsWith('['))) {
                        profileMeta = JSON.parse(dbProfile.street_address)
                    }
                } catch (e) {
                    console.warn('Failed to fetch profile street_address:', e)
                }
            }
            if ((!profileMeta.wishlist || !Array.isArray(profileMeta.wishlist)) && userObj?.street_address && typeof userObj.street_address === 'string' && (userObj.street_address.startsWith('{') || userObj.street_address.startsWith('['))) {
                try {
                    profileMeta = JSON.parse(userObj.street_address)
                } catch {}
            }

            const localList = userId ? getLocalWishlist(userId) : []
            const guestList = getLocalWishlist('guest')
            const remoteList = Array.isArray(profileMeta.wishlist) ? profileMeta.wishlist : []

            // Deduplicate items across remote and local lists
            const wishlistMap = new Map()
            for (const item of [...(Array.isArray(guestList) ? guestList : []), ...(Array.isArray(localList) ? localList : []), ...remoteList]) {
                const itemIdStr = String(item.id || item.item_id || '')
                if (itemIdStr) {
                    wishlistMap.set(itemIdStr, {
                        ...item,
                        id: itemIdStr,
                        item_id: itemIdStr,
                        type: item.type || 'property'
                    })
                }
            }
            let userWishlist = Array.from(wishlistMap.values())

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
                    (!targetNorm || !i.type || normalizeItemType(i.type) === targetNorm || String(i.id) === String(idParam))
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
                    String(i.id) === String(targetId) || String(i.item_id) === String(targetId)
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
                setLocalWishlist('guest', userWishlist)
                if (userId) {
                    setLocalWishlist(userId, userWishlist)
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)
                }

                return { data: { success: true, isWishlisted: newSavedState, is_wishlisted: newSavedState, isSaved: newSavedState, saved: newSavedState } }
            }

            // 3. Add to wishlist: wishlist/add (POST)
            if (cleanUrl.includes('add') && method === 'POST') {
                const targetId = body?.id || body?.itemId || body?.item_id
                const targetType = normalizeItemType(body?.type || body?.itemType || 'property')
                if (targetId && !userWishlist.some(i => String(i.id) === String(targetId) || String(i.item_id) === String(targetId))) {
                    userWishlist.push({
                        id: targetId,
                        item_id: targetId,
                        type: targetType,
                        created_at: new Date().toISOString()
                    })
                    profileMeta.wishlist = userWishlist
                    setLocalWishlist('guest', userWishlist)
                    if (userId) {
                        setLocalWishlist(userId, userWishlist)
                        await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)
                    }
                }
                return { data: { success: true, isWishlisted: true, is_wishlisted: true } }
            }

            // 4. Remove from wishlist: wishlist/:type/:id or DELETE
            if (method === 'DELETE' || (cleanUrl.startsWith('wishlist/') && !['wishlist', 'wishlist/all'].includes(cleanUrl))) {
                const parts = cleanUrl.split('/')
                const targetId = parts.length > 2 ? parts[parts.length - 1] : parts[1]
                userWishlist = userWishlist.filter(i => {
                    const idMatch = String(i.id) === String(targetId) || String(i.item_id) === String(targetId)
                    return !idMatch
                })
                profileMeta.wishlist = userWishlist
                setLocalWishlist('guest', userWishlist)
                if (userId) {
                    setLocalWishlist(userId, userWishlist)
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId)
                }
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
                    } else if (t === 'stay-request') {
                        const { data } = await supabase.from('stay_requests').select('*').eq('id', wItem.id).maybeSingle()
                        details = data ? (await enrichStayRequests(data)) : null
                    } else if (t === 'expert') {
                        let { data } = await supabase.from('profiles').select('*').eq('id', wItem.id).maybeSingle()
                        if (!data) {
                            const { data: byUser } = await supabase.from('profiles').select('*').eq('user_id', wItem.id).maybeSingle()
                            data = byUser
                        }
                        details = data ? formatPersonProfile(data) : null
                    }
                } catch (enrichErr) {
                    console.warn(`Error enriching wishlist item [${t}] ${wItem.id}:`, enrichErr)
                }

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
