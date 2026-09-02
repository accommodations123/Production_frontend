import { supabase } from '@/lib/supabaseClient';
import { PROFILE_COLUMNS, sanitizePayload } from '../constants';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { formatUserProfile } from '../enrichmentUtils';
import { parseFormDataWithUploads } from '../storageUtils';
import { uploadToSupabaseStorage } from '@/lib/storageUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { createInAppAndEmailNotification, notifyAdminsOfUserSubmission } from '../notificationUtils';

export async function handleProfilesRoute({ cleanUrl, method, body, queryParams }) {
        // ── 6. PROFILES / HOST / USER ──────────────────────────────
        if (cleanUrl.startsWith('host') || cleanUrl.startsWith('profiles') || cleanUrl.startsWith('user') || cleanUrl.startsWith('admin/approved/approved-host') || cleanUrl.startsWith('admin/pending/pending-host') || cleanUrl.startsWith('admin/rejected/rejected-host') || cleanUrl === 'auth/me' || cleanUrl === 'auth/user') {
            const userObj = await getCurrentUserObject()
            const userId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId()
            const userEmail = userObj?.email || userObj?.user?.email

            // Admin Host Approval Actions
            if ((cleanUrl.includes('/approve/') || cleanUrl.endsWith('/approve')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'approved', is_approved: true, role: 'host' }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.id,
                        recipientId: data.id,
                        userEmail: data.email,
                        title: '🎉 Host Application Approved!',
                        message: `Congratulations! Your Host Application has been approved by NextKinLife admin. You can now create and manage spaces, events, and trips!`,
                        type: NOTIFICATION_TYPES.HOST_APPROVED,
                        entityType: 'host',
                        entityId: data.id,
                        actionUrl: `/account-v2`,
                        link: `/account-v2`
                    });
                }
                return { data: { success: true, host: data, profile: data, message: 'Host approved' } }
            }
            if ((cleanUrl.includes('/reject/') || cleanUrl.endsWith('/reject')) && method !== 'GET') {
                const id = cleanUrl.split('/').pop()
                const { data } = await supabase.from('profiles').update({ status: 'rejected', is_approved: false }).eq('id', id).select().maybeSingle()
                if (data) {
                    await createInAppAndEmailNotification({
                        userId: data.id,
                        recipientId: data.id,
                        userEmail: data.email,
                        title: '⚠️ Host Application Status Update',
                        message: `Your host application was reviewed by our moderation team and requires additional verification documents.`,
                        type: NOTIFICATION_TYPES.HOST_REJECTED,
                        entityType: 'host',
                        entityId: data.id,
                        actionUrl: `/hosts`,
                        link: `/hosts`
                    });
                }
                return { data: { success: true, host: data, profile: data, message: 'Host rejected' } }
            }
            if (cleanUrl.includes('pending') && method === 'GET') {
                const { data } = await supabase.from('profiles').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                return { data: { hosts: data || [], profiles: data || [] } }
            }
            if (cleanUrl.includes('rejected') && method === 'GET') {
                const { data } = await supabase.from('profiles').select('*').eq('status', 'rejected').order('created_at', { ascending: false })
                return { data: { hosts: data || [], profiles: data || [] } }
            }

            // Current logged-in user profile & host status
            if (cleanUrl === 'host/profile' || cleanUrl === 'host/me' || cleanUrl === 'host/get' || cleanUrl === 'auth/me' || cleanUrl === 'auth/user' || cleanUrl === 'user/profile' || cleanUrl === 'user/me' || cleanUrl === 'user/get' || cleanUrl === 'profiles/me') {
                if (!userId && !userEmail) return { data: { host: null, user: null, profile: null } }

                let profile = null
                if (userId) {
                    try {
                        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
                        profile = data
                    } catch {}
                }
                if (!profile && userEmail) {
                    try {
                        const { data } = await supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle()
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

            // Host application submission by user -> status: 'pending', is_approved: false
            if ((cleanUrl === 'host/save' || cleanUrl === 'host/update' || cleanUrl.startsWith('host/update/')) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                const id = cleanUrl.split('/').pop() || userId
                let payload = body instanceof FormData ? await parseFormDataWithUploads(body, 'profiles') : { ...(body || {}) }
                
                // Map common alias fields
                if (payload.userId && !payload.id) payload.id = payload.userId;
                if (payload.user_id && !payload.id) payload.id = payload.user_id;
                if (payload.name && !payload.full_name) payload.full_name = payload.name;

                payload.id = (id && id !== 'save' && id !== 'update') ? id : (userId || payload.id);
                payload.status = payload.status || 'pending'
                payload.is_approved = false
                payload.role = payload.role || 'user'

                // Check existing street_address to preserve JSON metadata if present
                let existingMeta = {};
                if (payload.id) {
                    const { data: existProf } = await supabase.from('profiles').select('street_address').eq('id', payload.id).maybeSingle();
                    if (existProf?.street_address && (existProf.street_address.startsWith('{') || existProf.street_address.startsWith('['))) {
                        try { existingMeta = JSON.parse(existProf.street_address); } catch {}
                    }
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

                // Notify admin of new host verification submission
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
