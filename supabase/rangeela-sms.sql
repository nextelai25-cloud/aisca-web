-- RANGEELA '26: remember when the "here is your ticket" SMS went out.
-- Run this ONCE in the Supabase SQL editor. Safe to re-run.
ALTER TABLE rangeela_tickets ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMPTZ;
ALTER TABLE rangeela_tickets ADD COLUMN IF NOT EXISTS sms_error   TEXT;
