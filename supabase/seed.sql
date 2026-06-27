-- SEED DATA FOR TESTING / EVALUATION
-- Insert an example user into auth.users (if using local development, otherwise these profiles sync through trigger)
-- Note: Replace this with your actual user UUID if seeding in your remote Supabase instance.

-- We assume a test user ID: 'd9b8979d-3f0e-4366-a36a-29775f0a0d9e'
-- email: 'youssef@example.com'

-- Step 1: Pre-populate profile (normally created via trigger, but we manually seed to show values)
INSERT INTO public.profiles (id, email, xp, level, reminder_time, reminder_enabled, email_reminder_enabled, created_at)
VALUES (
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'youssef@example.com',
  40,
  2,
  '07:30:00'::time,
  TRUE,
  TRUE,
  now() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Seed Habits
INSERT INTO public.habits (id, user_id, title, description, category, icon, color, frequency, created_at)
VALUES 
(
  '90a8277c-7d52-4467-bc1a-55b8ef9910d1',
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'Morning Meditation',
  '10 minutes of mindfulness breathing session',
  'Mindfulness',
  'Smile',
  '#8b5cf6', -- Violet
  '{"type": "daily"}'::jsonb,
  now() - INTERVAL '20 days'
),
(
  '90a8277c-7d52-4467-bc1a-55b8ef9910d2',
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'Gym Workout',
  '45 minutes weight lifting / strength session',
  'Fitness',
  'Dumbbell',
  '#f43f5e', -- Rose
  '{"type": "custom", "days": ["Monday", "Wednesday", "Friday"]}'::jsonb,
  now() - INTERVAL '15 days'
),
(
  '90a8277c-7d52-4467-bc1a-55b8ef9910d3',
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'Read Tech Articles',
  'Read 2 articles or chapters from learning books',
  'Work',
  'BookOpen',
  '#3b82f6', -- Blue
  '{"type": "daily"}'::jsonb,
  now() - INTERVAL '15 days'
),
(
  '90a8277c-7d52-4467-bc1a-55b8ef9910d4',
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'Drink 3L Water',
  'Stay hydrated throughout the workday',
  'Health',
  'Droplet',
  '#06b6d4', -- Cyan
  '{"type": "daily"}'::jsonb,
  now() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Seed Habit Entries for trailing 10 days to show completion histories
INSERT INTO public.habit_entries (habit_id, completed, completed_at)
VALUES
  -- Morning Meditation completions (past 7 days)
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE - 1),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE - 2),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE - 3),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE - 4),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', FALSE, CURRENT_DATE - 5),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d1', TRUE, CURRENT_DATE - 6),

  -- Gym Workout completions
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d2', TRUE, CURRENT_DATE),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d2', TRUE, CURRENT_DATE - 2),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d2', TRUE, CURRENT_DATE - 4),

  -- Read Tech Articles (High consistency streak)
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 1),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 2),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 3),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 4),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 5),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d3', TRUE, CURRENT_DATE - 6),

  -- Drink 3L Water completions
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d4', TRUE, CURRENT_DATE),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d4', TRUE, CURRENT_DATE - 1),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d4', FALSE, CURRENT_DATE - 2),
  ('90a8277c-7d52-4467-bc1a-55b8ef9910d4', TRUE, CURRENT_DATE - 3)
ON CONFLICT (habit_id, completed_at) DO NOTHING;

-- Step 4: Seed Achievements
INSERT INTO public.achievements (user_id, badge_name, unlocked_at)
VALUES
(
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'First Step',
  now() - INTERVAL '6 days'
),
(
  'd9b8979d-3f0e-4366-a36a-29775f0a0d9e',
  'Streak Master',
  now() - INTERVAL '1 day'
) ON CONFLICT (user_id, badge_name) DO NOTHING;
