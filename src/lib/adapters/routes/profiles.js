import { supabase } from '@/lib/supabaseClient';
import { PROFILE_COLUMNS, sanitizePayload } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { formatUserProfile, formatPersonProfile } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export function isPeopleProfile(p) {
    if (!p) return false;
    if (p.role === 'expert' || p.role === 'advisor' || p.role === 'professional') return true;
    if (p.is_expert === true || p.is_advisor === true || p.expert_status) return true;

    let meta = {};
    const rawAddr = p.street_address || p.address;
    if (typeof rawAddr === 'string' && (rawAddr.startsWith('{') || rawAddr.startsWith('['))) {
        try { meta = JSON.parse(rawAddr); } catch {}
    }

    const hasProfession = Boolean(p.profession && p.profession.trim() && p.profession.toLowerCase() !== 'user' && p.profession.toLowerCase() !== 'host' && p.profession.toLowerCase() !== 'guest');
    const hasHeadline = Boolean(p.headline && p.headline.trim());
    const hasBio = Boolean((meta.bio && meta.bio.trim()) || (p.bio && p.bio.trim()));
    const hasCategory = Boolean((meta.category && meta.category.trim() && meta.category.toLowerCase() !== 'host') || (p.category && p.category.trim() && p.category.toLowerCase() !== 'host'));
    const hasSkills = (Array.isArray(meta.skills) && meta.skills.length > 0) || (Array.isArray(p.skills) && p.skills.length > 0);
    const hasHourlyRate = (meta.hourly_rate !== null && meta.hourly_rate !== undefined) || (p.hourly_rate !== null && p.hourly_rate !== undefined);
    const hasEducations = (Array.isArray(meta.educations) && meta.educations.length > 0) || (Array.isArray(p.educations) && p.educations.length > 0);
    const hasServices = Array.isArray(meta.services) && meta.services.length > 0;

    return hasProfession || hasHeadline || hasBio || hasCategory || hasSkills || hasHourlyRate || hasEducations || hasServices;
}

export async function handleProfilesRoute({ cleanUrl, method, body, queryParams }) {
        // ── 6. PROFILES / HOST / USER ──────────────────────────────
        if (cleanUrl.startsWith('host') || cleanUrl.startsWith('profiles') || cleanUrl.startsWith('user') || cleanUrl.startsWith('admin/approved/approved-host') || cleanUrl.startsWith('admin/pending/pending-host') || cleanUrl.startsWith('admin/rejected/rejected-host') || cleanUrl === 'auth/me' || cleanUrl === 'auth/user' || cleanUrl.includes('update-profile') || cleanUrl.startsWith('otp/')) {
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
            const userEmail = userObj?.email || userObj?.user?.email

            // Admin Approval Actions (Differentiates between People/Advisor and Host)
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data: existing } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
                
                const isPeopleSection = 
                    cleanUrl.includes('people') || 
                    cleanUrl.includes('expert') || 
                    cleanUrl.includes('advisor') || 
                    cleanUrl.includes('professional') ||
                    body?.role === 'expert' ||
                    body?.role === 'advisor' ||
                    body?.type === 'expert' ||
                    body?.type === 'people' ||
                    isPeopleProfile(existing)

                if (isPeopleSection) {
                    const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, is_verified: true, role: 'expert' }).eq('id', id).select().maybeSingle()
                    const profileData = data || existing
                    if (profileData) {
                        await createInAppAndEmailNotification({
                            userId: profileData.id,
                            recipientId: profileData.id,
                            userEmail: profileData.email,
                            title: '🎉 Advisor Profile Approved & Verified!',
                            message: `Congratulations! Your professional advisor profile has been approved by NextKinLife admin and is now live in the People directory.`,
                            type: NOTIFICATION_TYPES.EXPERT_APPROVED,
                            entityType: 'expert',
                            entityId: profileData.id,
                            actionUrl: `/people/${profileData.id}`,
                            link: `/people/${profileData.id}`,
                            metadata: profileData
                        });
                    }
                    return { data: { success: true, host: profileData, profile: profileData ? formatPersonProfile(profileData) : null, message: 'Advisor profile approved' } }
                } else {
                    const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, role: 'host' }).eq('id', id).select().maybeSingle()
                    const hostData = data || existing
                    if (hostData) {
                        await createInAppAndEmailNotification({
                            userId: hostData.id,
                            recipientId: hostData.id,
                            userEmail: hostData.email,
                            title: '🎉 Host Application Approved!',
                            message: `Congratulations! Your Host Application has been approved by NextKinLife admin. You can now create and manage spaces, events, and trips!`,
                            type: NOTIFICATION_TYPES.HOST_APPROVED,
                            entityType: 'host',
                            entityId: hostData.id,
                            actionUrl: `/account-v2`,
                            link: `/account-v2`,
                            metadata: hostData
                        });
                    }
                    return { data: { success: true, host: hostData, profile: hostData, message: 'Host approved' } }
                }
            }

            // Admin Rejection Actions (Differentiates between People/Advisor and Host)
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data: existing } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
                
                const isPeopleSection = 
                    cleanUrl.includes('people') || 
                    cleanUrl.includes('expert') || 
                    cleanUrl.includes('advisor') || 
                    cleanUrl.includes('professional') ||
                    body?.role === 'expert' ||
                    body?.role === 'advisor' ||
                    body?.type === 'expert' ||
                    body?.type === 'people' ||
                    isPeopleProfile(existing)

                if (isPeopleSection) {
                    const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                    const profileData = data || existing
                    if (profileData) {
                        await createInAppAndEmailNotification({
                            userId: profileData.id,
                            recipientId: profileData.id,
                            userEmail: profileData.email,
                            title: '⚠️ Advisor Profile Update',
                            message: `Your professional advisor profile requires revisions according to community guidelines.`,
                            type: NOTIFICATION_TYPES.EXPERT_REJECTED,
                            entityType: 'expert',
                            entityId: profileData.id,
                            actionUrl: `/people/become`,
                            link: `/people/become`,
                            metadata: profileData
                        });
                    }
                    return { data: { success: true, host: profileData, profile: profileData ? formatPersonProfile(profileData) : null, message: 'Advisor profile rejected' } }
                } else {
                    const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                    const hostData = data || existing
                    if (hostData) {
                        await createInAppAndEmailNotification({
                            userId: hostData.id,
                            recipientId: hostData.id,
                            userEmail: hostData.email,
                            title: '⚠️ Host Application Status Update',
                            message: `Your host application was reviewed by our moderation team and requires additional verification documents.`,
                            type: NOTIFICATION_TYPES.HOST_REJECTED,
                            entityType: 'host',
                            entityId: hostData.id,
                            actionUrl: `/hosts`,
                            link: `/hosts`,
                            metadata: hostData
                        });
                    }
                    return { data: { success: true, host: hostData, profile: hostData, message: 'Host rejected' } }
                }
            }

            if (cleanUrl.includes('pending') && method === 'GET') {
                // If this is specifically asking for people/experts, let handlePeopleRoute handle it
                if (cleanUrl.includes('people') || cleanUrl.includes('expert') || cleanUrl.includes('advisor') || cleanUrl.includes('professional')) {
                    return undefined;
                }
                const { data } = await supabase.from('profiles').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                const hostOnly = (data || []).filter(p => !isPeopleProfile(p))
                return { data: { hosts: hostOnly, profiles: hostOnly } }
            }
            if (cleanUrl.includes('rejected') && method === 'GET') {
                if (cleanUrl.includes('people') || cleanUrl.includes('expert') || cleanUrl.includes('advisor') || cleanUrl.includes('professional')) {
                    return undefined;
                }
                const { data } = await supabase.from('profiles').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                const hostOnly = (data || []).filter(p => !isPeopleProfile(p))
                return { data: { hosts: hostOnly, profiles: hostOnly } }
            }

            // Current logged-in user profile & host status
            if (cleanUrl === 'host/profile' || cleanUrl === 'host/me' || cleanUrl === 'host/get' || cleanUrl === 'auth/me' || cleanUrl === 'auth/user' || cleanUrl === 'user/profile' || cleanUrl === 'user/me' || cleanUrl === 'user/get' || cleanUrl === 'profiles/me') {
                if (!userId && !userEmail) return { data: { host: null, user: null, profile: null } }

                let profile = null
                if (userObj && (userObj.role || userObj.status !== undefined || userObj.is_approved !== undefined)) {
                    profile = userObj;
                }
                if (!profile && userId) {
                    try {
                        const profilePromise = supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null }), 2500))
                        const { data } = await Promise.race([profilePromise, timeoutPromise])
                        profile = data
                    } catch {}
                }
                if (!profile && userEmail) {
                    try {
                        const profilePromise = supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle()
                        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null }), 2500))
                        const { data } = await Promise.race([profilePromise, timeoutPromise])
                        profile = data
                    } catch {}
                }

                // If brand new user, initialize as standard user (NOT approved host)
                if (!profile && (userId || userEmail)) {
                    const fallbackProfile = {
                        id: userId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined),
                        email: userEmail,
                        full_name: userObj?.full_name || userObj?.name || [userObj?.first_name, userObj?.last_name].filter(Boolean).join(' ') || (userEmail ? userEmail.split('@')[0] : 'User'),
                        phone: userObj?.phone || null,
                        role: 'user',
                        status: null,
                        is_approved: false,
                    }
                    try {
                        const { data } = await supabase.from('profiles').upsert(fallbackProfile).select().maybeSingle()
                        profile = data || fallbackProfile
                    } catch {
                        profile = fallbackProfile
                    }
                }

                const formattedProfile = formatUserProfile(profile);
                return { data: { host: formattedProfile, user: formattedProfile, profile: formattedProfile, data: formattedProfile } }
            }

            // Standard User Profile Update (e.g. from PersonalInfo via authSlice or user service)
            if ((cleanUrl.includes('update-profile') || cleanUrl === 'user/update' || cleanUrl === 'profiles/update' || cleanUrl === 'user/profile/update' || (cleanUrl.startsWith('user') && (method === 'PUT' || method === 'PATCH' || method === 'POST'))) && !cleanUrl.includes('approve') && !cleanUrl.includes('reject')) {
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) };
                if (payload.name && !payload.full_name) payload.full_name = payload.name;
                if (payload.full_name && !payload.name) payload.name = payload.full_name;
                if (payload.userId && !payload.id) payload.id = payload.userId;
                if (payload.user_id && !payload.id) payload.id = payload.user_id;

                const targetId = payload.id || userId;
                let existingMeta = {};
                let existingProfile = null;
                if (targetId) {
                    const { data: existProf } = await supabase.from('profiles').select('*').eq('id', targetId).maybeSingle();
                    existingProfile = existProf;
                } else if (userEmail) {
                    const { data: existProf } = await supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle();
                    existingProfile = existProf;
                }

                if (existingProfile?.street_address && (existingProfile.street_address.startsWith('{') || existingProfile.street_address.startsWith('['))) {
                    try { existingMeta = JSON.parse(existingProfile.street_address); } catch {}
                }

                const physicalAddress = payload.address !== undefined ? payload.address : payload.street_address;
                if (Object.keys(existingMeta).length > 0) {
                    if (physicalAddress !== undefined) {
                        existingMeta.address = physicalAddress;
                        existingMeta.street_address = physicalAddress;
                    }
                    payload.street_address = JSON.stringify(existingMeta);
                } else if (physicalAddress !== undefined) {
                    payload.street_address = physicalAddress;
                }

                payload.id = targetId || existingProfile?.id;
                if (existingProfile?.role) payload.role = existingProfile.role;
                if (existingProfile?.status) payload.status = existingProfile.status;
                if (existingProfile?.is_approved !== undefined) payload.is_approved = existingProfile.is_approved;

                const cleanProfile = sanitizePayload(payload, PROFILE_COLUMNS);
                const { data, error } = await supabase.from('profiles').upsert(cleanProfile).select().maybeSingle();
                if (error) throw error;
                const formatted = formatUserProfile(data);

                try {
                    if (payload.full_name || payload.name) {
                        await supabase.auth.updateUser({
                            data: {
                                full_name: payload.full_name || payload.name,
                                name: payload.full_name || payload.name
                            }
                        });
                    }
                } catch {}

                return { data: { user: formatted, profile: formatted, host: formatted, success: true } };
            }

            // Host application submission by user
            if ((cleanUrl === 'host/save' || cleanUrl === 'host/update' || cleanUrl.startsWith('host/update/')) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                const id = cleanUrl.split('/').pop() || userId
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) }
                
                // Map common alias fields
                if (payload.userId && !payload.id) payload.id = payload.userId;
                if (payload.user_id && !payload.id) payload.id = payload.user_id;
                if (payload.name && !payload.full_name) payload.full_name = payload.name;
                if (payload.full_name && !payload.name) payload.name = payload.full_name;

                payload.id = (id && id !== 'save' && id !== 'update') ? id : (userId || payload.id);

                // Check existing profile to preserve approval status if host is already approved
                let existingMeta = {};
                let isAlreadyApproved = false;
                if (payload.id) {
                    const { data: existProf } = await supabase.from('profiles').select('*').eq('id', payload.id).maybeSingle();
                    if (existProf?.is_approved || existProf?.status === 'approved') {
                        isAlreadyApproved = true;
                        payload.status = existProf.status || 'approved';
                        payload.is_approved = true;
                        payload.role = existProf.role || 'host';
                    }
                    if (existProf?.street_address && (existProf.street_address.startsWith('{') || existProf.street_address.startsWith('['))) {
                        try { existingMeta = JSON.parse(existProf.street_address); } catch {}
                    }
                }

                if (!isAlreadyApproved) {
                    payload.status = payload.status || 'pending';
                    payload.is_approved = false;
                    payload.role = payload.role || 'user';
                }

                const physicalAddress = payload.address || payload.street_address;
                if (Object.keys(existingMeta).length > 0) {
                    if (physicalAddress !== undefined) {
                        existingMeta.address = physicalAddress;
                        existingMeta.street_address = physicalAddress;
                    }
                    payload.street_address = JSON.stringify(existingMeta);
                } else if (physicalAddress !== undefined) {
                    payload.street_address = physicalAddress;
                }

                const cleanProfile = sanitizePayload(payload, PROFILE_COLUMNS)

                const { data, error } = await supabase.from('profiles').upsert(cleanProfile).select().maybeSingle()
                if (error) throw error
                const formatted = formatUserProfile(data);

                // Notify admin only for new host applications (not profile edits by approved hosts)
                if (!isAlreadyApproved) {
                    await notifyAdminsOfUserSubmission({
                        title: `🛡️ New Host Verification Request: ${formatted?.full_name || formatted?.name || 'Applicant'}`,
                        message: `${formatted?.full_name || 'User'} (${formatted?.email || 'N/A'}) submitted identity verification for host status in ${formatted?.city || formatted?.country || 'Community'}.`,
                        type: NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED,
                        entityType: 'host',
                        entityId: data?.id,
                        actionUrl: '/admin/hosts',
                        link: '/admin/hosts',
                        userId: data?.id,
                        userEmail: data?.email,
                        userName: formatted?.full_name,
                        metadata: formatted
                    });

                    // Dispatch confirmation in-app notification to applicant
                    await createInAppAndEmailNotification({
                        userId: data?.id,
                        recipientId: data?.id,
                        userEmail: data?.email,
                        title: '🛡️ Host Application Submitted',
                        message: `Your host verification application for ${formatted?.city || formatted?.country || 'Community'} has been submitted and is currently pending review by the NextKinLife moderation team.`,
                        type: NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED,
                        entityType: 'host',
                        entityId: data?.id,
                        actionUrl: '/account-v2',
                        link: '/account-v2',
                        metadata: formatted
                    });
                }

                return { data: { host: formatted, profile: formatted, user: formatted, success: true } }
            }

            const hostIdMatch = cleanUrl.match(/^(?:host|profiles|user)\/([^/]+)$/)
            if (hostIdMatch && method === 'GET' && !['profile', 'me', 'save', 'update', 'get', 'search', 'all'].includes(hostIdMatch[1])) {
                const { data } = await supabase.from('profiles').select('*').eq('id', hostIdMatch[1]).maybeSingle()
                const formatted = formatUserProfile(data);
                return { data: { host: formatted, profile: formatted, user: formatted } }
            }

            // List of approved hosts (for directory / admin)
            const { data } = await supabase.from('profiles').select('*').or('status.eq.approved,is_approved.eq.true').limit(50)
            return { data: { profiles: data || [], hosts: data || [] } }
        }
}
