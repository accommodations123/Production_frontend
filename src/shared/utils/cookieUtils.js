// NOTE: HttpOnly cookies cannot be cleared from JavaScript.
// This function only clears non-HttpOnly cookies (e.g., access_token set without HttpOnly).
// The backend logout endpoint (res.clearCookie) is the primary cookie-clearing mechanism.
export function clearAuthCookie() {
    const doc = window.document;
    // Clear cookie on current host/origin
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=35.153.223.230; SameSite=Lax";
    doc.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
