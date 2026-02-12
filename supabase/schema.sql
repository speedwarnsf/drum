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

create table if not exists public.drum_entitlements (
  user_id uuid primary key,
  lesson_credits int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.drum_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  product text,
  lessons int not null,
  amount int,
  currency text,
  created_at timestamptz not null default now()
);

alter table public.drum_entitlements enable row level security;
alter table public.drum_purchases enable row level security;

create policy "Users can read their entitlements" on public.drum_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their purchases" on public.drum_purchases
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.drum_profiles (
  user_id uuid primary key,
  level text,
  kit text,
  minutes int,
  goal text,
  session_count int not null default 0,
  current_module int not null default 1,
  module_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drum_profiles enable row level security;

create policy "Users can read their profile" on public.drum_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can upsert their profile" on public.drum_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their profile" on public.drum_profiles
  for update
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.drum_lesson_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.drum_lesson_uses enable row level security;

create policy "Users can read their lesson uses" on public.drum_lesson_uses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their lesson uses" on public.drum_lesson_uses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================
-- RECORDING SHARING (Social Layer - 70-20-10)
-- ============================================

-- Shared recordings for community feedback
create table if not exists public.drum_shared_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  storage_path text not null,
  duration_ms int not null,
  pattern_type text,
  bpm int,
  module_id int,
  description text,
  feedback_count int not null default 0,
  avg_cleanliness numeric(2,1),
  created_at timestamptz not null default now()
);

alter table public.drum_shared_recordings enable row level security;

-- Anyone can read shared recordings
create policy "Anyone can read shared recordings" on public.drum_shared_recordings
  for select
  to authenticated
  using (true);

-- Users can insert their own recordings
create policy "Users can share recordings" on public.drum_shared_recordings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own recordings
create policy "Users can delete their recordings" on public.drum_shared_recordings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Users can update their own recordings (for feedback aggregation)
create policy "Users can update their recordings" on public.drum_shared_recordings
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Feedback from community members
create table if not exists public.drum_recording_feedback (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.drum_shared_recordings(id) on delete cascade,
  reviewer_id uuid not null,
  cleanliness_rating int not null check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
  timing_rating int not null check (timing_rating >= 1 and timing_rating <= 5),
  comment text,
  detected_issues text[] default '{}',
  created_at timestamptz not null default now(),
  unique (recording_id, reviewer_id)
);

alter table public.drum_recording_feedback enable row level security;

-- Anyone can read feedback
create policy "Anyone can read feedback" on public.drum_recording_feedback
  for select
  to authenticated
  using (true);

-- Users can insert feedback (but not for their own recordings - enforced in app)
create policy "Users can give feedback" on public.drum_recording_feedback
  for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

-- ============================================
-- SPACED REPETITION (Pattern Memory)
-- ============================================

create table if not exists public.drum_pattern_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pattern_id text not null,
  ease_factor numeric(3,2) not null default 2.5,
  interval_days int not null default 1,
  next_review_date date not null default current_date,
  repetitions int not null default 0,
  last_quality int,
  last_practiced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, pattern_id)
);

alter table public.drum_pattern_memory enable row level security;

create policy "Users can read their pattern memory" on public.drum_pattern_memory
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert pattern memory" on public.drum_pattern_memory
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update pattern memory" on public.drum_pattern_memory
  for update
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- SKILL TREE (Competency Tracking)
-- ============================================

create table if not exists public.drum_skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  skill_id text not null,
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'practicing', 'mastered')),
  clean_bpm_max int,
  total_practice_minutes int not null default 0,
  sessions_count int not null default 0,
  mastered_at timestamptz,
  unlocked_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

alter table public.drum_skill_progress enable row level security;

create policy "Users can read their skill progress" on public.drum_skill_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert skill progress" on public.drum_skill_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update skill progress" on public.drum_skill_progress
  for update
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- PRACTICE GOALS (Weekly/Monthly Targets)
-- ============================================

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

-- ============================================
-- WEEKLY SUMMARIES (Pre-computed Analytics)
-- ============================================

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

-- ============================================
-- BOOKMARKS (Save Favorite Patterns/Rudiments)
-- ============================================

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
