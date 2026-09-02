import { supabase } from '@/lib/supabaseClient';
import { TRAVEL_TRIP_COLUMNS, sanitizePayload, resilientInsert } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { enrichTravelWithHostDetails } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { normalizeCountryName } from '@/shared/utils/countryUtils';

import { createInAppAndEmailNotification } from '../notificationUtils';

export async function handleTravelRoute({ cleanUrl, method, body, queryParams }) {
        // ── 4. TRAVEL / TRIPS ───────────────────────────────────────
        if (cleanUrl.startsWith('travel') || cleanUrl.startsWith('trips') || cleanUrl.startsWith('admin/travel') || cleanUrl.startsWith('admin/trips') || cleanUrl.startsWith('admin/pending/pending-travel') || cleanUrl.startsWith('admin/approved/approved-travel') || cleanUrl.startsWith('admin/rejected/rejected-travel')) {
            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('travel_trips').update({ status: 'approved' }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id || data.host_id,
                        userEmail: data.email || data.contact_email,
                        title: '🎉 Travel Plan Approved!',
                        message: `Your travel plan "${data.title || data.destination || 'Trip'}" has been approved by NextKinLife admin and is now live!`,
                        type: 'approval',
                        link: `/travel`
                    });
                }
                return { data: { success: true, trip: data, message: 'Trip approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('travel_trips').update({ status: 'rejected' }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.user_id || data.host_id,
                        userEmail: data.email || data.contact_email,
                        title: '⚠️ Travel Plan Update',
                        message: `Your travel plan "${data.title || data.destination || 'Trip'}" requires revisions according to community guidelines.`,
                        type: 'rejection',
                        link: `/account-v2?tab=trips`
                    });
                }
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

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error
            const enriched = await enrichTravelWithHostDetails(data || [])

            const travelCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName;
            let filteredTrips = enriched;
            if (travelCountryParam && travelCountryParam.toLowerCase() !== 'all' && travelCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(travelCountryParam).toLowerCase();
                const rawParam = travelCountryParam.toLowerCase();
                filteredTrips = enriched.filter(t => {
                    const fromC = (t.from_country || t.fromCountry || t.origin || '').toLowerCase();
                    const toC = (t.to_country || t.toCountry || t.destination || '').toLowerCase();
                    return fromC.includes(norm) || fromC.includes(rawParam) || toC.includes(norm) || toC.includes(rawParam);
                });
            }

            return {
                data: {
                    results: filteredTrips,
                    trips: filteredTrips,
                    data: filteredTrips,
                    total: filteredTrips.length,
                    count: filteredTrips.length,
                    success: true
                }
            }
        }
}
