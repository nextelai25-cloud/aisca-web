-- BS360 Quiz Grid — teams & matches layer.
-- Run this in the Supabase SQL editor AFTER bs360-quiz-grid.sql.
--
-- A "match" is one grid inside one classroom: two school teams compete on it,
-- and eventually one of them is marked the winner. The (classroom, grid) UNIQUE
-- constraint means the two teams for a grid can only be locked in once — the
-- first device to pick them wins the race, every other device just reads them.

CREATE TABLE IF NOT EXISTS bs360_matches (
  id BIGSERIAL PRIMARY KEY,
  classroom SMALLINT NOT NULL CHECK (classroom BETWEEN 1 AND 8),
  grid SMALLINT NOT NULL CHECK (grid BETWEEN 1 AND 6),
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  winner TEXT,                       -- NULL until an organiser marks the winner
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classroom, grid)
);

CREATE INDEX IF NOT EXISTS bs360_matches_classroom ON bs360_matches (classroom);

ALTER TABLE bs360_matches ENABLE ROW LEVEL SECURITY;
-- No policies: all access goes through the service-role API routes only.

-- Record which of the two teams answered each revealed box.
ALTER TABLE bs360_reveals ADD COLUMN IF NOT EXISTS team TEXT;
