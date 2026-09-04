# NextKinLife Security & Access Control Audit

**Security Audit Version**: 2.0.0 (Production Hardened)  
**Classification**: High Security / PII & Authorization Review  
**Evaluator**: Antigravity Security Engineering  

---

## 1. Vulnerability Findings & Threat Analysis

### SEC-01: Insecure Direct Object Reference (IDOR) via Frontend Query Parameters
- **Severity**: **CRITICAL**
- **Location**: `src/lib/adapters/routes/notifications.js` (line 69), `src/lib/adapters/notificationUtils.js` (line 380)
- **Vulnerability**:
  ```javascript
  const result = await getUserNotifications(queryParams?.userId || queryParams?.user_id, ...);
  ```
  The endpoint allowed callers to specify any target `userId` in query parameters. If an attacker supplied another user's UUID (e.g. `?userId=victim-uuid`), the application queried notifications for that user. Combined with permissive RLS, this exposed private user notifications, booking details, and contact messages.
- **Remediation**:
  Bound all user operations strictly to `auth.uid()` obtained directly from the verified Supabase JWT session via `getCurrentUserId()`. Any frontend-supplied `userId` parameter is discarded or validated to match `auth.uid()`.

---

### SEC-02: Blindly Permissive RLS Policies on `public.notifications`
- **Severity**: **CRITICAL**
- **Location**: `supabase_notifications_migration.sql` (lines 38, 48-53, 80-83)
- **Vulnerability**:
  ```sql
  GRANT ALL ON public.notifications TO anon, authenticated, service_role;
  
  CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT TO public
  USING (
      auth.uid() = recipient_id
      OR target_role = 'all'
      OR target_role = 'admin'
      OR recipient_id IS NULL
  );
  
  CREATE POLICY "Allow public insert notifications"
  ON public.notifications FOR INSERT TO public
  WITH CHECK (true);
  ```
  1. `GRANT ALL TO anon`: Anonymous unauthenticated visitors were granted SELECT, INSERT, UPDATE, and DELETE privileges.
  2. `OR target_role = 'admin' OR recipient_id IS NULL`: Any public user could view all administrator alerts, host applications, and identity verification submissions.
  3. `WITH CHECK (true)` on INSERT: Any user could forge notifications targeted at any other user, impersonate system administrators, or perform notification phishing.
- **Remediation**:
  1. Revoked table privileges from `anon`.
  2. Restricted `SELECT` to `auth.uid() = recipient_id OR public.is_admin()`.
  3. Restricted `UPDATE` and `DELETE` strictly to `auth.uid() = recipient_id OR public.is_admin()`.
  4. Restricted direct client INSERT. Notification creation must go through the secure `create_notification` RPC function where `actor_id` is stamped directly from `auth.uid()`, or by administrators.

---

### SEC-03: Hijacking of User Profile Address Column (`profiles.street_address`)
- **Severity**: **HIGH**
- **Location**: `src/lib/adapters/notificationUtils.js` (lines 134-159, 490-508)
- **Vulnerability**:
  The application parsed and updated `profiles.street_address` as a JSON string containing serialized notification objects. This polluted legitimate physical address data, risked exposing PII through profile-sharing surfaces, and introduced race conditions on user profiles.
- **Remediation**:
  Completely removed all reads, writes, and references to `profiles.street_address` from the notification system.

---

### SEC-04: Credential & API Key Boundary Protection
- **Severity**: **HIGH**
- **Location**: Frontend Environment / Vite Bundling
- **Audit Findings**:
  - `VITE_*` variables are bundled directly into frontend client assets and visible to anyone inspecting browser JavaScript.
  - Verified that `VITE_SUPABASE_ANON_KEY` is the only Supabase key exposed.
  - Confirmed that the Supabase `service_role` key is **NOT** present in frontend `.env` or bundled assets.
  - Transactional email provider keys (`RESEND_API_KEY`, etc.) are kept strictly in Supabase Edge Function environment secrets and never exposed to the frontend.

---

### SEC-05: Unchecked Cross-User Notification Deletion & Mutation
- **Severity**: **HIGH**
- **Location**: `src/lib/adapters/notificationUtils.js` (lines 557-732)
- **Vulnerability**:
  `deleteNotificationItem` and `markNotificationRead` called:
  ```javascript
  await supabase.from('notifications').delete().eq('id', notificationId);
  ```
  If notification IDs were guessed or exposed, any authenticated user could delete another user's notifications because no `recipient_id` check was enforced.
- **Remediation**:
  Enforced `auth.uid() = recipient_id` in database policies, and added explicit `.eq('recipient_id', currentUserId)` filter in all application queries.

---

## 2. Hardened Role-Based Access Control (RBAC) Specification

| Resource / Action | Anonymous (`anon`) | Authenticated User (`user`) | Verified Host (`host`) | Platform Admin (`admin`) | Service Role |
|---|:---:|:---:|:---:|:---:|:---:|
| **Read Personal Notifications** | ❌ Blocked | ✅ Allowed (`own rows`) | ✅ Allowed (`own rows`) | ✅ Allowed (`own rows`) | ✅ Full Access |
| **Read Admin Alerts** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed (`target_role='admin'`) | ✅ Full Access |
| **Mark Read (Own Notifications)**| ❌ Blocked | ✅ Allowed (`recipient_id=uid`) | ✅ Allowed (`recipient_id=uid`) | ✅ Allowed | ✅ Full Access |
| **Delete (Own Notifications)** | ❌ Blocked | ✅ Allowed (`recipient_id=uid`) | ✅ Allowed (`recipient_id=uid`) | ✅ Allowed | ✅ Full Access |
| **Create Arbitrary Notification**| ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | ✅ Full Access |
| **Send Admin Alert via RPC** | ❌ Blocked | ✅ Allowed (`actor_id=uid`) | ✅ Allowed (`actor_id=uid`) | ✅ Allowed | ✅ Full Access |
| **Inspect `email_jobs` Queue** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Allowed | ✅ Full Access |

---

## 3. Content Security Policy (CSP) & Network Headers

The Content Security Policy in `vercel.json` has been validated:
- **`default-src 'self'`**: Prevents unauthorized asset loading.
- **`connect-src`**: Restricts network calls to `'self'`, `https://*.supabase.co`, `wss://*.supabase.co`, and approved external APIs.
- **`frame-ancestors 'none'`**: Protects against clickjacking.
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing attacks.
- **`X-Frame-Options: DENY`**: Blocks iframe embedding.
