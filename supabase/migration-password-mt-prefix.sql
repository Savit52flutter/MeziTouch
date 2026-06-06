-- Session passwords: MT + 6 digits only (e.g. MT123456).
-- Removes existing events first because legacy passwords will not pass the new rule.

delete from survey_events;

alter table sessions drop constraint if exists sessions_access_password_check;
alter table sessions add constraint sessions_access_password_check
  check (access_password is null or access_password ~ '^MT\d{6}$');
