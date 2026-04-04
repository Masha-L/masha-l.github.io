-- Citizenship Prep App - Supabase Tables
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Civics progress tracking
CREATE TABLE IF NOT EXISTS citizenship_civics_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id INTEGER NOT NULL,
  test_version TEXT NOT NULL DEFAULT '2025',
  times_correct INTEGER DEFAULT 0,
  times_wrong INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  mastered BOOLEAN DEFAULT false,
  UNIQUE(user_id, question_id, test_version)
);

ALTER TABLE citizenship_civics_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own civics progress" ON citizenship_civics_progress;
CREATE POLICY "Users manage own civics progress" ON citizenship_civics_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Quiz history
CREATE TABLE IF NOT EXISTS citizenship_quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  test_version TEXT NOT NULL DEFAULT '2025',
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_json JSONB
);

ALTER TABLE citizenship_quiz_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own quiz history" ON citizenship_quiz_history;
CREATE POLICY "Users manage own quiz history" ON citizenship_quiz_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. I-751 document checklist
CREATE TABLE IF NOT EXISTS citizenship_i751_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_key TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_key)
);

ALTER TABLE citizenship_i751_checklist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own i751 checklist" ON citizenship_i751_checklist;
CREATE POLICY "Users manage own i751 checklist" ON citizenship_i751_checklist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Study streaks
CREATE TABLE IF NOT EXISTS citizenship_study_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  studied BOOLEAN DEFAULT true,
  UNIQUE(user_id, date)
);

ALTER TABLE citizenship_study_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own study streaks" ON citizenship_study_streaks;
CREATE POLICY "Users manage own study streaks" ON citizenship_study_streaks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
