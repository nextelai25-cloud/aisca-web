-- ============================================================
-- AISCA × Business Advisor Junior — NextUp applications
-- Run this ONCE in the Supabase SQL editor.
--
-- Public submissions are inserted by the aisca.lk service-role API
-- (bypasses RLS). The admin dashboard reads/updates them as a logged-in
-- (authenticated) user. Uploaded photos/documents live in the existing
-- `aisca-assets` storage bucket under nextup/.
-- ============================================================

CREATE TABLE IF NOT EXISTS nextup_applications (
  id               BIGSERIAL PRIMARY KEY,
  application_type TEXT NOT NULL CHECK (application_type IN ('self', 'referral')),
  status           TEXT NOT NULL DEFAULT 'new',  -- new | shortlisted | selected | rejected

  -- ── Referral path ──
  referrer_name          TEXT,
  referrer_phone         TEXT,
  referrer_relationship  TEXT,
  referred_founder_name  TEXT,
  referred_founder_phone TEXT,

  -- ── Self (founder) path ──
  full_name          TEXT,
  age                TEXT,
  school             TEXT,
  district           TEXT,
  whatsapp           TEXT,
  email              TEXT,
  social_handle      TEXT,
  venture_name       TEXT,
  venture_description TEXT,
  venture_start      TEXT,
  venture_stage      TEXT,
  role               TEXT,
  proud_achievement  TEXT,
  story              TEXT,
  work_links         TEXT,
  willing_podcast    BOOLEAN,
  consent            BOOLEAN,
  guardian_consent   BOOLEAN,

  -- uploads: [{ url, filename }]
  uploads          JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nextup_created ON nextup_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS nextup_status  ON nextup_applications (status);
CREATE INDEX IF NOT EXISTS nextup_type    ON nextup_applications (application_type);

ALTER TABLE nextup_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nextup admin read"   ON nextup_applications;
DROP POLICY IF EXISTS "nextup admin update" ON nextup_applications;
CREATE POLICY "nextup admin read"   ON nextup_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "nextup admin update" ON nextup_applications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
