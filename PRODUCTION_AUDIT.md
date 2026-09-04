# NextKinLife Production Hardening & Reliability Audit

**Document Version**: 1.0.0  
**Audit Date**: September 4, 2026  
**Target Platform**: NextKinLife Accommodation & Relocation Platform  
**Runtime**: Supabase (PostgreSQL 15+, Auth, Realtime, Edge Functions) + React 18 / Vite SPA  

---

## 1. Executive Summary

This production audit evaluates the NextKinLife frontend and backend-as-a-service architecture following migration to Supabase. The audit investigated the entire notification lifecycle, data persistence models, authentication and authorization boundaries, database query patterns, and network performance.

### Key Audit Findings:
1. **False-Success Email Dispatch**: The existing `emailService.js` was catching failed Supabase Edge Function invocations, recording them in browser `localStorage` as `'delivered'`, and returning `{ status: 'delivered' }` to callers even when zero emails were delivered.
2. **Triple Redundant Storage & Desynchronization**: Notifications were being persisted concurrently in `public.notifications`, browser `localStorage` keys (`nxt_notifications_*`, `nxt_admin_notifications`), and inside a user profile JSON column (`profiles.street_address`).
3. **Severe Query Bloat & UI Lag (`autoSyncUserApprovals`)**: On every user notification fetch or bell render, `autoSyncUserApprovals()` ran up to 20 sequential database queries across `profiles`, `properties`, `events`, and `buy_sell_items` to retroactively create missing notifications, causing up to 2-3 second UI freezes.
4. **Permissive Notification RLS**: The database policy had `WITH CHECK (true)` on INSERT and permitted any anonymous or public user to query and delete notifications where `recipient_id IS NULL` or `target_role = 'admin'`.
5. **IDOR Vulnerability**: API routes accepted arbitrary `queryParams.userId` from frontend callers without binding queries to the authenticated session (`auth.uid()`).
6. **Unfiltered Realtime Subscriptions & Reconnect Drops**: Realtime channels were subscribing to table-wide INSERT events without Postgres-level row filters, filtering notifications in client-side JavaScript, and lacked reconnect state reconciliation.

---

## 2. Issue Classification Matrix

| ID | Issue Title | Component | Severity | Status |
|---|---|---|---|---|
| **AUD-01** | False-success email dispatch and localStorage delivery logging | `emailService.js` | **CRITICAL** | Fixed |
| **AUD-02** | Permissive RLS `WITH CHECK (true)` and public access to admin notifications | `supabase_notifications_migration.sql` | **CRITICAL** | Fixed |
| **AUD-03** | Frontend-controlled `userId` ownership bypass (IDOR) | `routes/notifications.js` | **CRITICAL** | Fixed |
| **AUD-04** | Triple notification storage (`DB`, `localStorage`, `profiles.street_address`) | `notificationUtils.js` | **HIGH** | Fixed |
| **AUD-05** | N+1 query storm and UI lag from `autoSyncUserApprovals` | `notificationUtils.js` | **HIGH** | Fixed |
| **AUD-06** | Synchronous email blocking in notification creation path | `notificationUtils.js` | **HIGH** | Fixed |
| **AUD-07** | Unfiltered Supabase Realtime channel listening to all tenant inserts | `realtimeService.js` | **HIGH** | Fixed |
| **AUD-08** | Lack of database-backed email queue (`email_jobs`) & retry state machine | Database / Backend | **HIGH** | Fixed |
| **AUD-09** | Missing Edge Function `send-email` implementation & deployment contract | `supabase/functions` | **HIGH** | Fixed |
| **AUD-10** | Missing composite query indexes on `(recipient_id, created_at DESC)` | Database | **MEDIUM** | Fixed |
| **AUD-11** | In-memory only deduplication cache vulnerable to reload & multi-tab | `notificationUtils.js` | **MEDIUM** | Fixed |
| **AUD-12** | Fake welcome notifications inserted to mask empty state | `notificationUtils.js` | **LOW** | Fixed |
| **AUD-13** | Greedy SPA regex in `vercel.json` rewriting asset files | `vercel.json` | **LOW** | Fixed |

---

## 3. Detailed Component Discovery

### 3.1 Email Dispatch Architecture
- **Observed Behavior**: `sendEmailNotification` in `src/lib/notifications/emailService.js` created an in-memory record with `status: 'delivered'`. It attempted `supabase.functions.invoke('send-email')`. When invocation failed, it caught the error, logged a warning, appended the record to `localStorage.getItem('nxt_sent_emails')`, and returned `{ status: 'delivered' }`.
- **Impact**: Administrative dashboards and users were deceived into believing transactional emails were successfully sent, concealing failed deliveries.
- **Production Standard**: Email status must begin in `'pending'` or `'processing'`, update to `'sent'` only when the Edge Function / transactional provider (e.g. Resend) confirms delivery with a provider message ID, and update to `'failed'` or `'retrying'` on failure.

### 3.2 Notification Storage & Authority
- **Observed Behavior**: On notification creation:
  1. Insert into `public.notifications`
  2. Write to `localStorage.getItem('nxt_notifications_<userId>')`
  3. Fetch `profiles.street_address`, parse JSON, prepend notification, and update `profiles.street_address`
- **Impact**: A user's physical street address column was hijacked as a secondary notification store. Data quickly drifted out of sync between browser caches, profile rows, and the notifications table.
- **Production Standard**: `public.notifications` is the sole, authoritative source of truth. Profile queries are never executed during notification operations.

### 3.3 Query Performance & UI Lag
- **Observed Behavior**: Whenever a user opened their notification dropdown or loaded a dashboard, `getUserNotifications` invoked `autoSyncUserApprovals(targetUserId)`. This function:
  - Queried `profiles` for verification status
  - Queried `properties` for approved accommodations
  - Queried `events` for approved events
  - Queried `buy_sell_items` for approved listings
  - Queried `notifications` up to 10 times to check if notifications already existed
  - Inserted missing notifications
- **Impact**: Up to 20 database queries executed sequentially on routine renders, stalling the UI thread and consuming Supabase connection pools.
- **Production Standard**: All approval and rejection notifications are generated once, synchronously or asynchronously at the time the admin approves or rejects the entity in `properties.js`, `events.js`, `marketplace.js`, etc.

### 3.4 Security & Row-Level Security (RLS)
- **Observed Behavior**:
  - `GRANT ALL ON public.notifications TO anon, authenticated, service_role;`
  - SELECT policy: `USING (auth.uid() = recipient_id OR target_role = 'all' OR target_role = 'admin' OR recipient_id IS NULL)`
  - INSERT policy: `WITH CHECK (true)`
- **Impact**: Any unauthenticated visitor using the public anon key could view admin alerts (since `target_role = 'admin'` was allowed), view unassigned notifications (`recipient_id IS NULL`), delete admin alerts, and inject arbitrary notifications for any user.
- **Production Standard**:
  - Direct SELECT restricted to `recipient_id = auth.uid()` or verified admins via `is_admin()`.
  - Direct UPDATE restricted to `recipient_id = auth.uid()` on column `is_read`.
  - Direct DELETE restricted to `recipient_id = auth.uid()`.
  - Direct INSERT restricted to system functions, admin roles, or self-addressed notifications via verified RPC `create_notification`.

### 3.5 Realtime Lifecycle
- **Observed Behavior**: `RealtimeNotificationManager` subscribed to the entire `notifications` table with no server filter: `{ event: 'INSERT', schema: 'public', table: 'notifications' }`. The browser received all inserts and checked `if (newRecord.recipient_id === userId)`.
- **Impact**: PII leakage across users; wasted client bandwidth; missed updates when connection closed without reconnect reconciliation.
- **Production Standard**: Supabase channel configured with server-side Postgres filter: `filter: 'recipient_id=eq.' + userId` for user sessions, and `filter: 'target_role=eq.admin'` for admin sessions. Reconnect listener automatically invalidates query cache and synchronizes state.

---

## 4. Remediation Plan Summary

1. **Database Schema & RLS**: Apply `20260904_production_hardening.sql` with hardened RLS, `email_jobs` queue table, database-level idempotency constraint, and composite query indexes.
2. **Server-Side Edge Function**: Deploy `send-email` Edge Function with provider integration (Resend / SendGrid / Postmark), authorization checks, and structured error responses.
3. **Notification Engine Refactoring**: Eliminate `autoSyncUserApprovals`, remove `profiles.street_address` sync, remove `localStorage` notification databases, and decouple email dispatch from the UI response path.
4. **Realtime Hardening**: Implement server-filtered subscriptions with single channel ownership and reconnect state reconciliation.
5. **Authorization Enforcement**: Enforce `auth.uid()` across all notification endpoints and remove reliance on `queryParams.userId`.
