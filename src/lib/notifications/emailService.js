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
            console.warn(`❌ [EMAIL DISPATCH FAILED] to: ${to} | Error:`, fnError);
            return {
                status: 'failed',
                sent_at: null,
                error: fnError.message || 'Edge Function execution error'
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
