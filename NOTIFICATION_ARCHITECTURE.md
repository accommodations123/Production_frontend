# NextKinLife Notification Architecture Specification

**Architecture Version**: 2.0.0 (Production Hardened)  
**Author**: Antigravity Engineering  
**Scope**: In-App Notifications, Transactional Email Queue, Realtime Delivery, Security Boundaries  

---

## 1. System Architecture Overview

NextKinLife follows a decoupled, database-authoritative notification architecture designed for zero data loss, sub-100ms UI responsiveness, and strict multi-tenant privacy.

```
                    ┌───────────────────────────────────┐
                    │       React / Vite Frontend       │
                    └─────────────────┬─────────────────┘
                                      │
                         1. Authenticated User Action
                         (e.g., Submit Property, Connection)
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │     Supabase PostgREST / RPC      │
                    │   auth.uid() Verified via JWT     │
                    └─────────────────┬─────────────────┘
                                      │
                        2. Fast Insert (Database-Authoritative)
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌───────────────────────────────┐           ┌─────────────────────────────────┐
│     public.notifications      │           │     Supabase Realtime (WAL)     │
│   Source of Truth (Persisted) │           │ Server-Filtered:                │
│   idempotency_key enforced    │           │ recipient_id=eq.<user-id>       │
└──────────────┬────────────────┘           └────────────────┬────────────────┘
               │                                             │
               │ 3. Instant UI Return                        │ 4. Immediate Push
               │                                             ▼
               ▼                            ┌─────────────────────────────────┐
┌───────────────────────────────┐           │     Notification Bell & Dropdown│
│       public.email_jobs       │           │   Live count & toast update     │
│   status: 'pending'           │           └─────────────────────────────────┘
└──────────────┬────────────────┘
               │
               │ 5. Asynchronous Server-Side Processing
               ▼
┌───────────────────────────────┐
│     Supabase Edge Function    │
│         ('send-email')        │
│   - Secret API Key (Server)   │
│   - Resend / Provider API     │
└──────────────┬────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
[ SUCCESS ]         [ FAILURE ]
status: 'sent'      status: 'retrying' / 'failed'
message_id logged   exponential backoff (max 3 retries)
```

---

## 2. Authoritative Single Source of Truth

The authoritative store for all notifications is **`public.notifications`** in Supabase PostgreSQL.

### Anti-Patterns Eliminated:
- ❌ **No Profile Column Misuse**: `profiles.street_address` is never read or written for notification state.
- ❌ **No LocalStorage Database**: Browser `localStorage` is not an authoritative store. Secondary keys (`nxt_notifications_*`, `nxt_admin_notifications`, `nxt_sent_emails`) are permanently decommissioned.
- ❌ **No Fake Fallback Notifications**: Empty states render genuine empty UI instead of fabricated welcome rows.

---

## 3. Database Schema

### 3.1 `public.notifications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Notification identifier (UUID or standard prefixed string) |
| `recipient_id` | `UUID` | `REFERENCES profiles(id) ON DELETE CASCADE` | Recipient user ID (NULL for admin broadcast alerts) |
| `actor_id` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Triggering user ID |
| `target_role` | `TEXT` | `DEFAULT 'user'` | `'user'`, `'admin'`, or `'all'` |
| `type` | `TEXT` | `NOT NULL` | Standardized notification type code |
| `title` | `TEXT` | `NOT NULL` | Notification title string |
| `message` | `TEXT` | `NOT NULL` | Notification description / body text |
| `entity_type` | `TEXT` | | Associated entity (`property`, `event`, `host`, etc.) |
| `entity_id` | `TEXT` | | Primary key of associated entity |
| `action_url` | `TEXT` | | Navigation target URL |
| `metadata` | `JSONB` | `DEFAULT '{}'::jsonb` | Structured auxiliary context |
| `channel` | `TEXT` | `DEFAULT 'both'` | `'in_app'`, `'email'`, or `'both'` |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Read receipt flag |
| `read_at` | `TIMESTAMPTZ`| | Timestamp when marked read |
| `email_status` | `TEXT` | `DEFAULT 'pending'` | `'pending'`, `'processing'`, `'sent'`, `'failed'`, `'skipped'` |
| `email_sent_at`| `TIMESTAMPTZ`| | Timestamp of email provider acceptance |
| `email_error`  | `TEXT` | | Error message from email dispatch failure |
| `retry_count`  | `INTEGER` | `DEFAULT 0` | Current retry attempt number |
| `idempotency_key`| `TEXT` | `UNIQUE` | Deduplication hash |
| `created_at`   | `TIMESTAMPTZ`| `DEFAULT now()` | Creation timestamp |
| `expires_at`   | `TIMESTAMPTZ`| | Optional expiration time |

### 3.2 `public.email_jobs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Job ID |
| `notification_id` | `TEXT` | `REFERENCES notifications(id) ON DELETE CASCADE` | Linked notification |
| `recipient_id` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Recipient user ID |
| `email` | `TEXT` | `NOT NULL` | Recipient email address |
| `subject` | `TEXT` | `NOT NULL` | Email subject line |
| `html_body` | `TEXT` | | Rendered HTML email body |
| `text_body` | `TEXT` | | Plaintext fallback |
| `status` | `TEXT` | `DEFAULT 'pending'` | `'pending'`, `'processing'`, `'sent'`, `'retrying'`, `'failed'` |
| `attempts` | `INTEGER` | `DEFAULT 0` | Attempt counter |
| `max_attempts` | `INTEGER` | `DEFAULT 3` | Maximum retry threshold |
| `next_attempt_at`| `TIMESTAMPTZ`| `DEFAULT now()` | Scheduled execution time |
| `provider_message_id`| `TEXT`| | Delivery ID returned by provider |
| `last_error` | `TEXT` | | Error details if failed |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Job queue timestamp |
| `processed_at` | `TIMESTAMPTZ`| | Completion timestamp |

---

## 4. Notification Event Matrix

| Event Code | Trigger Action | Recipient | In-App | Email | Target Role |
|---|---|---|:---:|:---:|---|
| `HOST_APPLICATION_SUBMITTED` | User applies for host verification | Admin | Yes | Yes | `admin` |
| `HOST_APPROVED` | Admin approves host application | User | Yes | Yes | `user` |
| `HOST_REJECTED` | Admin rejects host application | User | Yes | Yes | `user` |
| `PROPERTY_SUBMITTED` | Host creates accommodation listing | Admin | Yes | Yes | `admin` |
| `PROPERTY_APPROVED` | Admin approves accommodation | Host | Yes | Yes | `user` |
| `PROPERTY_REJECTED` | Admin rejects accommodation | Host | Yes | Yes | `user` |
| `EVENT_SUBMITTED` | Organizer submits community event | Admin | Yes | Yes | `admin` |
| `EVENT_APPROVED` | Admin approves event | Organizer | Yes | Yes | `user` |
| `EVENT_REJECTED` | Admin rejects event | Organizer | Yes | Yes | `user` |
| `BUY_SELL_SUBMITTED` | Seller submits marketplace listing | Admin | Yes | Yes | `admin` |
| `BUY_SELL_APPROVED` | Admin approves marketplace item | Seller | Yes | Yes | `user` |
| `BUY_SELL_REJECTED` | Admin rejects marketplace item | Seller | Yes | Yes | `user` |
| `CONNECTION_REQUEST_RECEIVED`| User sends connection request | Recipient | Yes | Yes | `user` |
| `CONNECTION_REQUEST_ACCEPTED`| Recipient accepts connection | Requester | Yes | Optional | `user` |
| `STAY_REQUEST_SUBMITTED` | Guest submits booking request | Host | Yes | Yes | `user` |
| `STAY_REQUEST_UPDATED` | Host accepts/declines stay | Guest | Yes | Yes | `user` |
| `JOB_APPLICATION_SUBMITTED` | Candidate applies for career | Admin & Applicant | Yes | Yes | `both` |
| `CONTACT_INQUIRY_RECEIVED` | Visitor submits contact form | Admin & Sender | Yes | Yes | `both` |

---

## 5. Transactional Email State Machine & Queue

```
   [ Create Notification ]
              │
              ▼
   ( Insert into email_jobs: status = 'pending' )
              │
              ▼
   ( Invocation of Edge Function: send-email )
              │
              ├───────────► [ Provider 200 OK ] ──► status = 'sent'
              │                                      provider_message_id recorded
              │
              └───────────► [ Provider Error / Timeout ]
                                      │
                                      ▼
                        attempts < max_attempts ?
                         /                     \
                      [ YES ]                [ NO ]
                         │                      │
                         ▼                      ▼
               status = 'retrying'     status = 'failed'
               next_attempt_at =       last_error recorded
               now() + 2^attempts * 1m (dead-letter state)
```

### Safety Guarantees:
1. **In-App Isolation**: An email provider failure **never** cancels or rolls back the in-app notification.
2. **No Synchronous UI Stalls**: Notification creation completes and returns to the frontend before email transmission finishes.
3. **No False Delivery Claims**: Email records are marked `'sent'` only when the provider HTTP API returns 200 OK with a valid message identifier.

---

## 6. Realtime Lifecycle & Reconnect Reconciliation

### 6.1 Filtered Channels
- **User Channel**:
  `channelName = 'user_notifications_' + userId`
  `filter: 'recipient_id=eq.' + userId`
  Listens for `INSERT` and `UPDATE`.
- **Admin Channel**:
  `channelName = 'admin_notifications'`
  `filter: 'target_role=eq.admin'`
  Listens for `INSERT` and `UPDATE`.

### 6.2 Connection State Management
The `RealtimeNotificationManager` handles states:
- `SUBSCRIBED`: Channel connected. Initial state verified.
- `CHANNEL_ERROR`: Channel disrupted. Cleans up old socket and initiates backoff reconnect.
- `TIMED_OUT`: Connection dropped due to network. Retries automatically.
- `CLOSED`: Unmounted or user logged out.

### 6.3 Reconnect Synchronization
Upon reconnecting (`status === 'SUBSCRIBED'` following a disconnection), the client automatically executes a silent background reconciliation query to fetch any notifications created during the disconnected window, guaranteeing zero missed notifications.

---

## 7. Idempotency & Deduplication

1. **Database-Level Constraint**:
   ```sql
   idempotency_key TEXT UNIQUE
   ```
   Deterministic key format:
   `idempotencyKey = `${recipient_id}_${type}_${entity_id}_${version}``
2. **In-Memory Guard**: Client-side 5-second burst protection prevents duplicate API triggers from accidental double-clicks or rapid effect re-renders.

---

## 8. Observability & Audit Logging

Structured telemetry is emitted for all notification lifecycle events:
- `[NOTIFICATION_CREATED] id=<id> type=<type> recipient=<recipient_id>`
- `[REALTIME_DISPATCH] id=<id> channel=<channel>`
- `[EMAIL_QUEUED] id=<job_id> notif=<id> to=<email>`
- `[EMAIL_SUCCESS] id=<job_id> provider_msg_id=<id>`
- `[EMAIL_ERROR] id=<job_id> error=<code> attempts=<n>`

PII (passwords, tokens, sensitive credentials) is strictly masked from all log outputs.
