-- ============================================================
-- NEXTUP editions
-- Run this ONCE in the Supabase SQL editor.
-- Adds an `edition` column so NEXTUP 01 and NEXTUP 02 applications
-- can be told apart. Everything already in the table is NEXTUP 01.
-- New applications from aisca.lk/nextup02 are saved as '02'.
-- ============================================================

ALTER TABLE nextup_applications ADD COLUMN IF NOT EXISTS edition TEXT NOT NULL DEFAULT '01';
CREATE INDEX IF NOT EXISTS nextup_edition ON nextup_applications (edition);
