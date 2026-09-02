/**
 * Transactional Email Template Generator for NextKinLife
 * Generates responsive, beautifully styled HTML and plain-text emails.
 */

import { NOTIFICATION_TYPES } from '@/shared/constants/notificationTypes';

/**
 * Base email layout wrapper
 */
function wrapEmailHtml({ title, preheader, bodyContent, actionUrl, actionText }) {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nextkinlife.com';
    const resolvedActionUrl = actionUrl?.startsWith('http') ? actionUrl : `${appUrl}${actionUrl || '/'}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Notification from NextKinLife'}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A1A2F; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 12px; box-sizing: border-box; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0A1A2F 0%, #152A4A 100%); padding: 32px 24px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; }
        .logo span { color: #38bdf8; }
        .content { padding: 32px 28px; line-height: 1.6; color: #334155; font-size: 15px; }
        .title { color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 10px; margin-top: 20px; text-align: center; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25); }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .reason-box { background: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 6px; margin: 16px 0; color: #9f1239; font-size: 14px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 6px; margin: 16px 0; color: #0369a1; font-size: 14px; }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">
        ${preheader || title || ''}
    </div>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <a href="${appUrl}" class="logo">Next<span>Kin</span>Life</a>
            </div>
            <div class="content">
                <h2 class="title">${title}</h2>
                ${bodyContent}
                ${actionUrl && actionText ? `<div style="text-align: center; margin-top: 24px;"><a href="${resolvedActionUrl}" class="btn">${actionText}</a></div>` : ''}
            </div>
            <div class="footer">
                <p style="margin: 0 0 8px 0;">This email was sent by NextKinLife. You are receiving this because of your account activity.</p>
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} NextKinLife Inc. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Generate email payload by notification type
 */
export function buildEmailTemplate({ type, title, message, entityId, actionUrl, metadata = {} }) {
    let emailSubject = `[NextKinLife] ${title || 'Notification'}`;
    let emailPreheader = message || '';
    let bodyContent = `<p>${message || ''}</p>`;
    let actionText = 'View in NextKinLife';

    switch (type) {
        // Property
        case NOTIFICATION_TYPES.PROPERTY_SUBMITTED:
            emailSubject = `[Admin Alert] New Space Listed: ${metadata?.title || 'Accommodation'}`;
            emailPreheader = 'A new accommodation has been submitted for review.';
            bodyContent = `
                <p>A new accommodation listing has been submitted and is awaiting administrative review.</p>
                <div class="info-box">
                    <strong>Listing:</strong> ${metadata?.title || 'Accommodation Space'}<br/>
                    <strong>Location:</strong> ${metadata?.city || ''}, ${metadata?.country || ''}<br/>
                    <strong>Host:</strong> ${metadata?.host_name || metadata?.email || 'Host'}
                </div>
            `;
            actionText = 'Review Accommodation';
            break;

        case NOTIFICATION_TYPES.PROPERTY_APPROVED:
            emailSubject = `🎉 Your Space "${metadata?.title || 'Accommodation'}" is Approved!`;
            emailPreheader = 'Your accommodation is now live and verified on NextKinLife.';
            bodyContent = `
                <p>Great news! Your space has been verified and approved by the NextKinLife moderation team.</p>
                <p>It is now live on the public accommodations directory and ready to receive bookings and inquiries.</p>
            `;
            actionText = 'View Your Space';
            break;

        case NOTIFICATION_TYPES.PROPERTY_REJECTED:
            emailSubject = `⚠️ Update Regarding Your Space "${metadata?.title || 'Accommodation'}"`;
            emailPreheader = 'Your accommodation listing requires revisions.';
            bodyContent = `
                <p>Your listing requires a few updates before it can be published.</p>
                ${metadata?.rejection_reason ? `<div class="reason-box"><strong>Feedback:</strong> ${metadata.rejection_reason}</div>` : '<div class="reason-box">Please ensure your listing provides clear photos, accurate pricing, and comprehensive house rules.</div>'}
            `;
            actionText = 'Review & Edit Listing';
            break;

        // Events
        case NOTIFICATION_TYPES.EVENT_SUBMITTED:
            emailSubject = `[Admin Alert] New Event: ${metadata?.title || 'Event'}`;
            emailPreheader = 'A new community event has been submitted for review.';
            bodyContent = `
                <p>A new event has been submitted and requires administrative review.</p>
                <div class="info-box">
                    <strong>Event:</strong> ${metadata?.title || 'Community Event'}<br/>
                    <strong>Date:</strong> ${metadata?.start_date || 'Upcoming'}<br/>
                    <strong>Organizer:</strong> ${metadata?.organizer_name || metadata?.organizer_email || 'Organizer'}
                </div>
            `;
            actionText = 'Review Event';
            break;

        case NOTIFICATION_TYPES.EVENT_APPROVED:
            emailSubject = `🎉 Your Event "${metadata?.title || 'Event'}" is Live!`;
            emailPreheader = 'Your community event is now public on NextKinLife.';
            bodyContent = `
                <p>Congratulations! Your community event has been approved and published to the NextKinLife events directory.</p>
                <p>Community members can now view details and RSVP to attend.</p>
            `;
            actionText = 'View Event Details';
            break;

        case NOTIFICATION_TYPES.EVENT_REJECTED:
            emailSubject = `⚠️ Update Regarding Your Event "${metadata?.title || 'Event'}"`;
            bodyContent = `
                <p>Your event submission requires changes according to our community event standards.</p>
                ${metadata?.rejection_reason ? `<div class="reason-box"><strong>Feedback:</strong> ${metadata.rejection_reason}</div>` : ''}
            `;
            actionText = 'Update Event';
            break;

        // Marketplace
        case NOTIFICATION_TYPES.BUY_SELL_SUBMITTED:
            emailSubject = `[Admin Alert] New Marketplace Item: ${metadata?.title || 'Item'}`;
            bodyContent = `
                <p>A user listed a new item for sale in the marketplace.</p>
                <div class="info-box">
                    <strong>Item:</strong> ${metadata?.title || 'Product'}<br/>
                    <strong>Price:</strong> ${metadata?.currency || 'INR'} ${metadata?.price || ''}
                </div>
            `;
            actionText = 'Review Marketplace Item';
            break;

        case NOTIFICATION_TYPES.BUY_SELL_APPROVED:
            emailSubject = `🎉 Your Item "${metadata?.title || 'Product'}" is Live in Marketplace!`;
            bodyContent = `<p>Your marketplace listing has been approved and is now active for buyers in your community.</p>`;
            actionText = 'View Marketplace';
            break;

        // Host Verification
        case NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED:
            emailSubject = `[Admin Alert] New Host Verification Request`;
            bodyContent = `
                <p>A user has submitted identity verification documents to become a verified Host.</p>
                <div class="info-box">
                    <strong>Applicant:</strong> ${metadata?.full_name || metadata?.name || 'Applicant'}<br/>
                    <strong>Email:</strong> ${metadata?.email || ''}
                </div>
            `;
            actionText = 'Review Host Application';
            break;

        case NOTIFICATION_TYPES.HOST_APPROVED:
            emailSubject = `🎉 Welcome to NextKinLife Hosts!`;
            bodyContent = `
                <p>Congratulations! Your host verification has been approved.</p>
                <p>You now have full access to host spaces, organize community events, and post travel companions.</p>
            `;
            actionText = 'Go to Host Dashboard';
            break;

        // Connection Requests
        case NOTIFICATION_TYPES.CONNECTION_REQUEST_RECEIVED:
            emailSubject = `🤝 New Connection Request from ${metadata?.requesterName || 'a Member'}`;
            bodyContent = `
                <p><strong>${metadata?.requesterName || 'A member'}</strong> sent you a connection request regarding <em>"${metadata?.itemTitle || 'your listing'}"</em>.</p>
                <p>Accept the request to unlock contact numbers, emails, and direct social messaging.</p>
            `;
            actionText = 'Respond to Request';
            break;

        case NOTIFICATION_TYPES.CONNECTION_REQUEST_ACCEPTED:
            emailSubject = `🎉 Connection Request Accepted!`;
            bodyContent = `
                <p>Great news! Your connection request has been accepted.</p>
                <p>Direct contact details (Phone, WhatsApp, Email, Socials) are now unlocked in your dashboard.</p>
            `;
            actionText = 'View Contact Details';
            break;

        // Default / System / Contact / Job
        default:
            emailSubject = `[NextKinLife] ${title || 'Notification'}`;
            bodyContent = `<p>${message || ''}</p>`;
            actionText = 'View Details';
            break;
    }

    const html = wrapEmailHtml({
        title: title || emailSubject,
        preheader: emailPreheader,
        bodyContent,
        actionUrl,
        actionText
    });

    return {
        subject: emailSubject,
        html,
        text: `${title}\n\n${message}\n\nLink: ${actionUrl || 'https://nextkinlife.com'}`
    };
}
