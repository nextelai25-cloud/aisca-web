-- ============================================================
-- AISCA Merchandise Orders (the /shop order system)
-- Run this ONCE in the Supabase SQL editor.
--
-- Public orders are inserted by the aisca.lk service-role API
-- (bypasses RLS). The admin dashboard (admin.aisca.lk) reads and
-- updates them as a logged-in (authenticated) user, so we add
-- authenticated SELECT/UPDATE policies to match the other admin
-- tables. Receipts are stored in the existing `aisca-assets`
-- storage bucket under merch-receipts/.
-- ============================================================

CREATE TABLE IF NOT EXISTS merch_orders (
  id              BIGSERIAL PRIMARY KEY,
  order_number    TEXT NOT NULL UNIQUE,

  -- customer
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  school_name      TEXT,
  customer_phone   TEXT NOT NULL,        -- WhatsApp number
  delivery_contact TEXT,                 -- person to call on delivery
  customer_address TEXT NOT NULL,

  -- items: [{ product_id, name, size, quantity, unit_price, line_total }]
  items         JSONB   NOT NULL,
  items_total   NUMERIC NOT NULL,
  delivery_fee  NUMERIC NOT NULL DEFAULT 250,
  total_amount  NUMERIC NOT NULL,

  -- payment receipt
  receipt_url       TEXT,
  receipt_filename  TEXT,

  notes           TEXT,

  -- workflow
  payment_status  TEXT NOT NULL DEFAULT 'pending',  -- pending | verified | rejected
  order_status    TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | shipped | delivered | cancelled

  -- bank ledger bookkeeping (prevents double-posting on re-approve)
  ledger_posted   BOOLEAN NOT NULL DEFAULT false,
  ledger_entry_id BIGINT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS merch_orders_created ON merch_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS merch_orders_payment ON merch_orders (payment_status);

ALTER TABLE merch_orders ENABLE ROW LEVEL SECURITY;

-- Logged-in admins can read every order and update its status.
-- (Inserts come only from the service-role API, which bypasses RLS.)
DROP POLICY IF EXISTS "merch_orders admin read"   ON merch_orders;
DROP POLICY IF EXISTS "merch_orders admin update" ON merch_orders;
CREATE POLICY "merch_orders admin read"   ON merch_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "merch_orders admin update" ON merch_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Merchandise "bank" opening balance is a constant (Rs. 5,000) applied in the
-- admin UI: balance = 5000 + SUM(total_amount) of payment_status = 'verified'.
-- No extra table needed.
