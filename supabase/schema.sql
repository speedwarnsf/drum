create table if not exists public.drum_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null,
  log jsonb not null,
  plan jsonb,
  created_at timestamptz not null default now()
);

alter table public.drum_sessions enable row level security;

create policy "Users can insert their sessions" on public.drum_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read their sessions" on public.drum_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);
