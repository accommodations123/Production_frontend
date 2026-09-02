/**
 * Centralized Notification Types & Domain Event Constants
 * Used for both User/Host and Admin notifications.
 */

export const NOTIFICATION_TYPES = {
    // Property / Accommodation
    PROPERTY_SUBMITTED: 'PROPERTY_SUBMITTED',
    PROPERTY_APPROVED: 'PROPERTY_APPROVED',
    PROPERTY_REJECTED: 'PROPERTY_REJECTED',

    // Events
    EVENT_SUBMITTED: 'EVENT_SUBMITTED',
    EVENT_APPROVED: 'EVENT_APPROVED',
    EVENT_REJECTED: 'EVENT_REJECTED',

    // Marketplace / Buy-Sell
    BUY_SELL_SUBMITTED: 'BUY_SELL_SUBMITTED',
    BUY_SELL_APPROVED: 'BUY_SELL_APPROVED',
    BUY_SELL_REJECTED: 'BUY_SELL_REJECTED',

    // Host Application & Verification
    HOST_APPLICATION_SUBMITTED: 'HOST_APPLICATION_SUBMITTED',
    HOST_APPROVED: 'HOST_APPROVED',
    HOST_REJECTED: 'HOST_REJECTED',

    // People / Expert Advisory
    EXPERT_APPLICATION_SUBMITTED: 'EXPERT_APPLICATION_SUBMITTED',
    EXPERT_APPROVED: 'EXPERT_APPROVED',
    EXPERT_REJECTED: 'EXPERT_REJECTED',

    // Stay Requests
    STAY_REQUEST_SUBMITTED: 'STAY_REQUEST_SUBMITTED',
    STAY_REQUEST_APPROVED: 'STAY_REQUEST_APPROVED',
    STAY_REQUEST_REJECTED: 'STAY_REQUEST_REJECTED',

    // Travel / Trips
    TRIP_SUBMITTED: 'TRIP_SUBMITTED',
    TRIP_APPROVED: 'TRIP_APPROVED',
    TRIP_REJECTED: 'TRIP_REJECTED',

    // Connection Requests (P2P)
    CONNECTION_REQUEST_RECEIVED: 'CONNECTION_REQUEST_RECEIVED',
    CONNECTION_REQUEST_ACCEPTED: 'CONNECTION_REQUEST_ACCEPTED',
    CONNECTION_REQUEST_REJECTED: 'CONNECTION_REQUEST_REJECTED',

    // Career / Job Applications
    JOB_APPLICATION_SUBMITTED: 'JOB_APPLICATION_SUBMITTED',

    // Contact & Inquiries
    CONTACT_INQUIRY_RECEIVED: 'CONTACT_INQUIRY_RECEIVED',

    // General & System
    ADMIN_MESSAGE: 'ADMIN_MESSAGE',
    SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION'
};

export const NOTIFICATION_TARGET_ROLES = {
    USER: 'user',
    HOST: 'host',
    ADMIN: 'admin',
    ALL: 'all'
};

export const NOTIFICATION_CHANNELS = {
    IN_APP: 'in_app',
    EMAIL: 'email',
    BOTH: 'both'
};

export const NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const NOTIFICATION_CATEGORIES = {
    ALL: 'all',
    UNREAD: 'unread',
    PROPERTIES: 'properties',
    EVENTS: 'events',
    MARKETPLACE: 'marketplace',
    HOSTS: 'hosts',
    CONNECTIONS: 'connections',
    CAREERS: 'careers',
    SYSTEM: 'system'
};

/**
 * Maps a notification type to an appropriate default destination link
 */
export function getDefaultActionUrl(type, entityId) {
    switch (type) {
        case NOTIFICATION_TYPES.PROPERTY_SUBMITTED:
            return '/admin/properties';
        case NOTIFICATION_TYPES.PROPERTY_APPROVED:
            return entityId ? `/rooms/${entityId}` : '/account-v2?tab=listings';
        case NOTIFICATION_TYPES.PROPERTY_REJECTED:
            return '/account-v2?tab=listings';

        case NOTIFICATION_TYPES.EVENT_SUBMITTED:
            return '/admin/events';
        case NOTIFICATION_TYPES.EVENT_APPROVED:
            return entityId ? `/events/${entityId}` : '/account-v2?tab=events';
        case NOTIFICATION_TYPES.EVENT_REJECTED:
            return '/account-v2?tab=events';

        case NOTIFICATION_TYPES.BUY_SELL_SUBMITTED:
            return '/admin/buysell';
        case NOTIFICATION_TYPES.BUY_SELL_APPROVED:
            return entityId ? `/marketplace/${entityId}` : '/marketplace';
        case NOTIFICATION_TYPES.BUY_SELL_REJECTED:
            return '/account-v2?tab=buy-sell';

        case NOTIFICATION_TYPES.HOST_APPLICATION_SUBMITTED:
            return '/admin/hosts';
        case NOTIFICATION_TYPES.HOST_APPROVED:
            return '/account-v2';
        case NOTIFICATION_TYPES.HOST_REJECTED:
            return '/hosts';

        case NOTIFICATION_TYPES.EXPERT_APPLICATION_SUBMITTED:
            return '/admin/people';
        case NOTIFICATION_TYPES.EXPERT_APPROVED:
            return entityId ? `/people/${entityId}` : '/people';
        case NOTIFICATION_TYPES.EXPERT_REJECTED:
            return '/people/become';

        case NOTIFICATION_TYPES.STAY_REQUEST_SUBMITTED:
            return '/admin/stay-requests';
        case NOTIFICATION_TYPES.STAY_REQUEST_APPROVED:
        case NOTIFICATION_TYPES.STAY_REQUEST_REJECTED:
            return '/accommodations';

        case NOTIFICATION_TYPES.TRIP_SUBMITTED:
            return '/admin/travel';
        case NOTIFICATION_TYPES.TRIP_APPROVED:
            return '/travel';
        case NOTIFICATION_TYPES.TRIP_REJECTED:
            return '/account-v2?tab=trips';

        case NOTIFICATION_TYPES.CONNECTION_REQUEST_RECEIVED:
        case NOTIFICATION_TYPES.CONNECTION_REQUEST_ACCEPTED:
        case NOTIFICATION_TYPES.CONNECTION_REQUEST_REJECTED:
            return '/account-v2?tab=requests';

        case NOTIFICATION_TYPES.JOB_APPLICATION_SUBMITTED:
            return '/account-v2?tab=applications';

        case NOTIFICATION_TYPES.CONTACT_INQUIRY_RECEIVED:
            return '/contact';

        default:
            return '/account-v2';
    }
}
