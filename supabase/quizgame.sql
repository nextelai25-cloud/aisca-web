-- ============================================================
-- AISCA QuizGame — real-time Mentimeter-style quiz (isolated module)
-- Run this ONCE in the Supabase SQL editor.
--
-- All reads/writes go through the service-role API routes (/api/quizgame/*).
-- Live sync uses Supabase Realtime *broadcast* channels (no table RLS needed),
-- so RLS stays fully closed here. Correct answers are NEVER exposed to phones
-- until a question is closed — that logic lives in the API.
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id                 BIGSERIAL PRIMARY KEY,
  join_code          TEXT NOT NULL,
  quiz_id            TEXT NOT NULL,
  host_token         TEXT NOT NULL,
  state              TEXT NOT NULL DEFAULT 'lobby',   -- see SessionState
  current_index      INT  NOT NULL DEFAULT -1,        -- -1 = lobby / not started
  question_started_at TIMESTAMPTZ,
  question_ends_at    TIMESTAMPTZ,
  settings           JSONB NOT NULL DEFAULT '{}'::jsonb,
  ended              BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active session may hold a given join code at a time.
CREATE UNIQUE INDEX IF NOT EXISTS quiz_sessions_active_code
  ON quiz_sessions (join_code) WHERE ended = false;

CREATE TABLE IF NOT EXISTS quiz_participants (
  id           BIGSERIAL PRIMARY KEY,
  session_id   BIGINT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  token        TEXT NOT NULL UNIQUE,        -- stored on the phone for reconnection
  nickname     TEXT NOT NULL,
  avatar_index INT  NOT NULL DEFAULT 0,
  score        NUMERIC NOT NULL DEFAULT 0,
  streak       INT NOT NULL DEFAULT 0,
  kicked       BOOLEAN NOT NULL DEFAULT false,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS quiz_participants_session ON quiz_participants (session_id);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id             BIGSERIAL PRIMARY KEY,
  session_id     BIGINT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  participant_id BIGINT NOT NULL REFERENCES quiz_participants(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  choice_index   INT,
  is_correct     BOOLEAN NOT NULL DEFAULT false,
  points         NUMERIC NOT NULL DEFAULT 0,
  response_ms    INT,
  answered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, participant_id, question_index)
);
CREATE INDEX IF NOT EXISTS quiz_answers_session_q ON quiz_answers (session_id, question_index);

ALTER TABLE quiz_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers       ENABLE ROW LEVEL SECURITY;
-- No policies: service-role API only. Live updates use Realtime broadcast.

-- Recompute every participant's cumulative score from their stored answers up to
-- a given question index. Idempotent, one round-trip — used on each answer reveal.
CREATE OR REPLACE FUNCTION recompute_quiz_scores(p_session BIGINT, p_upto INT)
RETURNS void LANGUAGE sql AS $$
  UPDATE quiz_participants p
  SET score = COALESCE(s.total, 0)
  FROM (
    SELECT participant_id, SUM(points) AS total
    FROM quiz_answers
    WHERE session_id = p_session AND question_index <= p_upto
    GROUP BY participant_id
  ) s
  WHERE p.id = s.participant_id AND p.session_id = p_session;
$$;
