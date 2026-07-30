-- ============================================================================
-- AISCA — Security hardening + missing-table definitions
-- Run this in the Supabase SQL editor for the production project.
-- Safe to run on an existing database: uses IF NOT EXISTS / DROP POLICY IF EXISTS
-- and never drops data.
-- ============================================================================

-- ── 1. SECURITY: remove the wide-open "USING (true)" policies ────────────────
-- The app only ever talks to the database through the service-role key
-- (see src/lib/supabase.ts), which BYPASSES Row Level Security. The old
-- "Admin full access ... USING (true)" policies granted full read/write to the
-- PUBLIC anon role, so anyone with the (public) anon key could read every
-- member's name, email, DOB and phone. Dropping them makes RLS deny-by-default
-- for anon/authenticated while the server keeps full access via service_role.

DROP POLICY IF EXISTS "Admin full access" ON associate_members;
DROP POLICY IF EXISTS "Admin full access" ON school_registrations;
DROP POLICY IF EXISTS "Admin full access" ON product_orders;
DROP POLICY IF EXISTS "Admin full access" ON finance_ledger;
DROP POLICY IF EXISTS "Admin full access" ON site_analytics;
DROP POLICY IF EXISTS "Admin full access" ON contact_messages;

-- Make sure RLS stays ON for every sensitive table (deny-all for public).
ALTER TABLE associate_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ledger        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages      ENABLE ROW LEVEL SECURITY;

-- ── 2. Missing tables that the code already uses in production ───────────────
-- These exist in the live DB but were not in schema.sql. Defined here with
-- IF NOT EXISTS so a fresh environment can be stood up from source.

-- Newsletter subscribers (used by /api/newsletter/subscribe, footer form)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- IdeaNet posts (used by /api/ideanet/posts, vote, delete-post)
CREATE TABLE IF NOT EXISTS ideanet_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_number TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_school TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  hot_score DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ideanet_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ideanet_posts_hot  ON ideanet_posts (hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_ideanet_posts_new  ON ideanet_posts (created_at DESC);

-- IdeaNet comments (used by /api/ideanet/comments)
CREATE TABLE IF NOT EXISTS ideanet_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES ideanet_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES ideanet_comments(id) ON DELETE CASCADE,
  membership_number TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_school TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ideanet_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ideanet_comments_post ON ideanet_comments (post_id);

-- IdeaNet votes (used by /api/ideanet/vote) — one vote per member per post
CREATE TABLE IF NOT EXISTS ideanet_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES ideanet_posts(id) ON DELETE CASCADE,
  membership_number TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, membership_number)
);
ALTER TABLE ideanet_votes ENABLE ROW LEVEL SECURITY;

-- ── 3. Data-integrity helpers ───────────────────────────────────────────────
-- Lookup index on email. NOTE: left non-unique on purpose so this migration
-- can't fail on existing duplicate/test rows. If you want to ENFORCE one
-- account per email, first de-duplicate, then create a UNIQUE index instead:
--   CREATE UNIQUE INDEX idx_associate_members_email_unique
--     ON associate_members (lower(email));
CREATE INDEX IF NOT EXISTS idx_associate_members_email
  ON associate_members (lower(email));
