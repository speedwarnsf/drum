-- Spaced Repetition System: Pattern Memory Table
-- SM-2 algorithm for tracking drum pattern recall

create table if not exists public.drum_pattern_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_id text not null,
  ease_factor float not null default 2.5,
  interval_days int not null default 1,
  next_review_date date not null default current_date,
  repetitions int not null default 0,
  last_quality int check (last_quality >= 0 and last_quality <= 5),
  last_practiced_at timestamptz,
  created_at timestamptz not null default now(),
  
  unique (user_id, pattern_id)
);

-- Index for efficient queries
create index if not exists idx_drum_pattern_memory_user_review 
  on public.drum_pattern_memory (user_id, next_review_date);

create index if not exists idx_drum_pattern_memory_user_pattern 
  on public.drum_pattern_memory (user_id, pattern_id);

-- Enable RLS
alter table public.drum_pattern_memory enable row level security;

-- Policies
create policy "Users can read their pattern memory" 
  on public.drum_pattern_memory
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their pattern memory" 
  on public.drum_pattern_memory
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their pattern memory" 
  on public.drum_pattern_memory
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their pattern memory" 
  on public.drum_pattern_memory
  for delete
  to authenticated
  using (auth.uid() = user_id);
