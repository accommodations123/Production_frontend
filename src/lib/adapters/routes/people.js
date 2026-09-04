import { supabase } from '@/lib/supabaseClient';
import { PROFILE_COLUMNS, sanitizePayload } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { formatPersonProfile } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { normalizeCountryName } from '@/shared/utils/countryUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handlePeopleRoute({ cleanUrl, method, body, queryParams }) {
        // ── 7. PEOPLE / EXPERTS / PROFESSIONALS ─────────────────────
        if (cleanUrl === 'people' || cleanUrl.startsWith('people/') || cleanUrl.startsWith('admin/people') || cleanUrl.startsWith('admin/professionals') || cleanUrl.startsWith('admin/pending/pending-people') || cleanUrl.startsWith('admin/approved/approved-people') || cleanUrl.startsWith('admin/rejected/rejected-people')) {
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()

            // Admin Actions (Mutations only)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, is_verified: true, role: 'expert' }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.id,
                        recipientId: data.id,
                        userEmail: data.email,
                        title: '🎉 Advisor Profile Approved & Verified!',
                        message: `Congratulations! Your professional advisor profile has been approved by NextKinLife admin and is now live in the People directory.`,
                        type: NOTIFICATION_TYPES.EXPERT_APPROVED,
                        entityType: 'expert',
                        entityId: data.id || id,
                        actionUrl: `/people/${data.id || id}`,
                        link: `/people/${data.id || id}`,
                        metadata: data
                    });
                }
                return { data: { success: true, profile: data ? formatPersonProfile(data) : null, message: 'Expert approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.id,
                        recipientId: data.id,
                        userEmail: data.email,
                        title: '⚠️ Advisor Profile Update',
                        message: `Your professional advisor profile requires revisions according to community guidelines.`,
                        type: NOTIFICATION_TYPES.EXPERT_REJECTED,
                        entityType: 'expert',
                        entityId: data.id || id,
                        actionUrl: `/people/become`,
                        link: `/people/become`,
                        metadata: data
                    });
                }
                return { data: { success: true, profile: data ? formatPersonProfile(data) : null, message: 'Expert rejected' } }
            }

            // File Upload for People (POST people/upload)
            if (cleanUrl === 'people/upload' && method === 'POST') {
                const uploaded = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : {}
                const urls = uploaded.images || (uploaded.url ? [uploaded.url] : (uploaded.avatar ? [uploaded.avatar] : []))
                return { data: { urls: urls, url: urls[0] || null, success: true } }
            }

            // Create / Update expert profile (POST/PUT/PATCH people, people/create, people/update, people/me)
            if ((cleanUrl === 'people' || cleanUrl.startsWith('people/create') || cleanUrl.startsWith('people/update') || cleanUrl === 'people/me' || cleanUrl.startsWith('people/me/')) && (method === 'PUT' || method === 'PATCH' || method === 'POST')) {
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) }
                
                payload.id = userId || payload.id
                payload.full_name = payload.full_name || payload.name || payload.fullName
                payload.name = payload.full_name
                payload.profession = payload.profession || payload.headline || payload.occupation || 'Advisor'
                payload.headline = payload.headline || payload.profession
                payload.occupation = payload.occupation || payload.profession
                payload.profile_image = payload.avatar || payload.profile_image || payload.avatar_url
                payload.avatar_url = payload.profile_image
                // Always require admin approval on creation or re-edit
                payload.status = 'pending';
                payload.is_approved = false;
                payload.is_verified = false;
                payload.role = payload.role || 'expert';

                // Fetch existing street_address to preserve reviews and connections on update
                let existingMeta = {};
                if (payload.id) {
                    const { data: existProf } = await supabase.from('profiles').select('street_address').eq('id', payload.id).maybeSingle();
                    if (existProf?.street_address && (existProf.street_address.startsWith('{') || existProf.street_address.startsWith('['))) {
                        try { existingMeta = JSON.parse(existProf.street_address); } catch {}
                    }
                }

                // Pack rich metadata into street_address so hourly_rate, bio, educations, skills, pricing are never lost in Postgres
                const rawHourly = payload.hourlyRate ?? payload.hourly_rate ?? payload.pricing?.consultation ?? existingMeta.hourly_rate ?? null;
                const meta = {
                    ...existingMeta,
                    hourly_rate: (rawHourly !== null && rawHourly !== undefined && !isNaN(Number(rawHourly)) && Number(rawHourly) > 0) ? Number(rawHourly) : null,
                    currency: payload.currency || payload.pricing?.currency || existingMeta.currency || 'INR',
                    pricing_type: payload.pricingType || payload.pricing?.type || existingMeta.pricing_type || 'hourly',
                    bio: payload.bio || payload.description || existingMeta.bio || null,
                    category: payload.category || existingMeta.category || null,
                    skills: Array.isArray(payload.skills) ? payload.skills : (payload.skills ? String(payload.skills).split(',').map(s => s.trim()).filter(Boolean) : (existingMeta.skills || [])),
                    languages: Array.isArray(payload.languages) ? payload.languages : (payload.languages ? String(payload.languages).split(',').map(s => s.trim()).filter(Boolean) : (existingMeta.languages || [])),
                    experience: payload.experience || existingMeta.experience || null,
                    educations: Array.isArray(payload.educations) && payload.educations.length > 0
                        ? payload.educations
                        : (payload.education_degree ? [{
                            degree: payload.education_degree,
                            institution: payload.education_school || 'University / Institute',
                            year: payload.education_year || ''
                        }] : (existingMeta.educations || []))
                };
                payload.street_address = JSON.stringify(meta);

                const cleanProfile = sanitizePayload(payload, PROFILE_COLUMNS);
                const { data, error } = await supabase.from('profiles').upsert(cleanProfile).select().maybeSingle();
                if (error) {
                    console.warn('Supabase upsert profile warning:', error);
                }
                const saved = data || cleanProfile;
                const formatted = formatPersonProfile(saved);

                await createInAppAndEmailNotification({
                    userId: payload.id || userId,
                    recipientId: payload.id || userId,
                    userEmail: payload.email || userObj?.email,
                    title: '📝 Advisor Profile Under Review',
                    message: `Your professional profile details for "${payload.full_name || payload.name || 'Advisor'}" have been submitted and are pending admin review before going live in the directory.`,
                    type: NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED,
                    entityType: 'expert',
                    entityId: payload.id || userId,
                    actionUrl: `/people/become`,
                    link: `/people/become`,
                    metadata: saved
                });

                await notifyAdminsOfUserSubmission({
                    title: `👤 New Expert / Advisor Profile: ${payload.full_name || payload.name || 'Advisor'}`,
                    message: `${payload.full_name || 'User'} (${payload.email || userObj?.email || 'N/A'}) submitted their professional profile (${payload.profession || payload.headline || 'Advisor'}) for review.`,
                    type: NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED,
                    entityType: 'expert',
                    entityId: payload.id || userId,
                    actionUrl: '/admin/people',
                    link: '/admin/people',
                    userId: payload.id || userId,
                    userEmail: payload.email || userObj?.email,
                    userName: payload.full_name || payload.name,
                    metadata: saved
                });

                return { data: { profile: formatted, data: formatted, success: true } };
            }

            // Current logged-in user expert profile (GET people/me)
            if (cleanUrl === 'people/me' && method === 'GET') {
                if (!userId) return { data: null }
                const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                const formatted = data ? formatPersonProfile(data) : null
                return { data: { profile: formatted, data: formatted } }
            }

            // Reviews endpoint (GET/POST people/reviews/:expertId)
            if (cleanUrl.includes('reviews')) {
                const parts = cleanUrl.split('/');
                const expertId = parts[parts.length - 1] === 'reviews' ? parts[parts.length - 2] : parts[parts.length - 1];
                
                if (method === 'POST') {
                    const reviewerId = await getCurrentUserId();
                    const userObj = await getCurrentUserObject();
                    const { data: expertProfile } = await supabase.from('profiles').select('*').eq('id', expertId).maybeSingle();
                    let meta = {};
                    if (expertProfile?.street_address && (expertProfile.street_address.startsWith('{') || expertProfile.street_address.startsWith('['))) {
                        try { meta = JSON.parse(expertProfile.street_address); } catch {}
                    }
                    meta.reviews = Array.isArray(meta.reviews) ? meta.reviews : [];
                    const newRev = {
                        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        reviewer_id: reviewerId,
                        reviewer_name: userObj?.full_name || userObj?.name || 'Community Member',
                        reviewer_image: userObj?.profile_image || userObj?.avatar_url || null,
                        rating: Number(body?.rating || body?.stars || 5),
                        comment: body?.comment || body?.review || '',
                        created_at: new Date().toISOString()
                    };
                    meta.reviews.unshift(newRev);
                    meta.rating = Number((meta.reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / meta.reviews.length).toFixed(1));
                    meta.review_count = meta.reviews.length;
                    
                    await supabase.from('profiles').update({ street_address: JSON.stringify(meta) }).eq('id', expertId);
                    return { data: { success: true, review: newRev, reviews: meta.reviews, rating: meta.rating, count: meta.review_count } };
                }

                if (method === 'GET') {
                    const { data: expertProfile } = await supabase.from('profiles').select('*').eq('id', expertId).maybeSingle();
                    let meta = {};
                    if (expertProfile?.street_address && (expertProfile.street_address.startsWith('{') || expertProfile.street_address.startsWith('['))) {
                        try { meta = JSON.parse(expertProfile.street_address); } catch {}
                    }
                    const revs = Array.isArray(meta.reviews) ? meta.reviews : [];
                    const rating = revs.length > 0 ? Number((revs.reduce((s, r) => s + Number(r.rating || 0), 0) / revs.length).toFixed(1)) : 0;
                    return { data: { reviews: revs, data: revs, rating: rating, total: revs.length, count: revs.length } };
                }
            }

            // Single Profile (GET people/profile/:id or GET people/:id)
            const singlePersonMatch = cleanUrl.match(/^people\/(?:profile\/)?([^/]+)$/)
            if (singlePersonMatch && method === 'GET' && !['search', 'me', 'all', 'approved', 'pending', 'rejected', 'upload', 'followers', 'following', 'reviews'].includes(singlePersonMatch[1])) {
                const { data } = await supabase.from('profiles').select('*').eq('id', singlePersonMatch[1]).maybeSingle()
                const formatted = data ? formatPersonProfile(data) : null
                return { data: { profile: formatted, data: formatted } }
            }

            // Followers / Following endpoint
            if (cleanUrl.includes('follow')) {
                // 1. POST Toggle / Unfollow: people/:targetUserId/follow or people/:targetUserId/unfollow
                if (method === 'POST') {
                    const parts = cleanUrl.split('/');
                    let targetUserId = parts.find((p, idx) => parts[idx + 1] === 'follow' || parts[idx + 1] === 'unfollow') || body?.targetUserId || body?.id;
                    if (!targetUserId && parts.length >= 2) {
                        targetUserId = parts[1];
                    }

                    if (!userId) {
                        return { error: { status: 401, error: 'Please sign in to follow professionals' } };
                    }

                    if (String(userId) === String(targetUserId)) {
                        return { error: { status: 400, error: 'Cannot follow your own profile' } };
                    }

                    const { data: curProf } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                    let curMeta = {};
                    if (curProf?.street_address && (curProf.street_address.startsWith('{') || curProf.street_address.startsWith('['))) {
                        try { curMeta = JSON.parse(curProf.street_address); } catch {}
                    }
                    curMeta.following = Array.isArray(curMeta.following) ? curMeta.following : [];

                    const isCurrentlyFollowing = curMeta.following.includes(targetUserId);
                    const isUnfollowAction = cleanUrl.endsWith('/unfollow');
                    const shouldFollow = isUnfollowAction ? false : !isCurrentlyFollowing;

                    if (shouldFollow) {
                        if (!curMeta.following.includes(targetUserId)) {
                            curMeta.following.push(targetUserId);
                        }
                    } else {
                        curMeta.following = curMeta.following.filter(id => id !== targetUserId);
                    }

                    await supabase.from('profiles').update({ street_address: JSON.stringify(curMeta) }).eq('id', userId);

                    // Update target user's followers list
                    if (targetUserId) {
                        const { data: tgtProf } = await supabase.from('profiles').select('street_address').eq('id', targetUserId).maybeSingle();
                        let tgtMeta = {};
                        if (tgtProf?.street_address && (tgtProf.street_address.startsWith('{') || tgtProf.street_address.startsWith('['))) {
                            try { tgtMeta = JSON.parse(tgtProf.street_address); } catch {}
                        }
                        tgtMeta.followers = Array.isArray(tgtMeta.followers) ? tgtMeta.followers : [];
                        if (shouldFollow) {
                            if (!tgtMeta.followers.includes(userId)) tgtMeta.followers.push(userId);
                        } else {
                            tgtMeta.followers = tgtMeta.followers.filter(id => id !== userId);
                        }
                        await supabase.from('profiles').update({ street_address: JSON.stringify(tgtMeta) }).eq('id', targetUserId);
                    }

                    return {
                        data: {
                            success: true,
                            followed: shouldFollow,
                            isFollowing: shouldFollow,
                            data: curMeta.following.map(id => ({ following_user_id: id, user_id: id, id }))
                        }
                    };
                }

                // 2. GET My Following: people/me/following
                if (cleanUrl === 'people/me/following' || cleanUrl.endsWith('/me/following')) {
                    if (!userId) return { data: [] };
                    const { data: curProf } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                    let curMeta = {};
                    if (curProf?.street_address && (curProf.street_address.startsWith('{') || curProf.street_address.startsWith('['))) {
                        try { curMeta = JSON.parse(curProf.street_address); } catch {}
                    }
                    const following = Array.isArray(curMeta.following) ? curMeta.following : [];
                    const formatted = following.map(id => ({ following_user_id: id, user_id: id, id }));
                    return { data: formatted };
                }

                // 3. GET Check status: people/:targetUserId/is-following
                if (cleanUrl.includes('is-following')) {
                    const parts = cleanUrl.split('/');
                    const targetId = parts[1];
                    if (!userId || !targetId) return { data: { isFollowing: false, followed: false } };
                    const { data: curProf } = await supabase.from('profiles').select('street_address').eq('id', userId).maybeSingle();
                    let curMeta = {};
                    if (curProf?.street_address && (curProf.street_address.startsWith('{') || curProf.street_address.startsWith('['))) {
                        try { curMeta = JSON.parse(curProf.street_address); } catch {}
                    }
                    const isFollowing = Array.isArray(curMeta.following) && curMeta.following.includes(targetId);
                    return { data: { isFollowing, followed: isFollowing } };
                }

                // 4. GET Followers: people/:userId/followers
                if (cleanUrl.endsWith('/followers')) {
                    const parts = cleanUrl.split('/');
                    const targetId = parts[1] === 'me' ? userId : parts[1];
                    if (!targetId) return { data: [] };
                    const { data: prof } = await supabase.from('profiles').select('street_address').eq('id', targetId).maybeSingle();
                    let meta = {};
                    if (prof?.street_address && (prof.street_address.startsWith('{') || prof.street_address.startsWith('['))) {
                        try { meta = JSON.parse(prof.street_address); } catch {}
                    }
                    const followers = Array.isArray(meta.followers) ? meta.followers : [];
                    return { data: followers.map(id => ({ follower_user_id: id, user_id: id, id })) };
                }

                // 5. GET Following: people/:userId/following
                if (cleanUrl.endsWith('/following')) {
                    const parts = cleanUrl.split('/');
                    const targetId = parts[1] === 'me' ? userId : parts[1];
                    if (!targetId) return { data: [] };
                    const { data: prof } = await supabase.from('profiles').select('street_address').eq('id', targetId).maybeSingle();
                    let meta = {};
                    if (prof?.street_address && (prof.street_address.startsWith('{') || prof.street_address.startsWith('['))) {
                        try { meta = JSON.parse(prof.street_address); } catch {}
                    }
                    const following = Array.isArray(meta.following) ? meta.following : [];
                    return { data: following.map(id => ({ following_user_id: id, user_id: id, id })) };
                }

                return { data: { success: true, followed: true, data: [] } };
            }

            // Public List of People / Professionals (GET people or GET people/search)
            let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
            if (cleanUrl.includes('pending')) {
                query = query.eq('status', 'pending')
            } else if (cleanUrl.includes('rejected')) {
                query = query.eq('status', 'rejected')
            } else if (cleanUrl.includes('all')) {
                query = query.neq('status', 'rejected')
            } else {
                query = query.or('status.eq.approved,is_approved.eq.true,role.eq.expert,status.eq.pending')
            }

            const peopleCountryParam = queryParams.country || queryParams.country_name || queryParams.countryName;
            if (peopleCountryParam && peopleCountryParam.toLowerCase() !== 'all' && peopleCountryParam.toLowerCase() !== 'global') {
                const norm = normalizeCountryName(peopleCountryParam);
                if (norm === 'United States of America' || peopleCountryParam.toLowerCase() === 'usa' || peopleCountryParam.toLowerCase() === 'us' || peopleCountryParam.toLowerCase() === 'united states') {
                    query = query.in('country', ['United States of America', 'United States', 'USA', 'US']);
                } else {
                    query = query.or(`country.ilike.%${peopleCountryParam}%,country.ilike.%${norm}%`);
                }
            }

            if (queryParams.limit) query = query.limit(Number(queryParams.limit))
            const { data, error } = await query
            if (error) throw error

            // Only show profiles who have actually submitted People / Advisor section details
            const filteredData = (data || []).filter(p => {
                if (!p) return false;
                let meta = {};
                if (p.street_address && (p.street_address.startsWith('{') || p.street_address.startsWith('['))) {
                    try { meta = JSON.parse(p.street_address); } catch {}
                } else if (p.address && (p.address.startsWith('{') || p.address.startsWith('['))) {
                    try { meta = JSON.parse(p.address); } catch {}
                }

                const isExplicitExpert = p.role === 'expert' || p.is_expert === true || p.is_advisor === true;
                const hasProfession = Boolean(p.profession && p.profession.trim() && p.profession.toLowerCase() !== 'user' && p.profession.toLowerCase() !== 'host');
                const hasHeadline = Boolean(p.headline && p.headline.trim());
                const hasBio = Boolean(meta.bio && meta.bio.trim()) || Boolean(p.bio && p.bio.trim());
                const hasCategory = Boolean(meta.category && meta.category.trim()) || Boolean(p.category && p.category.trim());
                const hasSkills = Array.isArray(meta.skills) && meta.skills.length > 0;
                const hasHourlyRate = (meta.hourly_rate !== null && meta.hourly_rate !== undefined) || (p.hourly_rate !== null && p.hourly_rate !== undefined);

                return isExplicitExpert || hasProfession || hasHeadline || hasBio || hasCategory || hasSkills || hasHourlyRate;
            });

            const formattedList = filteredData.map(formatPersonProfile)

            return {
                data: {
                    people: formattedList,
                    profiles: formattedList,
                    results: formattedList,
                    items: formattedList,
                    data: formattedList,
                    total: formattedList.length,
                    count: formattedList.length,
                    success: true
                }
            }
        }
}
