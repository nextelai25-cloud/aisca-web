-- ============================================================
-- AISCA Supabase Security Hardening
-- Run this ONCE in the Supabase SQL Editor (Dashboard > SQL Editor)
--
-- WHY: The original policies were `FOR ALL USING (true)`, which
-- grants FULL read/write access to the public `anon` role — anyone
-- with the (public) anon key could read all members' personal data
-- (names, emails, DOBs, phone numbers), edit orders, or wipe tables.
--
-- The website only ever talks to the database through API routes
-- using the SERVICE ROLE key, which BYPASSES RLS entirely.
-- So we can safely remove all public policies: the site keeps
-- working, and direct anon access is denied.
-- ============================================================

-- Drop the wide-open policies
DROP POLICY IF EXISTS "Admin full access" ON associate_members;
DROP POLICY IF EXISTS "Admin full access" ON school_registrations;
DROP POLICY IF EXISTS "Admin full access" ON product_orders;
DROP POLICY IF EXISTS "Admin full access" ON finance_ledger;
DROP POLICY IF EXISTS "Admin full access" ON site_analytics;
DROP POLICY IF EXISTS "Admin full access" ON contact_messages;

-- Make sure RLS stays enabled (no policies = deny all for anon/authenticated)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE associate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- IdeaNet tables (created outside schema.sql) — lock these down too.
-- Wrapped in DO blocks so this script works even if a table doesn't exist.
DO $$ BEGIN
  EXECUTE 'ALTER TABLE ideanet_posts ENABLE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS "Public access" ON ideanet_posts';
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON ideanet_posts';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE ideanet_comments ENABLE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS "Public access" ON ideanet_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON ideanet_comments';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE ideanet_votes ENABLE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS "Public access" ON ideanet_votes';
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON ideanet_votes';
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Newsletter table used by /api/newsletter/subscribe but missing from schema.sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Optional but recommended: prevent duplicate votes at the DB level
DO $$ BEGIN
  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS ideanet_votes_unique_member_post ON ideanet_votes (post_id, membership_number)';
EXCEPTION WHEN undefined_table THEN NULL; END $$;
