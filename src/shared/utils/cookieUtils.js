// NOTE: HttpOnly cookies cannot be cleared from JavaScript.
// This function only clears non-HttpOnly cookies (e.g., access_token set without HttpOnly).
export function clearAuthCookie() {
    const doc = window.document;
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextkinlife.live; Secure; SameSite=Strict";
}
