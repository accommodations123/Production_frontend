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
        const userObj = await getCurrentUserObject();
        let userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId();
        
        if (!userId && typeof window !== 'undefined') {
            try {
                const rawUser = localStorage.getItem('user');
                if (rawUser) {
                    const parsed = JSON.parse(rawUser);
                    userId = parsed?.id || parsed?.user?.id || parsed?._id;
                }
            } catch {}
        }

        // Fetch genuine profile street_address JSON directly from Supabase DB
        let profileMeta = {};
        if (userId && supabase) {
            try {
                const { data: dbProfile } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                if (dbProfile?.street_address && typeof dbProfile.street_address === 'string' && (dbProfile.street_address.startsWith('{') || dbProfile.street_address.startsWith('['))) {
                    profileMeta = JSON.parse(dbProfile.street_address);
                }
            } catch (e) {
                console.warn('Failed to fetch profile street_address:', e);
            }
        }
        if ((!profileMeta.wishlist || !Array.isArray(profileMeta.wishlist)) && userObj?.street_address && typeof userObj.street_address === 'string' && (userObj.street_address.startsWith('{') || userObj.street_address.startsWith('['))) {
            try {
                profileMeta = JSON.parse(userObj.street_address);
            } catch {}
        }

        const normalizeItemType = (t) => {
            const clean = (t || '').toLowerCase().replace(/[-_\s]/g, '');
            if (clean === 'buysell' || clean === 'marketplace' || clean === 'product' || clean === 'buyselllistings') return 'buysell';
            if (clean === 'property' || clean === 'stay' || clean === 'stays' || clean === 'accommodations') return 'property';
            if (clean === 'stayrequest' || clean === 'stayrequests') return 'stay-request';
            if (clean === 'event' || clean === 'events') return 'event';
            if (clean === 'trip' || clean === 'travel' || clean === 'traveltrip' || clean === 'trips') return 'trip';
            if (clean === 'expert' || clean === 'people' || clean === 'profile' || clean === 'professional' || clean === 'experts') return 'expert';
            return clean;
        };

        const remoteList = Array.isArray(profileMeta.wishlist) ? profileMeta.wishlist : [];
        const localList = userId ? getLocalWishlist(userId) : [];
        const guestList = getLocalWishlist('guest');

        // Deduplicate items across remote and local lists using composite key (type + id)
        const wishlistMap = new Map();
        const candidateItems = [
            ...(Array.isArray(guestList) ? guestList : []),
            ...(Array.isArray(localList) ? localList : []),
            ...remoteList
        ];

        for (const item of candidateItems) {
            const itemIdStr = String(item.id || item.item_id || '').trim();
            if (itemIdStr) {
                const itemType = normalizeItemType(item.type || item.itemType || 'property');
                const mapKey = `${itemType}_${itemIdStr}`;
                wishlistMap.set(mapKey, {
                    ...item,
                    id: itemIdStr,
                    item_id: itemIdStr,
                    type: itemType,
                    created_at: item.created_at || new Date().toISOString()
                });
            }
        }
        let userWishlist = Array.from(wishlistMap.values());

        // 1. Check status: wishlist/check/:type/:id or wishlist/check
        if (cleanUrl.startsWith('wishlist/check')) {
            const parts = cleanUrl.split('/');
            const typeParam = parts[2] || queryParams.type;
            const idParam = String(parts[3] || queryParams.id || queryParams.itemId || '').trim();
            const targetNorm = normalizeItemType(typeParam);
            const isSaved = userWishlist.some(i => {
                const idMatches = (String(i.id) === idParam || String(i.item_id) === idParam);
                if (!idMatches) return false;
                if (!targetNorm) return true;
                return normalizeItemType(i.type) === targetNorm;
            });
            return { data: { isWishlisted: Boolean(isSaved), is_wishlisted: Boolean(isSaved), isSaved: Boolean(isSaved), saved: Boolean(isSaved), success: true } };
        }

        // 2. Toggle status: wishlist/toggle (POST)
        if (cleanUrl.includes('toggle') && method === 'POST') {
            const targetId = String(body?.id || body?.itemId || body?.item_id || '').trim();
            const targetType = normalizeItemType(body?.type || body?.itemType || 'property');
            
            if (!targetId) {
                return { data: { success: false, isWishlisted: false } };
            }

            const existsIndex = userWishlist.findIndex(i => {
                const idMatches = (String(i.id) === targetId || String(i.item_id) === targetId);
                if (!idMatches) return false;
                if (!targetType) return true;
                return normalizeItemType(i.type) === targetType;
            });

            let newSavedState = false;
            
            if (existsIndex >= 0) {
                userWishlist.splice(existsIndex, 1);
                newSavedState = false;
            } else {
                userWishlist.push({
                    id: targetId,
                    item_id: targetId,
                    type: targetType,
                    created_at: new Date().toISOString()
                });
                newSavedState = true;
            }

            profileMeta.wishlist = userWishlist;
            setLocalWishlist('guest', userWishlist);
            if (userId) {
                setLocalWishlist(userId, userWishlist);
                if (supabase) {
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId);
                }
            }

            return { data: { success: true, isWishlisted: newSavedState, is_wishlisted: newSavedState, isSaved: newSavedState, saved: newSavedState } };
        }

        // 3. Add to wishlist: wishlist/add (POST)
        if (cleanUrl.includes('add') && method === 'POST') {
            const targetId = String(body?.id || body?.itemId || body?.item_id || '').trim();
            const targetType = normalizeItemType(body?.type || body?.itemType || 'property');
            if (targetId && !userWishlist.some(i => (String(i.id) === targetId || String(i.item_id) === targetId) && normalizeItemType(i.type) === targetType)) {
                userWishlist.push({
                    id: targetId,
                    item_id: targetId,
                    type: targetType,
                    created_at: new Date().toISOString()
                });
                profileMeta.wishlist = userWishlist;
                setLocalWishlist('guest', userWishlist);
                if (userId) {
                    setLocalWishlist(userId, userWishlist);
                    if (supabase) {
                        await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId);
                    }
                }
            }
            return { data: { success: true, isWishlisted: true, is_wishlisted: true } };
        }

        // 4. Remove from wishlist: wishlist/:type/:id or DELETE
        if (method === 'DELETE' || (cleanUrl.startsWith('wishlist/') && !['wishlist', 'wishlist/all'].includes(cleanUrl))) {
            const parts = cleanUrl.split('/');
            const targetId = String(body?.id || body?.itemId || body?.item_id || (parts.length > 2 ? parts[parts.length - 1] : (parts[1] !== 'remove' ? parts[1] : '')) || '').trim();
            const typeParam = body?.type || body?.itemType || (parts.length > 2 ? parts[1] : null);
            const targetNorm = typeParam ? normalizeItemType(typeParam) : null;
            userWishlist = userWishlist.filter(i => {
                const idMatch = (String(i.id) === targetId || String(i.item_id) === targetId);
                if (!idMatch) return true;
                if (targetNorm && normalizeItemType(i.type) !== targetNorm) return true;
                return false;
            });
            profileMeta.wishlist = userWishlist;
            setLocalWishlist('guest', userWishlist);
            if (userId) {
                setLocalWishlist(userId, userWishlist);
                if (supabase) {
                    await supabase.from('profiles').update({ street_address: JSON.stringify(profileMeta) }).eq('id', userId);
                }
            }
            return { data: { success: true, isWishlisted: false, is_wishlisted: false } };
        }

        // 5. Get Wishlist List (GET wishlist)
        const targetNormalizedType = normalizeItemType(queryParams.type);
        let filteredList = targetNormalizedType && targetNormalizedType !== 'all' 
            ? userWishlist.filter(i => normalizeItemType(i.type) === targetNormalizedType) 
            : userWishlist;

        // Enrich items with real details from DB
        const enrichedList = await Promise.all(filteredList.map(async (wItem) => {
            let t = normalizeItemType(wItem.type);
            let details = null;
            try {
                if (t === 'property') {
                    const { data } = await supabase.from('properties').select('*').eq('id', wItem.id).maybeSingle();
                    details = data ? (await enrichPropertiesWithHostDetails(data)) : null;
                } else if (t === 'event') {
                    const { data } = await supabase.from('events').select('*').eq('id', wItem.id).maybeSingle();
                    details = data ? (await enrichEventsWithHostDetails(data)) : null;
                } else if (t === 'buysell') {
                    const { data } = await supabase.from('buy_sell').select('*').eq('id', wItem.id).maybeSingle();
                    details = data ? (await enrichBuySellWithHostDetails(data)) : null;
                } else if (t === 'trip') {
                    const { data } = await supabase.from('travel_trips').select('*').eq('id', wItem.id).maybeSingle();
                    const trEnriched = data ? (await enrichTravelWithHostDetails(data)) : null;
                    details = Array.isArray(trEnriched) ? (trEnriched[0] || null) : trEnriched;
                } else if (t === 'stay-request') {
                    const { data } = await supabase.from('stay_requests').select('*').eq('id', wItem.id).maybeSingle();
                    const srEnriched = data ? (await enrichStayRequests(data)) : null;
                    details = Array.isArray(srEnriched) ? (srEnriched[0] || null) : srEnriched;
                } else if (t === 'expert') {
                    let { data } = await supabase.from('profiles').select('*').eq('id', wItem.id).maybeSingle();
                    if (!data) {
                        const { data: byUser } = await supabase.from('profiles').select('*').eq('user_id', wItem.id).maybeSingle();
                        data = byUser;
                    }
                    details = data ? formatPersonProfile(data) : null;
                }

                // Section fallback: auto-detect across tables if details not found with stored type
                if (!details) {
                    try {
                        if (t !== 'property') {
                            const { data: pData } = await supabase.from('properties').select('*').eq('id', wItem.id).maybeSingle();
                            if (pData) { details = await enrichPropertiesWithHostDetails(pData); t = 'property'; }
                        }
                        if (!details && t !== 'event') {
                            const { data: eData } = await supabase.from('events').select('*').eq('id', wItem.id).maybeSingle();
                            if (eData) { details = await enrichEventsWithHostDetails(eData); t = 'event'; }
                        }
                        if (!details && t !== 'buysell') {
                            const { data: bData } = await supabase.from('buy_sell').select('*').eq('id', wItem.id).maybeSingle();
                            if (bData) { details = await enrichBuySellWithHostDetails(bData); t = 'buysell'; }
                        }
                        if (!details && t !== 'trip') {
                            const { data: trData } = await supabase.from('travel_trips').select('*').eq('id', wItem.id).maybeSingle();
                            if (trData) {
                                const trEnriched = await enrichTravelWithHostDetails(trData);
                                details = Array.isArray(trEnriched) ? (trEnriched[0] || null) : trEnriched;
                                if (details) t = 'trip';
                            }
                        }
                        if (!details && t !== 'stay-request') {
                            const { data: srData } = await supabase.from('stay_requests').select('*').eq('id', wItem.id).maybeSingle();
                            if (srData) {
                                const srEnriched = await enrichStayRequests(srData);
                                details = Array.isArray(srEnriched) ? (srEnriched[0] || null) : srEnriched;
                                if (details) t = 'stay-request';
                            }
                        }
                    } catch {}
                }
            } catch (enrichErr) {
                console.warn(`Error enriching wishlist item [${t}] ${wItem.id}:`, enrichErr);
            }

            // Ensure details is an object and never an array
            if (Array.isArray(details)) {
                details = details[0] || null;
            }

            if (details && typeof details === 'object') {
                if (!details.id) details.id = wItem.id;
                if (!details._id) details._id = details.id;
            }

            const safeDetails = details || {
                id: wItem.id,
                _id: wItem.id,
                title: wItem.title || (t === 'trip' ? 'Travel Plan' : (t === 'stay-request' ? 'Stay Request' : 'Saved Item')),
                seekerName: wItem.title || 'Stay Seeker',
                name: wItem.title || 'Stay Seeker',
                photos: [],
                images: [],
                status: 'approved'
            };

            return {
                ...wItem,
                id: wItem.id,
                item_id: wItem.id,
                type: t,
                details: details || safeDetails
            };
        }));

        return {
            data: {
                wishlist: enrichedList,
                items: enrichedList,
                total: enrichedList.length,
                count: enrichedList.length,
                success: true
            }
        };
    }
    return undefined;
}
