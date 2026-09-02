import { supabase } from '@/lib/supabaseClient';
import { normalizeImages, resolveImageUrl } from '@/lib/imageUtils';

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

        const cleanPhotos = normalizeImages(item.photos || item.images || (item.photo ? [item.photo] : []))
        const cleanBanner = resolveImageUrl(item.banner_image || item.banner || (Array.isArray(item.images) ? item.images[0] : null) || item.image || null)
        const cleanEventImages = normalizeImages(item.images || (cleanBanner ? [cleanBanner] : []))
        const cleanBuySellImages = normalizeImages(item.images || item.photos || (item.image ? [item.image] : []))

        return {
            ...item,
            photos: cleanPhotos.length > 0 ? cleanPhotos : (item.photos || []),
            images: cleanEventImages.length > 0 ? cleanEventImages : (cleanBuySellImages.length > 0 ? cleanBuySellImages : (item.images || [])),
            banner_image: cleanBanner || item.banner_image || null,
            image: cleanBanner || cleanPhotos[0] || cleanBuySellImages[0] || item.image || null,
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

        const fromCity = meta.from_city || (rawOrigin ? rawOrigin.split(',')[0].trim() : (host.city || ''));
        const fromCountry = meta.from_country || (rawOrigin.includes(',') ? rawOrigin.split(',')[1].trim() : (host.country || ''));
        
        const toCity = meta.to_city || (rawDest ? rawDest.split(',')[0].trim() : '');
        const toCountry = meta.to_country || (rawDest.includes(',') ? rawDest.split(',')[1].trim() : '');

        const travelDate = trip.travel_date || meta.departure_date || trip.created_at || '';
        const departureTime = trip.departure_time || meta.departure_time || '10:00 AM';
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
            age: meta.age || host.age || '',
            languages: meta.languages || host.languages || ['English']
        };

        return {
            ...trip,
            id: trip.id,
            host_id: trip.host_id,
            user_id: trip.host_id,
            host_name: hostFullName,
            title: (fromCity && toCity) ? `${fromCity} to ${toCity}` : (trip.title || 'Travel Partner Trip'),
            origin: fromCountry ? (fromCity ? `${fromCity}, ${fromCountry}` : fromCountry) : fromCity,
            destination: toCountry ? (toCity ? `${toCity}, ${toCountry}` : toCountry) : toCity,
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

    const isExpert = Boolean(p.role === 'expert' || p.is_expert === true || p.is_advisor === true || p.expert_status || (p.category && p.bio));
    const fullName = p.full_name || p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || (isExpert ? 'Expert Advisor' : 'User');
    const profession = p.profession || p.headline || p.occupation || (isExpert ? 'Advisor' : '');
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

    const reviews = Array.isArray(meta.reviews) ? meta.reviews : [];
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
        ? Number((reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviewCount).toFixed(1))
        : 0;

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
            rating: avgRating,
            review_count: reviewCount,
            followers_count: Array.isArray(meta.followers) ? meta.followers.length : 0
        },
        rating: avgRating,
        review_count: reviewCount,
        reviews: reviews,
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

export function formatUserProfile(p) {
    if (!p) return null;
    let cleanAddress = p.address || p.street_address || "";
    let meta = {};
    if (typeof cleanAddress === 'string' && (cleanAddress.trim().startsWith('{') || cleanAddress.trim().startsWith('['))) {
        try {
            meta = JSON.parse(cleanAddress);
            cleanAddress = meta.address || meta.street_address || "";
        } catch {
            cleanAddress = "";
        }
    }
    return {
        ...p,
        name: p.full_name || p.name || p.displayName,
        full_name: p.full_name || p.name || p.displayName,
        address: cleanAddress,
        street_address: cleanAddress
    };
}


export async function enrichStayRequests(requests) {
    if (!requests) return [];
    const list = Array.isArray(requests) ? requests : [requests];
    const baseEnriched = await enrichWithProfiles(list.filter(Boolean), 'user_id');
    return baseEnriched.map(item => {
        let meta = {};
        if (item.title && typeof item.title === 'string' && item.title.startsWith('{')) {
            try {
                meta = JSON.parse(item.title);
            } catch {}
        }
        const resolvedTitle = meta.displayTitle || (item.title && !item.title.startsWith('{') ? item.title : 'Looking for Accommodation');
        return {
            ...item,
            title: resolvedTitle,
            seekerName: meta.seekerName || item.user_name || item.Host?.full_name || item.host?.full_name || item.name || 'Stay Seeker',
            state: meta.state || item.state || '',
            stayType: meta.stayType || item.stay_type || 'Long Term',
            furnishing: meta.furnishing || item.furnishing || 'Furnished',
            whatsappNumber: meta.whatsappNumber || item.whatsapp || item.phone || '',
            whatsapp: meta.whatsappNumber || item.whatsapp || item.phone || '',
            linkedin: meta.linkedin || item.linkedin || '',
            instagram: meta.instagram || item.instagram || '',
            facebook: meta.facebook || item.facebook || ''
        };
    });
}
