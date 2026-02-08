-- Add missing module tracking columns to drum_profiles table
-- These columns are referenced in the application code but missing from the database

ALTER TABLE public.drum_profiles 
ADD COLUMN IF NOT EXISTS current_module INTEGER DEFAULT 1 NOT NULL;

ALTER TABLE public.drum_profiles 
ADD COLUMN IF NOT EXISTS module_started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;