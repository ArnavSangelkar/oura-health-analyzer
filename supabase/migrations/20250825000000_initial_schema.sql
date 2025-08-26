-- Create tables for Oura Health Analyzer

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  oura_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sleep data table
CREATE TABLE IF NOT EXISTS public.sleep_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  score INTEGER,
  total_sleep_duration INTEGER, -- in seconds
  deep_sleep_duration INTEGER, -- in seconds
  rem_sleep_duration INTEGER, -- in seconds
  light_sleep_duration INTEGER, -- in seconds
  efficiency INTEGER, -- percentage
  latency INTEGER, -- in seconds
  type TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Activity data table
CREATE TABLE IF NOT EXISTS public.activity_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  score INTEGER,
  steps INTEGER,
  total_calories INTEGER,
  active_calories INTEGER,
  resting_time INTEGER, -- in seconds
  sedentary_time INTEGER, -- in seconds
  active_time INTEGER, -- in seconds
  target_calories INTEGER,
  target_meters INTEGER,
  meters_to_target INTEGER,
  average_met NUMERIC,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Readiness data table
CREATE TABLE IF NOT EXISTS public.readiness_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  score INTEGER,
  resting_heart_rate INTEGER,
  hrv_rmssd NUMERIC,
  temperature_deviation NUMERIC,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL, -- 'sleep', 'activity', 'readiness', 'general'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sleep_data_user_day ON public.sleep_data(user_id, day);
CREATE INDEX IF NOT EXISTS idx_activity_data_user_day ON public.activity_data(user_id, day);
CREATE INDEX IF NOT EXISTS idx_readiness_data_user_day ON public.readiness_data(user_id, day);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_type ON public.ai_insights(user_id, insight_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sleep data" ON public.sleep_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep data" ON public.sleep_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep data" ON public.sleep_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity data" ON public.activity_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity data" ON public.activity_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity data" ON public.activity_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own readiness data" ON public.readiness_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readiness data" ON public.readiness_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readiness data" ON public.readiness_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
