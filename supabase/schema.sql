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
