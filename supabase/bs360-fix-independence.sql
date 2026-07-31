-- ============================================================
-- BS360 — FIX classroom independence + clear test data
--
-- Run this ONCE in the Supabase SQL Editor.
--
-- WHY: if an older version of bs360_reveals was created with a UNIQUE
-- rule that did NOT include `classroom` (e.g. UNIQUE(grid, box_index)),
-- then opening a box in one classroom wrongly marks it "used" in every
-- other classroom. This script forces the correct rule:
--     UNIQUE (classroom, grid, box_index)
-- so each classroom's grid is fully independent.
-- ============================================================

-- STEP 1 (optional) — see what unique rules currently exist.
-- Run just this SELECT first if you want to inspect before changing.
SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'bs360_reveals'::regclass AND contype = 'u';

-- STEP 2 — drop EVERY unique rule on bs360_reveals, then add the correct one.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'bs360_reveals'::regclass AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE bs360_reveals DROP CONSTRAINT %I', c.conname);
  END LOOP;

  ALTER TABLE bs360_reveals
    ADD CONSTRAINT bs360_reveals_classroom_grid_box_key
    UNIQUE (classroom, grid, box_index);
END $$;

-- STEP 3 — wipe any test plays so every classroom starts clean.
DELETE FROM bs360_reveals;
DELETE FROM bs360_matches;

-- STEP 4 — verify the correct rule is now in place (should show
-- a definition containing: UNIQUE (classroom, grid, box_index)).
SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'bs360_reveals'::regclass AND contype = 'u';
