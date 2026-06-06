-- Lock down public database access. The app now uses the service role on the server only.

drop policy if exists "survey_events_select" on survey_events;
drop policy if exists "survey_events_insert" on survey_events;
drop policy if exists "sessions_select" on sessions;
drop policy if exists "sessions_insert" on sessions;
drop policy if exists "sessions_update" on sessions;
drop policy if exists "questions_select" on questions;
drop policy if exists "questions_insert" on questions;
drop policy if exists "questions_update" on questions;
drop policy if exists "questions_delete" on questions;
drop policy if exists "responses_select" on responses;
drop policy if exists "responses_insert" on responses;
drop policy if exists "responses_update" on responses;
