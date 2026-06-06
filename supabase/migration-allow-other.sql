alter table questions
  add column if not exists allow_other boolean not null default false;

update questions
set allow_other = true
where question_type = 'multiple_choice'
  and allow_multiple = true;
