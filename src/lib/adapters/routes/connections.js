import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { createInAppAndEmailNotification } from '../notificationUtils';

export async function handleConnectionsRoute({ cleanUrl, method, body, queryParams }) {
        // ── 9. CONNECTION REQUESTS ───────────────────────────────────
        if (cleanUrl.startsWith('connection-request') || cleanUrl.startsWith('connection-requests') || cleanUrl.startsWith('connections') || cleanUrl.startsWith('connection')) {
            const userObj = await getCurrentUserObject();
            const currentUserId = userObj?.id || userObj?.user_id || userObj?.user?.id || userObj?._id || await getCurrentUserId();

            // Helper to format email to readable human name
            const formatNameFromEmail = (email) => {
                if (!email || typeof email !== 'string' || !email.includes('@')) return '';
                const handle = email.split('@')[0];
                const parts = handle.replace(/[^a-zA-Z]+/g, ' ').trim().split(/\s+/).filter(Boolean);
                if (parts.length === 0) return '';
                return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
            };

            // 1. Send Connection Request: POST connection-requests, connection-request/send, connections/send, etc.
            if ((cleanUrl === 'connection-requests' || cleanUrl === 'connections' || cleanUrl === 'connection-request/send' || cleanUrl === 'connection-requests/send' || cleanUrl === 'connection-request' || cleanUrl === 'connections/send') && method === 'POST') {
                if (!currentUserId) {
                    return { error: { status: 401, data: { message: 'Authentication required' } } };
                }

                const itemId = body?.itemId || body?.item_id || '';
                const itemTitle = body?.itemTitle || body?.item_title || '';
                const itemType = body?.itemType || body?.item_type || 'accommodations';

                let targetUserId = body?.targetUserId || body?.target_user_id || body?.recipient_id || body?.owner_id;
                if (!targetUserId && itemId) {
                    if (itemType === 'travel' || itemType === 'trips' || itemType === 'trip') {
                        const { data: trip } = await supabase.from('travel_trips').select('host_id').eq('id', itemId).maybeSingle();
                        if (trip?.host_id) targetUserId = trip.host_id;
                    } else if (itemType === 'accommodations' || itemType === 'property' || itemType === 'properties') {
                        const { data: prop } = await supabase.from('properties').select('host_id, user_id').eq('id', itemId).maybeSingle();
                        if (prop?.host_id || prop?.user_id) targetUserId = prop.host_id || prop.user_id;
                    } else if (itemType === 'buysell' || itemType === 'marketplace') {
                        const { data: item } = await supabase.from('buy_sell').select('user_id').eq('id', itemId).maybeSingle();
                        if (item?.user_id) targetUserId = item.user_id;
                    } else if (itemType === 'events' || itemType === 'event') {
                        const { data: ev } = await supabase.from('events').select('organizer_id, host_id').eq('id', itemId).maybeSingle();
                        if (ev?.organizer_id || ev?.host_id) targetUserId = ev.organizer_id || ev.host_id;
                    }
                }

                if (!targetUserId) {
                    return { error: { status: 400, data: { message: 'Target user ID is required' } } };
                }

                if (String(currentUserId) === String(targetUserId)) {
                    return { error: { status: 400, data: { message: 'Cannot connect with yourself' } } };
                }

                // Get current user profile
                const { data: currentProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
                let currentMeta = {};
                if (currentProfile?.street_address && (currentProfile.street_address.startsWith('{') || currentProfile.street_address.startsWith('['))) {
                    try { currentMeta = JSON.parse(currentProfile.street_address) } catch {}
                }
                currentMeta.outgoing_requests = Array.isArray(currentMeta.outgoing_requests) ? currentMeta.outgoing_requests : [];

                const requesterEmail = body?.requesterEmail || currentProfile?.email || userObj?.email || '';
                const requesterPhone = body?.requesterPhone || currentProfile?.phone || userObj?.phone || userObj?.user_metadata?.phone || '';
                const requesterAvatar = body?.requesterAvatar || currentProfile?.avatar_url || currentProfile?.profile_image || userObj?.user_metadata?.avatar_url || '';

                const rawRequesterName = (body?.requesterName || '').trim();
                const isGenericGivenName = !rawRequesterName || /^(community\s*member|user\d*|guest|null|undefined)$/i.test(rawRequesterName);

                const requesterName = (!isGenericGivenName ? rawRequesterName : '') ||
                    currentProfile?.name ||
                    currentProfile?.full_name ||
                    (currentProfile?.firstName ? `${currentProfile.firstName} ${currentProfile?.lastName || ''}`.trim() : '') ||
                    userObj?.user_metadata?.full_name ||
                    userObj?.user_metadata?.name ||
                    (userObj?.user_metadata?.first_name ? `${userObj.user_metadata.first_name} ${userObj.user_metadata?.last_name || ''}`.trim() : '') ||
                    userObj?.name ||
                    userObj?.full_name ||
                    (requesterEmail ? formatNameFromEmail(requesterEmail) : '') ||
                    'Community Member';

                // Get target user profile
                const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle();
                let targetMeta = {};
                if (targetProfile?.street_address && (targetProfile.street_address.startsWith('{') || targetProfile.street_address.startsWith('['))) {
                    try { targetMeta = JSON.parse(targetProfile.street_address) } catch {}
                }
                targetMeta.incoming_requests = Array.isArray(targetMeta.incoming_requests) ? targetMeta.incoming_requests : [];

                const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                const newRequest = {
                    id: requestId,
                    requestId: requestId,
                    requester_id: currentUserId,
                    requesterId: currentUserId,
                    requester_name: requesterName,
                    requesterName: requesterName,
                    requester_email: requesterEmail,
                    requesterEmail: requesterEmail,
                    requester_phone: requesterPhone,
                    requesterPhone: requesterPhone,
                    requester_avatar: requesterAvatar,
                    requesterAvatar: requesterAvatar,
                    target_user_id: targetUserId,
                    targetUserId: targetUserId,
                    target_name: body?.targetName || targetProfile?.name || targetProfile?.full_name || 'Host',
                    targetName: body?.targetName || targetProfile?.name || targetProfile?.full_name || 'Host',
                    item_id: itemId,
                    itemId: itemId,
                    item_title: itemTitle,
                    itemTitle: itemTitle,
                    item_type: itemType,
                    itemType: itemType,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                // Deduplicate/Update existing
                const existingIdx = targetMeta.incoming_requests.findIndex(r => 
                    String(r.requesterId || r.requester_id) === String(currentUserId) &&
                    (!itemId || String(r.itemId || r.item_id) === String(itemId))
                );
                if (existingIdx >= 0) {
                    targetMeta.incoming_requests[existingIdx] = { ...targetMeta.incoming_requests[existingIdx], ...newRequest, status: 'pending', updated_at: new Date().toISOString() };
                } else {
                    targetMeta.incoming_requests.unshift(newRequest);
                }

                const outIdx = currentMeta.outgoing_requests.findIndex(r => 
                    String(r.targetUserId || r.target_user_id) === String(targetUserId) &&
                    (!itemId || String(r.itemId || r.item_id) === String(itemId))
                );
                if (outIdx >= 0) {
                    currentMeta.outgoing_requests[outIdx] = { ...currentMeta.outgoing_requests[outIdx], ...newRequest, status: 'pending', updated_at: new Date().toISOString() };
                } else {
                    currentMeta.outgoing_requests.unshift(newRequest);
                }

                // Save to database
                await Promise.all([
                    supabase.from('profiles').update({ street_address: JSON.stringify(targetMeta) }).eq('id', targetUserId),
                    supabase.from('profiles').update({ street_address: JSON.stringify(currentMeta) }).eq('id', currentUserId)
                ]);

                // Trigger in-app notification & simulated email to the owner
                await createInAppAndEmailNotification({
                    userId: targetUserId,
                    userEmail: targetProfile?.email,
                    title: '🤝 New Connection Request!',
                    message: `${requesterName} sent you a connection request for "${itemTitle || 'your listing'}".`,
                    type: 'connection_request',
                    link: '/account-v2?tab=requests'
                });

                return { data: { success: true, message: 'Connection request sent successfully', data: newRequest } };
            }

            // 2. Get Incoming Connection Requests: GET connection-requests/incoming, connection-request/my-requests, etc.
            if (cleanUrl.startsWith('connection-requests/incoming') || cleanUrl.startsWith('connection-request/my-requests') || cleanUrl.startsWith('connection-requests/my-requests') || cleanUrl.startsWith('connections/incoming') || cleanUrl === 'connection-request/incoming') {
                if (!currentUserId) {
                    return { data: { data: [], count: 0, totalPages: 1 } };
                }

                const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
                let meta = {};
                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try { meta = JSON.parse(profile.street_address) } catch {}
                }
                const incoming = Array.isArray(meta.incoming_requests) ? meta.incoming_requests : [];

                // Enrich incoming requests with requester profile details
                const reqUserIds = [...new Set(incoming.map(r => r.requesterId || r.requester_id).filter(Boolean))];
                if (reqUserIds.length > 0) {
                    try {
                        const { data: reqProfiles } = await supabase
                            .from('profiles')
                            .select('id, name, full_name, firstName, lastName, email, phone, avatar_url, profile_image, occupation, headline, city, country')
                            .in('id', reqUserIds);

                        if (reqProfiles && Array.isArray(reqProfiles)) {
                            const profileMap = new Map(reqProfiles.map(p => [String(p.id), p]));
                            incoming.forEach(r => {
                                const reqId = String(r.requesterId || r.requester_id || '');
                                const p = profileMap.get(reqId);
                                if (p) {
                                    const profName = p.name || p.full_name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : '');
                                    if (profName) {
                                        r.requesterName = profName;
                                        r.requester_name = profName;
                                    }
                                    if (p.avatar_url || p.profile_image) {
                                        r.requesterAvatar = p.avatar_url || p.profile_image;
                                        r.requester_avatar = r.requesterAvatar;
                                    }
                                    if (p.email && !r.requesterEmail) {
                                        r.requesterEmail = p.email;
                                        r.requester_email = p.email;
                                    }
                                    if (p.phone && !r.requesterPhone) {
                                        r.requesterPhone = p.phone;
                                        r.requester_phone = p.phone;
                                    }
                                    r.requesterHeadline = p.occupation || p.headline || '';
                                    r.requesterLocation = [p.city, p.country].filter(Boolean).join(', ');
                                }

                                const email = r.requesterEmail || r.requester_email || p?.email;
                                const isGenericName = !r.requesterName || /^(community\s*member|user\d*|guest|null|undefined)$/i.test((r.requesterName || '').trim());
                                if (isGenericName && email) {
                                    const derived = formatNameFromEmail(email);
                                    if (derived) {
                                        r.requesterName = derived;
                                        r.requester_name = derived;
                                    }
                                }
                            });
                        }
                    } catch (enrichErr) {
                        console.warn('Could not enrich incoming connection requests:', enrichErr);
                    }
                }

                return {
                    data: {
                        data: incoming,
                        count: incoming.length,
                        total: incoming.length,
                        totalPages: Math.ceil(incoming.length / (parseInt(queryParams?.limit) || 10)) || 1
                    }
                };
            }

            // 3. Get Outgoing Connection Requests: GET connection-requests/outgoing
            if (cleanUrl.startsWith('connection-requests/outgoing') || cleanUrl.startsWith('connection-request/outgoing') || cleanUrl.startsWith('connections/outgoing')) {
                if (!currentUserId) {
                    return { data: { data: [], count: 0, totalPages: 1 } };
                }

                const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
                let meta = {};
                if (profile?.street_address && (profile.street_address.startsWith('{') || profile.street_address.startsWith('['))) {
                    try { meta = JSON.parse(profile.street_address) } catch {}
                }
                const outgoing = Array.isArray(meta.outgoing_requests) ? meta.outgoing_requests : [];
                return {
                    data: {
                        data: outgoing,
                        count: outgoing.length,
                        total: outgoing.length,
                        totalPages: Math.ceil(outgoing.length / (parseInt(queryParams?.limit) || 10)) || 1
                    }
                };
            }

            // 4. Get Connection Status: GET connection-requests/status/:targetUserId or connection-request/status
            if (cleanUrl.startsWith('connection-requests/status') || cleanUrl.startsWith('connection-request/status') || cleanUrl.startsWith('connections/status')) {
                const targetUserId = cleanUrl.split('/')[2] || queryParams?.targetUserId;
                const itemId = queryParams?.itemId || '';

                if (!targetUserId || !currentUserId) {
                    return { data: { status: 'none', isConnected: false, isOwner: false } };
                }

                if (String(targetUserId) === String(currentUserId)) {
                    return { data: { status: 'accepted', isConnected: true, isOwner: true } };
                }

                // Check requester's outgoing requests
                const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
                let myMeta = {};
                if (myProfile?.street_address && (myProfile.street_address.startsWith('{') || myProfile.street_address.startsWith('['))) {
                    try { myMeta = JSON.parse(myProfile.street_address) } catch {}
                }
                const outgoing = Array.isArray(myMeta.outgoing_requests) ? myMeta.outgoing_requests : [];
                const matched = outgoing.find(r => 
                    String(r.targetUserId || r.target_user_id) === String(targetUserId) &&
                    (!itemId || !r.itemId || !r.item_id || String(r.itemId || r.item_id) === String(itemId))
                );

                let currentStatus = matched ? matched.status : 'none';

                // Check if target user profile has real social contacts to unlock on accepted
                if (currentStatus === 'accepted') {
                    const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle();
                    let targetMeta = {};
                    if (targetProfile?.street_address && (targetProfile.street_address.startsWith('{') || targetProfile.street_address.startsWith('['))) {
                        try { targetMeta = JSON.parse(targetProfile.street_address) } catch {}
                    }
                    return {
                        data: {
                            status: 'accepted',
                            isConnected: true,
                            isOwner: false,
                            data: {
                                status: 'accepted',
                                targetWhatsapp: targetProfile?.whatsapp || targetMeta?.whatsapp || targetProfile?.phone || '',
                                targetPhone: targetProfile?.phone || targetMeta?.phone || '',
                                targetEmail: targetProfile?.email || targetMeta?.email || '',
                                targetInstagram: targetProfile?.instagram || targetMeta?.instagram || '',
                                targetFacebook: targetProfile?.facebook || targetMeta?.facebook || '',
                                targetLinkedin: targetProfile?.linkedin || targetMeta?.linkedin || '',
                                targetTwitter: targetProfile?.twitter || targetMeta?.twitter || ''
                            }
                        }
                    };
                }

                return {
                    data: {
                        status: currentStatus,
                        isConnected: currentStatus === 'accepted',
                        isOwner: false,
                        data: { status: currentStatus }
                    }
                };
            }

            // 5. Accept / Decline Connection Request: PATCH or PUT connection-requests/:requestId/status or connection-request/:requestId/status
            if (cleanUrl.includes('/status') && (method === 'PATCH' || method === 'PUT' || method === 'POST')) {
                if (!currentUserId) {
                    return { error: { status: 401, data: { message: 'Authentication required' } } };
                }

                const parts = cleanUrl.split('/');
                const requestId = parts[1] || parts[parts.indexOf('status') - 1];
                const newStatus = (body?.status || body?.action || 'accepted').toLowerCase();
                const finalStatus = (newStatus === 'accept' || newStatus === 'accepted') ? 'accepted' : 'rejected';

                // Load receiver profile (current user)
                const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
                let myMeta = {};
                if (myProfile?.street_address && (myProfile.street_address.startsWith('{') || myProfile.street_address.startsWith('['))) {
                    try { myMeta = JSON.parse(myProfile.street_address) } catch {}
                }
                myMeta.incoming_requests = Array.isArray(myMeta.incoming_requests) ? myMeta.incoming_requests : [];

                const reqIndex = myMeta.incoming_requests.findIndex(r => String(r.id || r.requestId) === String(requestId));
                if (reqIndex < 0) {
                    return { error: { status: 404, data: { message: 'Connection request not found' } } };
                }

                const targetReq = myMeta.incoming_requests[reqIndex];
                // SECURITY CHECK: Current user must be the recipient!
                if (String(targetReq.targetUserId || targetReq.target_user_id) !== String(currentUserId)) {
                    return { error: { status: 403, data: { message: 'Unauthorized to update this request' } } };
                }

                targetReq.status = finalStatus;
                targetReq.updated_at = new Date().toISOString();
                myMeta.incoming_requests[reqIndex] = targetReq;

                // Update requester's outgoing requests
                const requesterId = targetReq.requesterId || targetReq.requester_id;
                const { data: reqProfile } = await supabase.from('profiles').select('*').eq('id', requesterId).maybeSingle();
                let reqMeta = {};
                if (reqProfile?.street_address && (reqProfile.street_address.startsWith('{') || reqProfile.street_address.startsWith('['))) {
                    try { reqMeta = JSON.parse(reqProfile.street_address) } catch {}
                }
                reqMeta.outgoing_requests = Array.isArray(reqMeta.outgoing_requests) ? reqMeta.outgoing_requests : [];
                const outIdx = reqMeta.outgoing_requests.findIndex(r => String(r.id || r.requestId) === String(requestId) || (String(r.targetUserId || r.target_user_id) === String(currentUserId) && String(r.itemId || r.item_id) === String(targetReq.itemId || targetReq.item_id)));
                if (outIdx >= 0) {
                    reqMeta.outgoing_requests[outIdx].status = finalStatus;
                    reqMeta.outgoing_requests[outIdx].updated_at = new Date().toISOString();
                }

                // If accepted, add to connections
                if (finalStatus === 'accepted') {
                    myMeta.connections = Array.isArray(myMeta.connections) ? myMeta.connections : [];
                    if (!myMeta.connections.some(c => String(c.userId || c.user_id) === String(requesterId))) {
                        myMeta.connections.push({ userId: requesterId, user_id: requesterId, itemId: targetReq.itemId, item_id: targetReq.item_id, status: 'accepted', updated_at: new Date().toISOString() });
                    }

                    reqMeta.connections = Array.isArray(reqMeta.connections) ? reqMeta.connections : [];
                    if (!reqMeta.connections.some(c => String(c.userId || c.user_id) === String(currentUserId))) {
                        reqMeta.connections.push({ userId: currentUserId, user_id: currentUserId, itemId: targetReq.itemId, item_id: targetReq.item_id, status: 'accepted', updated_at: new Date().toISOString() });
                    }

                    // Trigger notification & simulated email to the requester
                    await createInAppAndEmailNotification({
                        userId: requesterId,
                        userEmail: targetReq.requesterEmail || reqProfile?.email,
                        title: '🎉 Connection Request Accepted!',
                        message: `Your connection request for "${targetReq.itemTitle || 'the listing'}" has been accepted! Contact details are now unlocked.`,
                        type: 'connection_accepted',
                        link: '/account-v2?tab=requests'
                    });
                }

                await Promise.all([
                    supabase.from('profiles').update({ street_address: JSON.stringify(myMeta) }).eq('id', currentUserId),
                    supabase.from('profiles').update({ street_address: JSON.stringify(reqMeta) }).eq('id', requesterId)
                ]);

                return { data: { success: true, message: `Request ${finalStatus}`, data: targetReq } };
            }
        }
        return null;
}
