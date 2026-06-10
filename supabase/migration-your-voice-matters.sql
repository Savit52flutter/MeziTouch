-- Allow the standalone "Your Voice Matters" educator survey pack.
-- Also adds optional question flags if you have not run migration-allow-multiple.sql yet.

alter table questions
  add column if not exists allow_multiple boolean not null default false;

alter table questions
  add column if not exists allow_other boolean not null default false;

alter table sessions drop constraint if exists sessions_survey_pack_check;
alter table sessions add constraint sessions_survey_pack_check
  check (survey_pack in (
    'silent_struggle',
    'wake_up_call',
    'reality_recovery',
    'confidential_referral',
    'your_voice_matters'
  ));
