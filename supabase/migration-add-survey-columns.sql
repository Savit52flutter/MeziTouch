-- Run this if you already created the database from an older schema.sql

alter table questions
  add column if not exists section text not null default 'General';

alter table questions
  add column if not exists is_confidential boolean not null default false;
