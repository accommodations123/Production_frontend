/**
 * Email Dispatch Service
 * Handles transactional email sending via Supabase Edge Function ('send-email').
 * Accurately reports delivery state ('sent', 'failed', 'skipped') without false claims
 * and without blocking UI critical paths.
 */

import { supabase } from '@/lib/supabaseClient';
import { buildEmailTemplate } from './emailTemplates';

/**
 * Dispatch an email notification via Supabase Edge Function
 */
export async function sendEmailNotification({
    to,
    type,
    title,
    message,
    actionUrl,
    entityId,
    metadata = {},
    notificationId = null
}) {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
        return {
            status: 'skipped',
            reason: 'No valid recipient email provided',
            sent_at: null,
            error: null
        };
    }

    const { subject, html, text } = buildEmailTemplate({
        type,
        title,
        message,
        entityId,
        actionUrl,
        metadata
    });

    try {
        // Direct Resend dispatch fallback if VITE_RESEND_API_KEY is configured in client environment
        const directResendKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY;
        if (directResendKey) {
            try {
                const fromAddress = import.meta.env?.VITE_EMAIL_FROM || 'NextKinLife <onboarding@resend.dev>';
                const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${directResendKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromAddress,
                        to: [to],
                        subject,
                        html,
                        text
                    })
                });
                const resendData = await resendRes.json().catch(() => ({}));
                if (resendRes.ok && resendData?.id) {
                    console.log(`📬 [EMAIL SENT VIA RESEND] to: ${to} | ID: ${resendData.id} | Subject: "${subject}"`);
                    return {
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        messageId: resendData.id,
                        error: null
                    };
                }
            } catch (directErr) {
                console.warn('[Direct Resend fallback error]:', directErr);
            }
        }

        if (!supabase?.functions) {
            return {
                status: 'failed',
                sent_at: null,
                error: 'Supabase Functions client not initialized'
            };
        }

        // Invoke server-side Supabase Edge Function
        const { data, error: fnError } = await supabase.functions.invoke('send-email', {
            body: {
                to,
                subject,
                html,
                text,
                notification_id: notificationId
            }
        });

        if (fnError) {
            const isUndeployed = fnError.context?.status === 404 || fnError.message?.includes('non-2xx');
            const note = isUndeployed
                ? 'Edge Function "send-email" is not deployed to Supabase. Deploy it using `npx supabase functions deploy send-email` or set VITE_RESEND_API_KEY in .env.'
                : (fnError.message || 'Edge Function execution error');

            console.warn(`❌ [EMAIL DISPATCH FAILED] to: ${to} | Note: ${note}`);
            return {
                status: 'failed',
                sent_at: null,
                error: note
            };
        }

        if (data && data.success && data.status === 'sent') {
            console.log(`📬 [EMAIL SENT] to: ${to} | Provider ID: ${data.messageId || 'ok'} | Subject: "${subject}"`);
            return {
                status: 'sent',
                sent_at: data.sent_at || new Date().toISOString(),
                messageId: data.messageId,
                error: null
            };
        }

        const failReason = data?.error || 'Email provider rejected message';
        console.warn(`❌ [EMAIL REJECTED] to: ${to} | Reason:`, failReason);
        return {
            status: 'failed',
            sent_at: null,
            error: failReason
        };
    } catch (err) {
        console.error('Email dispatch exception:', err);
        return {
            status: 'failed',
            sent_at: null,
            error: err.message || 'Network exception during email dispatch'
        };
    }
}
