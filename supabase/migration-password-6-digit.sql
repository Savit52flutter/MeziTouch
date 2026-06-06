-- Upgrade audience session passwords from 4 to 6 digits.
-- Existing events keep their current passwords until you create a new event.

alter table sessions drop constraint if exists sessions_access_password_check;
alter table sessions add constraint sessions_access_password_check
  check (access_password is null or access_password ~ '^MT\d{6}$');
