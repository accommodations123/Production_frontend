// NOTE: HttpOnly cookies cannot be cleared from JavaScript.
// This function only clears non-HttpOnly cookies (e.g., access_token set without HttpOnly).
// The backend logout endpoint (res.clearCookie) is the primary cookie-clearing mechanism.
export function clearAuthCookie() {
    const doc = window.document;
    // Production: clear with matching domain and attributes
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextkinlife.live; Secure; SameSite=Lax";
    // Localhost / exact-origin fallback (cookies set without domain attribute)
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
