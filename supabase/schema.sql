-- Live questionnaire schema for Mezitouch
-- Run this in the Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists survey_events (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Workplace Wellness Survey',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references survey_events(id) on delete cascade,
  code text unique not null,
  title text not null default 'Live Session',
  survey_pack text not null
    check (survey_pack in (
      'silent_struggle',
      'wake_up_call',
      'reality_recovery',
      'confidential_referral',
      'your_voice_matters'
    )),
  access_password text
    check (access_password is null or access_password ~ '^MT\d{6}$'),
  is_active boolean not null default true,
  active_question_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  section text not null default 'General',
  prompt text not null,
  question_type text not null default 'multiple_choice'
    check (question_type in ('multiple_choice', 'text')),
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_confidential boolean not null default false,
  allow_multiple boolean not null default false,
  allow_other boolean not null default false,
  created_at timestamptz not null default now()
);

alter table sessions
  add constraint sessions_active_question_id_fkey
  foreign key (active_question_id) references questions(id) on delete set null;

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  participant_id text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  unique (question_id, participant_id)
);

create index if not exists sessions_event_id_idx on sessions(event_id);
create index if not exists responses_session_id_idx on responses(session_id);
create index if not exists responses_question_id_idx on responses(question_id);
create index if not exists questions_session_id_idx on questions(session_id);

alter table survey_events enable row level security;
alter table sessions enable row level security;
alter table questions enable row level security;
alter table responses enable row level security;

-- No public anon policies. Server routes use the service role key.
