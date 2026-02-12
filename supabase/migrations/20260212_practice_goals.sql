-- Practice Goals: weekly/monthly targets
create table if not exists public.drum_practice_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_type text not null check (goal_type in ('weekly', 'monthly', 'custom')),
  target_minutes int not null default 60,
  target_sessions int not null default 5,
  target_streak int not null default 3,
  starts_at date not null,
  ends_at date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.drum_practice_goals enable row level security;

create policy "Users can manage their goals" on public.drum_practice_goals
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Practice Insights: pre-computed weekly summaries
create table if not exists public.drum_weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  total_minutes int not null default 0,
  total_sessions int not null default 0,
  avg_accuracy numeric(5,2),
  top_focus text,
  streak_max int not null default 0,
  rudiments_practiced text[] default '{}',
  insights jsonb default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.drum_weekly_summaries enable row level security;

create policy "Users can manage their summaries" on public.drum_weekly_summaries
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Practice Bookmarks: save favorite patterns/rudiments
create table if not exists public.drum_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_type text not null check (item_type in ('pattern', 'rudiment', 'drill', 'session')),
  item_id text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.drum_bookmarks enable row level security;

create policy "Users can manage their bookmarks" on public.drum_bookmarks
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
