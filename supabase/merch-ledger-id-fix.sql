-- ============================================================
-- Fix: merch_orders.ledger_entry_id was BIGINT, but finance_ledger.id
-- is a UUID. Approving a merchandise order posted the income row, then
-- failed on the write back, so no order ever reached "verified" and a
-- duplicate ledger row was left behind on every attempt.
--
-- Run this ONCE in the Supabase SQL editor.
-- ============================================================

-- 1. Nothing was ever stored in this column (every write failed), so the
--    type change is safe.
ALTER TABLE merch_orders
  ALTER COLUMN ledger_entry_id TYPE UUID USING NULL;

-- 2. Look at the stray income rows left by the failed approvals.
--    Check the list, then run the delete below.
-- SELECT id, date, description, amount, created_at
--   FROM finance_ledger
--  WHERE description LIKE 'Merchandise order %'
--  ORDER BY created_at;

-- DELETE FROM finance_ledger WHERE description LIKE 'Merchandise order %';
