-- ============================================================================
-- NextKinLife: Production Hardening & Notification Reliability Migration
-- Migration: 20260904_production_hardening.sql
-- Description:
--   1. Adds is_admin() helper for safe role authorization.
--   2. Enhances public.notifications with idempotency and composite indexes.
--   3. Creates public.email_jobs transactional queue table.
--   4. Enforces strict Row Level Security (RLS) and revokes public/anon access.
--   5. Creates public.create_notification() secure RPC function.
--   6. Ensures Realtime publication subscription for notifications.
-- ============================================================================

-- 1. Helper function: Check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' OR is_admin = true
     FROM public.profiles
     WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 2. Enhance public.notifications table schema
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS email_error TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Idempotency unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotency 
ON public.notifications(idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- Query performance composite indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
ON public.notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_admin_created 
ON public.notifications(target_role, created_at DESC) 
WHERE target_role = 'admin';

CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON public.notifications(recipient_id, is_read) 
WHERE is_read = FALSE;

-- 3. Create Transactional Email Queue Table (public.email_jobs)
CREATE TABLE IF NOT EXISTS public.email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id TEXT REFERENCES public.notifications(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT,
    text_body TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'retrying', 'skipped')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_attempt_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    provider_message_id TEXT,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status_next_attempt 
ON public.email_jobs(status, next_attempt_at) 
WHERE status IN ('pending', 'retrying');

CREATE INDEX IF NOT EXISTS idx_email_jobs_notification 
ON public.email_jobs(notification_id);

-- 4. Permissions & Grants
-- Revoke blind permissions from anonymous users
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.email_jobs FROM anon;

-- Grant authenticated users necessary DML
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.email_jobs TO authenticated;

-- Service role retains full access for Edge Functions and background workers
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.email_jobs TO service_role;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

-- 5.1 Notifications Table Policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated select notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public select notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (
    auth.uid() = recipient_id
    OR public.is_admin()
    OR (target_role = 'all' AND auth.role() = 'authenticated')
);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated update notifications" ON public.notifications;

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (
    auth.uid() = recipient_id
    OR public.is_admin()
)
WITH CHECK (
    auth.uid() = recipient_id
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated delete notifications" ON public.notifications;

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (
    auth.uid() = recipient_id
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Allow public insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;

CREATE POLICY "Allow authenticated insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
    -- Normal users can create notifications if they are the actor (e.g. self-alert or submitting to admin)
    (auth.uid() = actor_id AND (recipient_id = auth.uid() OR target_role = 'admin'))
    -- Admins can create any notification
    OR public.is_admin()
);

-- 5.2 Email Jobs Table Policies
DROP POLICY IF EXISTS "Users can view own email jobs" ON public.email_jobs;
CREATE POLICY "Users can view own email jobs"
ON public.email_jobs FOR SELECT
TO authenticated
USING (
    auth.uid() = recipient_id
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage email jobs" ON public.email_jobs;
CREATE POLICY "Admins can manage email jobs"
ON public.email_jobs FOR ALL
TO authenticated
USING (public.is_admin());

-- 6. Controlled Notification Creation RPC
CREATE OR REPLACE FUNCTION public.create_notification(
    p_recipient_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_channel TEXT DEFAULT 'both',
    p_target_role TEXT DEFAULT 'user',
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id UUID;
    v_notification_id TEXT;
    v_is_admin BOOLEAN;
    v_notif_record RECORD;
    v_recipient_email TEXT;
BEGIN
    v_actor_id := auth.uid();
    v_is_admin := public.is_admin();

    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create notifications';
    END IF;

    IF p_type IS NULL OR length(trim(p_type)) = 0 THEN
        RAISE EXCEPTION 'Notification type is required';
    END IF;
    IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
        RAISE EXCEPTION 'Notification title is required';
    END IF;

    -- Enforce authorization: non-admins cannot send arbitrary notifications to another user
    IF NOT v_is_admin AND p_target_role != 'admin' AND p_recipient_id IS DISTINCT FROM v_actor_id THEN
        -- Allow authorized interaction types if needed, otherwise require matching recipient
        IF p_type NOT IN ('CONNECTION_REQUEST_RECEIVED', 'STAY_REQUEST_SUBMITTED') THEN
            RAISE EXCEPTION 'Not authorized to send notifications to arbitrary recipients';
        END IF;
    END IF;

    -- Idempotency check: if key is provided and already exists, return existing
    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO v_notif_record FROM public.notifications WHERE idempotency_key = p_idempotency_key LIMIT 1;
        IF FOUND THEN
            RETURN to_jsonb(v_notif_record);
        END IF;
    END IF;

    v_notification_id := gen_random_uuid()::text;

    INSERT INTO public.notifications (
        id,
        recipient_id,
        actor_id,
        target_role,
        type,
        title,
        message,
        entity_type,
        entity_id,
        action_url,
        metadata,
        channel,
        is_read,
        email_status,
        idempotency_key,
        created_at
    ) VALUES (
        v_notification_id,
        CASE WHEN p_target_role = 'admin' THEN NULL ELSE p_recipient_id END,
        v_actor_id,
        p_target_role,
        p_type,
        p_title,
        p_message,
        p_entity_type,
        p_entity_id,
        p_action_url,
        p_metadata,
        p_channel,
        FALSE,
        CASE WHEN p_channel IN ('email', 'both') THEN 'pending' ELSE 'skipped' END,
        p_idempotency_key,
        timezone('utc'::text, now())
    ) RETURNING * INTO v_notif_record;

    -- If email channel is active, enqueue email job
    IF p_channel IN ('email', 'both') THEN
        IF p_target_role = 'admin' THEN
            v_recipient_email := 'admin@nextkinlife.com';
        ELSIF p_recipient_id IS NOT NULL THEN
            SELECT email INTO v_recipient_email FROM public.profiles WHERE id = p_recipient_id;
        END IF;

        IF v_recipient_email IS NOT NULL AND v_recipient_email LIKE '%@%' THEN
            INSERT INTO public.email_jobs (
                notification_id,
                recipient_id,
                email,
                subject,
                text_body,
                status,
                created_at
            ) VALUES (
                v_notification_id,
                p_recipient_id,
                v_recipient_email,
                p_title,
                p_message,
                'pending',
                timezone('utc'::text, now())
            );
        END IF;
    END IF;

    RETURN to_jsonb(v_notif_record);
END;
$$;

-- 7. Ensure Realtime Publication includes notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
