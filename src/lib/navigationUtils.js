export const getHostPath = (type, isAuthenticated) => {
    // If not authenticated at all, send to onboarding
    if (!isAuthenticated) return '/hosts';

    // If authenticated, we allow going to the specific hosting flow
    // The registration pages themselves handle skipping identity steps if data exists
    switch (type) {
        case 'property': return '/host/create';
        case 'event': return '/events/host';
        case 'travel': return '/travel';
        case 'marketplace': return '/marketplace?action=sell';
        case 'people':
        case 'expert': return '/people/become';
        default: return '/hosts';
    }
};
