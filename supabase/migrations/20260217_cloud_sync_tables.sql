-- Cloud sync tables for practice data persistence
-- Migrates localStorage data to Supabase

-- Practice log (per-rudiment practice entries)
CREATE TABLE IF NOT EXISTS drum_practice_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rudiment_id text NOT NULL,
  date text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  bpm integer NOT NULL DEFAULT 60,
  accuracy real,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drum_practice_log_user ON drum_practice_log(user_id);
CREATE INDEX IF NOT EXISTS idx_drum_practice_log_rudiment ON drum_practice_log(user_id, rudiment_id);

-- Tempo Goals
CREATE TABLE IF NOT EXISTS drum_tempo_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rudiment_id text NOT NULL,
  target_bpm integer NOT NULL,
  achieved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, rudiment_id)
);

-- Tempo Progress
CREATE TABLE IF NOT EXISTS drum_tempo_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rudiment_id text NOT NULL,
  date text NOT NULL,
  bpm integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, rudiment_id, date)
);

CREATE INDEX IF NOT EXISTS idx_drum_tempo_progress_user ON drum_tempo_progress(user_id, rudiment_id);

-- Reflections / Journal entries
CREATE TABLE IF NOT EXISTS drum_reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  stop text,
  start text,
  continue_text text,
  minute_paper text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drum_reflections_user ON drum_reflections(user_id);

-- Practice Routines
CREATE TABLE IF NOT EXISTS drum_routines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drum_routines_user ON drum_routines(user_id);

-- RLS
ALTER TABLE drum_practice_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_tempo_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_tempo_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_routines ENABLE ROW LEVEL SECURITY;

-- Per-user policies
CREATE POLICY "Users own practice_log" ON drum_practice_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own tempo_goals" ON drum_tempo_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own tempo_progress" ON drum_tempo_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own reflections" ON drum_reflections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own routines" ON drum_routines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
