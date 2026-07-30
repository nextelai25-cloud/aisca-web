-- ============================================================
-- BS360 Quiz Grid — Supabase schema
-- Run this ONCE in the Supabase SQL Editor (Dashboard > SQL Editor)
--
-- WHAT THIS IS FOR:
-- Powers /bs360quizgrid. Each of the 8 classrooms plays the same
-- 6 grids (16 boxes each: 4 subjects x 4 difficulties), but every
-- classroom has its OWN independent "revealed" state per grid.
-- A row in this table = "this exact box, in this exact classroom,
-- in this exact grid, has been opened" — permanently, so it can
-- never be re-opened, and it never affects any other classroom.
--
-- Follows the same pattern as the rest of AISCA's Supabase setup:
-- RLS is enabled with NO public policies. The site only ever talks
-- to this table through the /api/bs360/* routes using the
-- SERVICE ROLE key (see src/lib/supabase.ts), which bypasses RLS.
-- The public anon key has zero access to this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS bs360_reveals (
  id           BIGSERIAL PRIMARY KEY,
  classroom    SMALLINT NOT NULL CHECK (classroom BETWEEN 1 AND 8),
  grid         SMALLINT NOT NULL CHECK (grid BETWEEN 1 AND 6),
  box_index    SMALLINT NOT NULL CHECK (box_index BETWEEN 0 AND 15),
  revealed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classroom, grid, box_index)
);

-- Fast lookups when a device asks "what's already revealed for
-- Classroom 3 / Grid 2?"
CREATE INDEX IF NOT EXISTS bs360_reveals_lookup
  ON bs360_reveals (classroom, grid);

ALTER TABLE bs360_reveals ENABLE ROW LEVEL SECURITY;
-- No policies added on purpose — see note above. All access is via
-- the service-role API routes in src/app/api/bs360/.
