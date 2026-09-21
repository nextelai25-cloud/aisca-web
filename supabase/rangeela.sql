-- ============================================================
-- RANGEELA '26 ticketing (aisca.lk/rangeela26 + admin dashboard)
-- Run this ONCE in the Supabase SQL editor. Safe to re-run.
--
-- Every read and write goes through server API routes that use the
-- service role key (the public site and admin.aisca.lk), so RLS stays
-- fully closed here: no public or authenticated policies at all.
-- Receipts live in the existing `aisca-assets` bucket under
-- rangeela-receipts/.
-- ============================================================

CREATE TABLE IF NOT EXISTS rangeela_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number    TEXT NOT NULL UNIQUE,              -- RG26-12345, shown to the buyer right away

  -- attendee
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  whatsapp         TEXT NOT NULL,
  school           TEXT NOT NULL,
  al_batch         TEXT NOT NULL,
  nic              TEXT NOT NULL,                     -- NIC or school ID, as typed (uppercased)
  nic_norm         TEXT NOT NULL,                     -- letters and digits only, for duplicate checks
  nic_is_nic       BOOLEAN NOT NULL DEFAULT false,    -- true when it looks like a real NIC

  -- payment
  payment_method   TEXT NOT NULL DEFAULT 'bank' CHECK (payment_method IN ('bank', 'cash')),
  amount           NUMERIC NOT NULL DEFAULT 1200,
  receipt_url      TEXT,
  receipt_filename TEXT,
  source           TEXT NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'cash_desk')),
  notes            TEXT,

  -- workflow
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason    TEXT,
  qr_token         TEXT UNIQUE,                       -- secret inside the QR, set on approval
  approved_by      TEXT,
  approved_at      TIMESTAMPTZ,
  ticket_emailed_at TIMESTAMPTZ,
  email_error      TEXT,
  created_by       TEXT,                              -- admin email for cash desk sales

  -- entrance
  checked_in_at    TIMESTAMPTZ,
  checked_in_by    TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rangeela_tickets_created ON rangeela_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS rangeela_tickets_status  ON rangeela_tickets (status);
CREATE INDEX IF NOT EXISTS rangeela_tickets_email   ON rangeela_tickets (lower(email));

-- One live ticket per NIC. Rejected tickets don't count, so a student
-- whose receipt was rejected can submit again with the same NIC.
CREATE UNIQUE INDEX IF NOT EXISTS rangeela_tickets_one_per_nic
  ON rangeela_tickets (nic_norm)
  WHERE status <> 'rejected' AND nic_is_nic;

ALTER TABLE rangeela_tickets ENABLE ROW LEVEL SECURITY;

-- Every scan at the gate is logged, including failed ones.
CREATE TABLE IF NOT EXISTS rangeela_scans (
  id          BIGSERIAL PRIMARY KEY,
  ticket_id   UUID REFERENCES rangeela_tickets(id) ON DELETE SET NULL,
  code        TEXT,                                   -- first characters of what was scanned
  result      TEXT NOT NULL,                          -- admitted | already_used | not_approved | invalid
  scanned_by  TEXT,
  scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rangeela_scans_time ON rangeela_scans (scanned_at DESC);
ALTER TABLE rangeela_scans ENABLE ROW LEVEL SECURITY;

-- ── Admin roles for the organising committee and the cash desk ──
-- admin_users.role had a fixed CHECK list. Replace it with one that
-- also allows the two Rangeela roles.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'admin_users'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE admin_users DROP CONSTRAINT %I', c.conname);
  END LOOP;
  ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN (
    'chairman', 'deputy_chairman', 'cfo', 'marketing_manager', 'co_secretary',
    'administration_manager', 'rangeela_oc', 'rangeela_cash'
  )) NOT VALID;  -- NOT VALID: never fails on any older rows already in the table
END $$;
