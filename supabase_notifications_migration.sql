-- ============================================================================
-- NextKinLife: PostgreSQL Notifications Schema & Row-Level Security Migration
-- Table: public.notifications
-- ============================================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_role TEXT DEFAULT 'user' CHECK (target_role IN ('user', 'host', 'admin', 'all')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'both')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
    email_sent_at TIMESTAMPTZ,
    email_error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ
);

-- 2. Indexes for Query Performance & Realtime Invalidation
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(entity_type, entity_id);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can read only their own notifications or broadcasts
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
USING (
    auth.uid() = recipient_id
    OR (
        target_role = 'admin' AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    )
    OR target_role = 'all'
);

-- 5. RLS Policy: Users can update read state of their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (
    auth.uid() = recipient_id
    OR (
        target_role = 'admin' AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    )
);

-- 6. RLS Policy: Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (
    auth.uid() = recipient_id
    OR (
        target_role = 'admin' AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    )
);

-- 7. RLS Policy: Allow authenticated insert
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- 8. Add notifications table to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
