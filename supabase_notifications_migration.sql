-- ============================================================================
-- NextKinLife: PostgreSQL Notifications Schema & Row-Level Security Migration
-- Table: public.notifications
-- ============================================================================

-- 1. Create Notifications Table (supports UUID and custom string IDs)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_role TEXT DEFAULT 'user',
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    channel TEXT DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    email_status TEXT DEFAULT 'pending',
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

-- 3. Grant Permissions
GRANT ALL ON public.notifications TO anon, authenticated, service_role;

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Users can read their own notifications, broadcasts, or admin notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO public
USING (
    auth.uid() = recipient_id
    OR target_role = 'all'
    OR target_role = 'admin'
    OR recipient_id IS NULL
);

-- 6. RLS Policy: Users & Admins can update read status
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO public
USING (
    auth.uid() = recipient_id
    OR target_role = 'admin'
    OR target_role = 'all'
);

-- 7. RLS Policy: Users & Admins can delete notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO public
USING (
    auth.uid() = recipient_id
    OR target_role = 'admin'
    OR target_role = 'all'
);

-- 8. RLS Policy: Allow public / authenticated insert of notifications
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public insert notifications" ON public.notifications;
CREATE POLICY "Allow public insert notifications"
ON public.notifications FOR INSERT
TO public
WITH CHECK (true);

-- 9. Add notifications table to Realtime publication (ignore error if already added)
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
