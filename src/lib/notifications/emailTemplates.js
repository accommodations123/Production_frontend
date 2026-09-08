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
        case NOTIFICATION_TYPES.PROPERTY_SUBMITTED: {
            const isPropertyAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isPropertyAdmin ? title : `🏡 Your Accommodation "${metadata?.title || 'Listing'}" has been submitted!`;
            emailPreheader = isPropertyAdmin ? 'A new accommodation has been submitted for review.' : 'Your accommodation listing has been submitted for review.';
            bodyContent = isPropertyAdmin ? `
                <p>A new accommodation listing has been submitted and is awaiting administrative review.</p>
                <div class="info-box">
                    <strong>Listing:</strong> ${metadata?.title || 'Accommodation Space'}<br/>
                    <strong>Location:</strong> ${metadata?.city || ''}, ${metadata?.country || ''}<br/>
                    <strong>Host:</strong> ${metadata?.host_name || metadata?.email || 'Host'}
                </div>
            ` : `
                <p>Thank you for listing your space on NextKinLife! We have received your submission and it is currently being reviewed by our moderation team.</p>
                <div class="info-box">
                    <strong>Listing:</strong> ${metadata?.title || 'Accommodation Space'}<br/>
                    <strong>Location:</strong> ${metadata?.city || ''}, ${metadata?.country || ''}
                </div>
                <p>You will receive another notification once your listing is verified and live.</p>
            `;
            actionText = isPropertyAdmin ? 'Review Accommodation' : 'View Listing';
            break;
        }

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
        case NOTIFICATION_TYPES.EVENT_SUBMITTED: {
            const isEventAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isEventAdmin ? title : `📅 Your Event "${metadata?.title || 'Event'}" has been submitted!`;
            emailPreheader = isEventAdmin ? 'A new community event has been submitted for review.' : 'Your community event has been submitted for review.';
            bodyContent = isEventAdmin ? `
                <p>A new event has been submitted and requires administrative review.</p>
                <div class="info-box">
                    <strong>Event:</strong> ${metadata?.title || 'Community Event'}<br/>
                    <strong>Date:</strong> ${metadata?.start_date || 'Upcoming'}<br/>
                    <strong>Organizer:</strong> ${metadata?.organizer_name || metadata?.organizer_email || 'Organizer'}
                </div>
            ` : `
                <p>Thank you for submitting your event on NextKinLife! We have received your event details and they are currently under review.</p>
                <div class="info-box">
                    <strong>Event:</strong> ${metadata?.title || 'Community Event'}<br/>
                    <strong>Date:</strong> ${metadata?.start_date || 'Upcoming'}
                </div>
                <p>You will receive another notification once your event is approved and published.</p>
            `;
            actionText = isEventAdmin ? 'Review Event' : 'View Event';
            break;
        }

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
        case NOTIFICATION_TYPES.BUY_SELL_SUBMITTED: {
            const isMarketAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isMarketAdmin ? title : `🛍️ Your Item "${metadata?.title || 'Product'}" has been submitted!`;
            emailPreheader = isMarketAdmin ? 'A user listed a new item for sale in the marketplace.' : 'Your marketplace item has been submitted for review.';
            bodyContent = isMarketAdmin ? `
                <p>A user listed a new item for sale in the marketplace.</p>
                <div class="info-box">
                    <strong>Item:</strong> ${metadata?.title || 'Product'}<br/>
                    <strong>Price:</strong> ${metadata?.currency || 'INR'} ${metadata?.price || ''}
                </div>
            ` : `
                <p>Your listing has been submitted to the NextKinLife marketplace and is currently being reviewed.</p>
                <div class="info-box">
                    <strong>Item:</strong> ${metadata?.title || 'Product'}<br/>
                    <strong>Price:</strong> ${metadata?.currency || 'INR'} ${metadata?.price || ''}
                </div>
                <p>You will receive another notification once your item is active and visible to buyers.</p>
            `;
            actionText = isMarketAdmin ? 'Review Marketplace Item' : 'View Marketplace';
            break;
        }

        case NOTIFICATION_TYPES.BUY_SELL_APPROVED:
            emailSubject = `🎉 Your Item "${metadata?.title || 'Product'}" is Live in Marketplace!`;
            bodyContent = `<p>Your marketplace listing has been approved and is now active for buyers in your community.</p>`;
            actionText = 'View Marketplace';
            break;

        // Host Verification
        case NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED: {
            const isHostAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isHostAdmin ? title : `🛡️ Host Application Received`;
            emailPreheader = isHostAdmin ? 'A user has submitted identity verification documents.' : 'Your host verification application is under review.';
            bodyContent = isHostAdmin ? `
                <p>A user has submitted identity verification documents to become a verified Host.</p>
                <div class="info-box">
                    <strong>Applicant:</strong> ${metadata?.full_name || metadata?.name || 'Applicant'}<br/>
                    <strong>Email:</strong> ${metadata?.email || ''}
                </div>
            ` : `
                <p>We have received your host verification application along with your verification documents.</p>
                <p>Our team is reviewing your details and will update your host verification status shortly.</p>
            `;
            actionText = isHostAdmin ? 'Review Host Application' : 'View Applications';
            break;
        }

        case NOTIFICATION_TYPES.HOST_APPROVED:
            emailSubject = `🎉 Welcome to NextKinLife Hosts!`;
            emailPreheader = 'Your host identity verification has been approved.';
            bodyContent = `
                <p>Congratulations! Your host verification has been approved by NextKinLife admin.</p>
                <p>You now have full access to list spaces, organize community events, and post travel companion plans.</p>
            `;
            actionText = 'Go to Host Dashboard';
            break;

        case NOTIFICATION_TYPES.HOST_REJECTED:
            emailSubject = `⚠️ NextKinLife Host Verification Status Update`;
            emailPreheader = 'Your host verification application requires additional documents.';
            bodyContent = `
                <p>Your host verification application was reviewed by our moderation team and requires additional verification documents.</p>
                ${metadata?.rejection_reason ? `<div class="reason-box"><strong>Feedback:</strong> ${metadata.rejection_reason}</div>` : '<div class="reason-box">Please provide government-issued ID and address documentation to complete verification.</div>'}
                <p>You can update and submit the required documents through your host onboarding dashboard.</p>
            `;
            actionText = 'Review Host Application';
            break;

        // People / Expert / Advisor
        case NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED: {
            const isExpertAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isExpertAdmin ? title : `🎓 Professional Advisor Application Received`;
            emailPreheader = isExpertAdmin ? 'A member applied to be listed as a Professional Advisor.' : 'Your advisor profile application is under review.';
            bodyContent = isExpertAdmin ? `
                <p>A member has submitted an application to become a verified Professional Advisor.</p>
                <div class="info-box">
                    <strong>Applicant:</strong> ${metadata?.full_name || metadata?.name || 'Applicant'}<br/>
                    <strong>Profession:</strong> ${metadata?.profession || metadata?.headline || 'Advisor'}<br/>
                    <strong>Email:</strong> ${metadata?.email || ''}
                </div>
            ` : `
                <p>Thank you for submitting your profile to become a verified Professional Advisor on NextKinLife.</p>
                <p>Our team is currently reviewing your background and qualifications. You will receive another notification once your advisor profile is live.</p>
            `;
            actionText = isExpertAdmin ? 'Review Advisor' : 'View Directory';
            break;
        }

        case NOTIFICATION_TYPES.EXPERT_APPROVED:
            emailSubject = `🎉 Your Advisor Profile is Approved & Live!`;
            emailPreheader = 'Your professional profile is now verified and active in the People directory.';
            bodyContent = `
                <p>Congratulations <strong>${metadata?.full_name || metadata?.name || 'Advisor'}</strong>!</p>
                <p>Your professional advisor profile has been approved by the NextKinLife moderation team and is now live in the People directory.</p>
                <div class="info-box">
                    <strong>Profession:</strong> ${metadata?.profession || metadata?.headline || 'Professional Advisor'}<br/>
                    <strong>Status:</strong> Verified & Live in Community Directory
                </div>
                <p>Community members and expatriates can now discover your expertise and contact you directly for consultations.</p>
            `;
            actionText = 'View Live Profile';
            break;

        case NOTIFICATION_TYPES.EXPERT_REJECTED:
            emailSubject = `⚠️ Update Regarding Your Advisor Profile`;
            emailPreheader = 'Your advisor profile requires updates before publication.';
            bodyContent = `
                <p>Your professional advisor profile was reviewed by our moderation team and requires revisions before it can be published.</p>
                ${metadata?.rejection_reason ? `<div class="reason-box"><strong>Feedback:</strong> ${metadata.rejection_reason}</div>` : '<div class="reason-box">Please ensure your profile has a professional photo, detailed headline, clear bio, and verified consultation services.</div>'}
                <p>You can review and update your profile details anytime.</p>
            `;
            actionText = 'Update Advisor Profile';
            break;

        // Travel / Trips
        case NOTIFICATION_TYPES.TRIP_SUBMITTED: {
            const isTripAdmin = Boolean(title && title.includes('[ADMIN ALERT]'));
            emailSubject = isTripAdmin ? title : `🚗 Travel Companion Plan Submitted!`;
            bodyContent = isTripAdmin ? `
                <p>A new travel companion plan has been submitted for review.</p>
                <div class="info-box">
                    <strong>Destination:</strong> ${metadata?.destination || ''}<br/>
                    <strong>Traveler:</strong> ${metadata?.host_name || 'Traveler'}
                </div>
            ` : `
                <p>Your travel companion plan has been submitted and is currently being reviewed by our moderation team.</p>
            `;
            actionText = isTripAdmin ? 'Review Travel Plan' : 'View Trips';
            break;
        }

        case NOTIFICATION_TYPES.TRIP_APPROVED:
            emailSubject = `🎉 Your Travel Plan is Live!`;
            emailPreheader = 'Your travel companion plan is now visible in the Travel Community.';
            bodyContent = `
                <p>Great news! Your travel plan to <strong>${metadata?.destination || 'your destination'}</strong> has been approved and is now live in the NextKinLife Travel Community.</p>
            `;
            actionText = 'View Travel Plan';
            break;

        case NOTIFICATION_TYPES.TRIP_REJECTED:
            emailSubject = `⚠️ Update Regarding Your Travel Plan`;
            bodyContent = `
                <p>Your travel companion plan requires updates before it can be published.</p>
                ${metadata?.rejection_reason ? `<div class="reason-box"><strong>Feedback:</strong> ${metadata.rejection_reason}</div>` : ''}
            `;
            actionText = 'Review Travel Plan';
            break;

        // Stay Requests
        case NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED:
            emailSubject = `🏡 Stay Request Submitted`;
            bodyContent = `<p>Your accommodation stay request has been submitted and is awaiting host confirmation.</p>`;
            actionText = 'View Request';
            break;

        case NOTIFICATION_TYPES.STAY_REQUEST_APPROVED:
            emailSubject = `🎉 Stay Request Approved!`;
            bodyContent = `<p>Your stay request has been approved by the host.</p>`;
            actionText = 'View Accommodations';
            break;

        case NOTIFICATION_TYPES.STAY_REQUEST_REJECTED:
            emailSubject = `⚠️ Stay Request Update`;
            bodyContent = `<p>Your stay request could not be accommodated at this time.</p>`;
            actionText = 'Find Other Spaces';
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
