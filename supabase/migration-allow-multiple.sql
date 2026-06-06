alter table questions
  add column if not exists allow_multiple boolean not null default false;

alter table questions
  add column if not exists allow_other boolean not null default false;

-- Optional: persist flags for reporting (app also derives these at runtime)
update questions
set
  allow_multiple = true,
  allow_other = true
where question_type = 'multiple_choice'
  and options not in (
    '["Yes","Sometimes","No"]'::jsonb,
    '["Yes","Maybe","No"]'::jsonb,
    '["Yes, a lot","Sometimes","Not really"]'::jsonb,
    '["Very tired","Sometimes tired","Mostly okay"]'::jsonb,
    '["Yes","No","Maybe, I would like more information"]'::jsonb,
    '["Phone call","WhatsApp","Email","Confidential in person discussion"]'::jsonb
  );
