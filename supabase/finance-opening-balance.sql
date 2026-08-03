-- ============================================================
-- Finance re-correction: open the bank at Rs. 5,000 (real values)
-- Run this ONCE in the Supabase SQL editor.
--
-- NOTHING IS DELETED. Every existing transaction is kept. We simply
-- flag all current entries as `adjusted` so they drop out of the live
-- Net Balance (the dashboard sums only adjusted = false), then add the
-- Rs. 5,000 opening balance. From here, every new entry — including
-- verified merchandise sales — counts as a real value.
-- ============================================================

-- 1. Keep, but exclude, all current entries from the live balance
UPDATE finance_ledger SET adjusted = true WHERE adjusted = false;

-- 2. Opening balance: bank account opened at Rs. 5,000
INSERT INTO finance_ledger (type, category, description, amount, date, cash_or_bank, fund, adjusted)
VALUES (
  'income',
  'Other Income',
  'Opening Balance: bank account opened (real values recorded from here)',
  5000,
  CURRENT_DATE,
  'bank',
  'General Fund',
  false
);

-- After this, Net Balance = 5,000 and will grow with every new real entry.
