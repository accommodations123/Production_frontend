import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserId, getCurrentUserObject } from '../userUtils';
import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';
import { notifyAdminsOfUserSubmission, createInAppAndEmailNotification } from '../notificationUtils';

export async function handleContactRoute({ cleanUrl, method, body }) {
    // ── CONTACT SUBMISSIONS ──────────────────────────────────────────
    if (cleanUrl === 'contact' || cleanUrl.startsWith('contact/') || cleanUrl.startsWith('admin/contact') || cleanUrl.startsWith('admin/messages')) {
        // 1. Submit contact inquiry (POST contact, contact/submit, contact/send)
        if ((cleanUrl === 'contact' || cleanUrl.startsWith('contact/submit') || cleanUrl.startsWith('contact/send')) && method === 'POST') {
            const payload = body || {};
            const senderUserId = await getCurrentUserId();
            const senderObj = await getCurrentUserObject();

            const firstName = payload.firstName || payload.first_name || '';
            const lastName = payload.lastName || payload.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || senderObj?.name || 'Inquirer';
            const email = payload.email || senderObj?.email || '';
            const phone = payload.phone || '';
            const subject = payload.subject || 'General Inquiry';
            const message = payload.message || payload.comments || '';

            const contactRecord = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                first_name: firstName,
                last_name: lastName,
                name: fullName,
                email,
                phone,
                subject,
                message,
                user_id: senderUserId || null,
                status: 'unread',
                created_at: new Date().toISOString()
            };

            // Attempt persistence to Supabase contact/messages table if present
            if (supabase) {
                try {
                    await supabase.from('contact_submissions').insert(contactRecord);
                } catch {}
                try {
                    await supabase.from('contact_messages').insert(contactRecord);
                } catch {}
            }

            // Save to localStorage for instant local retrieval
            try {
                const stored = localStorage.getItem('nxt_contact_messages');
                const list = stored ? JSON.parse(stored) : [];
                localStorage.setItem('nxt_contact_messages', JSON.stringify([contactRecord, ...list].slice(0, 100)));
            } catch {}

            // Send notification to User confirming receipt
            if (senderUserId || email) {
                await createInAppAndEmailNotification({
                    userId: senderUserId,
                    recipientId: senderUserId,
                    userEmail: email,
                    title: '✉️ Message Sent to NextKinLife',
                    message: `Thank you for reaching out! We received your message regarding "${subject}" and our support team will respond within 24 hours.`,
                    type: NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED,
                    entityType: 'contact',
                    entityId: contactRecord.id,
                    actionUrl: '/contact',
                    link: '/contact',
                    metadata: contactRecord
                });
            }

            // Send Realtime Admin Notification
            await notifyAdminsOfUserSubmission({
                title: `📩 New Contact Inquiry from ${fullName}`,
                message: `Subject: "${subject}"\n${message ? message.substring(0, 120) + (message.length > 120 ? '...' : '') : ''}`,
                type: NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED,
                entityType: 'contact',
                entityId: contactRecord.id,
                actionUrl: '/admin/messages',
                link: '/admin/messages',
                userId: senderUserId,
                userEmail: email,
                userName: fullName,
                metadata: contactRecord
            });

            return { data: { success: true, message: 'Message sent successfully', data: contactRecord } };
        }

        // 2. Admin list contact messages (GET admin/contact, admin/messages, contact/messages)
        if (method === 'GET') {
            let messages = [];
            try {
                const stored = localStorage.getItem('nxt_contact_messages');
                if (stored) messages = JSON.parse(stored);
            } catch {}

            if (supabase) {
                try {
                    const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
                    if (data && data.length > 0) messages = data;
                } catch {}
            }

            return { data: { messages, data: messages, success: true } };
        }
    }

    return undefined;
}
