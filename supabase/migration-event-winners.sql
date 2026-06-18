-- Prize draw winners per event. Ensures one winner label can only win once.

create table if not exists event_winners (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references survey_events(id) on delete cascade,
  winner_label text not null,
  participant_id text,
  created_at timestamptz not null default now(),
  unique (event_id, winner_label)
);

create index if not exists event_winners_event_id_idx on event_winners(event_id);

alter table event_winners enable row level security;
