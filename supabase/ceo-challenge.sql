-- CEO Challenge (aisca.lk/ceochallenge) — run once in the Supabase SQL editor.
-- Only the API routes (service role) can read or write these tables.

create table if not exists public.ceo_players (
  id          uuid primary key default gen_random_uuid(),
  token       uuid not null unique default gen_random_uuid(),
  full_name   text not null,
  school      text not null,
  grade       text,
  email       text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);
create unique index if not exists ceo_players_email_key on public.ceo_players (lower(email));

create table if not exists public.ceo_runs (
  id           uuid primary key default gen_random_uuid(),
  player_id    uuid not null unique references public.ceo_players(id) on delete cascade, -- one official game each
  business     text not null check (business in ('cafe', 'restaurant', 'tech', 'fashion', 'hotel')),
  seed         integer not null,
  choices      smallint[] not null default '{}',
  status       text not null default 'playing' check (status in ('playing', 'finished')),
  valuation    bigint,
  started_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index if not exists ceo_runs_leaderboard_idx on public.ceo_runs (status, valuation desc);

alter table public.ceo_players enable row level security;
alter table public.ceo_runs    enable row level security;
-- No policies on purpose: anon and authenticated users get no direct access.
