-- Run this if you already created the database from an older schema.sql

create table if not exists survey_events (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Workplace Wellness Survey',
  created_at timestamptz not null default now()
);

alter table questions
  add column if not exists section text not null default 'General';

alter table questions
  add column if not exists is_confidential boolean not null default false;

alter table sessions
  add column if not exists event_id uuid references survey_events(id) on delete cascade;

alter table sessions
  add column if not exists survey_pack text;

alter table sessions
  add column if not exists access_password text;

-- Backfill a default event for any existing sessions missing event_id
insert into survey_events (title)
select 'Migrated Wellness Survey'
where exists (
  select 1 from sessions where event_id is null
)
and not exists (
  select 1 from survey_events where title = 'Migrated Wellness Survey'
);

update sessions
set
  event_id = (select id from survey_events where title = 'Migrated Wellness Survey' limit 1),
  survey_pack = coalesce(survey_pack, 'silent_struggle')
where event_id is null;

alter table sessions
  alter column event_id set not null;

alter table sessions
  alter column survey_pack set not null;

alter table sessions drop constraint if exists sessions_survey_pack_check;
alter table sessions add constraint sessions_survey_pack_check
  check (survey_pack in (
    'silent_struggle',
    'wake_up_call',
    'reality_recovery',
    'confidential_referral'
  ));

alter table sessions drop constraint if exists sessions_access_password_check;
alter table sessions add constraint sessions_access_password_check
  check (access_password is null or access_password ~ '^\d{4}$');

alter table survey_events enable row level security;

drop policy if exists "survey_events_select" on survey_events;
create policy "survey_events_select" on survey_events for select using (true);

drop policy if exists "survey_events_insert" on survey_events;
create policy "survey_events_insert" on survey_events for insert with check (true);
