-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
-- Holds user-specific metadata and gamification state. Syncs with auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL CHECK (xp >= 0),
  level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
  reminder_time TIME DEFAULT '08:00:00'::time NOT NULL,
  reminder_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  email_reminder_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- HABITS TABLE
-- Holds the user's habits configuration.
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  icon TEXT NOT NULL DEFAULT 'Activity',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  frequency JSONB NOT NULL DEFAULT '{"type":"daily"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- HABIT ENTRIES TABLE
-- Tracks individual completions of habits. Each day has at most one completion per habit.
CREATE TABLE IF NOT EXISTS public.habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (habit_id, completed_at)
);

-- ACHIEVEMENTS TABLE
-- Tracks gamification badges earned by the user.
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, badge_name)
);

-- INDEXES for Query Optimization
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habit_entries_habit_id_idx ON public.habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS habit_entries_completed_at_idx ON public.habit_entries(completed_at);
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements(user_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS POLICIES FOR HABITS
CREATE POLICY "Users can view their own habits."
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits."
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits."
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits."
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS POLICIES FOR HABIT ENTRIES
CREATE POLICY "Users can view entries for their own habits."
  ON public.habit_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries for their own habits."
  ON public.habit_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries for their own habits."
  ON public.habit_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries for their own habits."
  ON public.habit_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid()
    )
  );

-- RLS POLICIES FOR ACHIEVEMENTS
CREATE POLICY "Users can view their own achievements."
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements for themselves."
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AUTOMATIC PROFILE SYNC TRIGGER
-- Automatically creates a profile when a new user registers through Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, xp, level, reminder_time, reminder_enabled, email_reminder_enabled)
  VALUES (
    new.id,
    new.email,
    0,
    1,
    '08:00:00'::time,
    FALSE,
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
