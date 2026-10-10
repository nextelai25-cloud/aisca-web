-- ============================================================
-- RANGEELA '26 live ticket price (set by the chairman in admin.aisca.lk)
-- Run this ONCE in the Supabase SQL editor. Safe to re-run.
-- The public site, the register API, the cash desk and the emails all
-- read the price from this one row. Service role only (RLS closed).
-- ============================================================

CREATE TABLE IF NOT EXISTS rangeela_settings (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- always exactly one row
  online_price INTEGER NOT NULL DEFAULT 1200 CHECK (online_price BETWEEN 100 AND 100000),
  gate_price   INTEGER NOT NULL DEFAULT 1500 CHECK (gate_price BETWEEN 100 AND 100000),
  updated_by   TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO rangeela_settings (id, online_price, gate_price) VALUES (1, 1200, 1500) ON CONFLICT (id) DO NOTHING;
ALTER TABLE rangeela_settings ENABLE ROW LEVEL SECURITY;

-- Every price change, who made it and when.
CREATE TABLE IF NOT EXISTS rangeela_price_log (
  id           BIGSERIAL PRIMARY KEY,
  online_price INTEGER NOT NULL,
  gate_price   INTEGER NOT NULL,
  prev_online  INTEGER,
  prev_gate    INTEGER,
  changed_by   TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rangeela_price_log_time ON rangeela_price_log (changed_at DESC);
ALTER TABLE rangeela_price_log ENABLE ROW LEVEL SECURITY;
