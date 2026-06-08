-- ⚡ CRANKD DATABASE SETUP SCRIPT (Consolidated v2)
-- Copy and paste this directly into your Supabase SQL Editor to set up all tables and functions.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT WITH CHECK (true);

-- Trigger to handle new user signup with automatic username duplicate resolving
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_base_username TEXT;
  v_counter INT := 0;
BEGIN
  v_base_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_username := v_base_username;

  -- Loop until we find a unique username
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := v_base_username || v_counter::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    v_username, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON public.vehicles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert vehicles" ON public.vehicles;
CREATE POLICY "Users can insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
CREATE POLICY "Users can update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;
CREATE POLICY "Users can delete own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = owner_id);


-- 3. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT,
  image_url TEXT, 
  content_type TEXT DEFAULT 'media', -- media, maintenance_log, convoy
  like_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  cohort_level INT DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are public" ON public.posts;
CREATE POLICY "Posts are public" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authors can create posts" ON public.posts;
CREATE POLICY "Authors can create posts" ON public.posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);


-- 4. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_username TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are public" ON public.post_comments;
CREATE POLICY "Comments are public" ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.post_comments;
CREATE POLICY "Anyone can insert comments" ON public.post_comments FOR INSERT WITH CHECK (true);


-- 5. POST INTERACTIONS
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL, -- view, like
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public to insert interactions" ON public.post_interactions;
CREATE POLICY "Public to insert interactions" ON public.post_interactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public to view interactions" ON public.post_interactions;
CREATE POLICY "Public to view interactions" ON public.post_interactions FOR SELECT USING (true);


-- 6. LISTINGS TABLE (Marketplace)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  mileage INTEGER NOT NULL,
  mileage_unit TEXT DEFAULT 'mi',
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  images TEXT[]
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Listings are public" ON public.listings;
CREATE POLICY "Listings are public" ON public.listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
CREATE POLICY "Users can insert listings" ON public.listings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;
CREATE POLICY "Sellers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.listings;
CREATE POLICY "Sellers can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);


-- 7. MAINTENANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  performed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  service_type TEXT NOT NULL, -- maintenance, repair, modification, detailing
  title TEXT NOT NULL,
  description TEXT,
  cost_amount DECIMAL(12,2),
  cost_currency TEXT DEFAULT 'USD',
  odometer_reading INT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Logs are public" ON public.maintenance_logs;
CREATE POLICY "Logs are public" ON public.maintenance_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert logs" ON public.maintenance_logs;
CREATE POLICY "Users can insert logs" ON public.maintenance_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own logs" ON public.maintenance_logs;
CREATE POLICY "Users can update own logs" ON public.maintenance_logs FOR UPDATE USING (auth.uid() = performed_by_user_id);
DROP POLICY IF EXISTS "Users can delete own logs" ON public.maintenance_logs;
CREATE POLICY "Users can delete own logs" ON public.maintenance_logs FOR DELETE USING (auth.uid() = performed_by_user_id);


-- 8. PERSONALIZED FEED RPC FUNCTION
DROP FUNCTION IF EXISTS get_personalized_feed(UUID, integer, integer);
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', p.id,
    'title', p.title,
    'body', p.body,
    'image_url', p.image_url,
    'content_type', p.content_type,
    'created_at', p.created_at,
    'like_count', p.like_count,
    'view_count', p.view_count,
    'comment_count', p.comment_count,
    'cohort_level', p.cohort_level,
    'tags', p.tags,
    'author', json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url),
    'vehicle', CASE WHEN v.id IS NOT NULL THEN json_build_object('id', v.id, 'make', v.make, 'model', v.model, 'year', v.year, 'image_url', v.image_url) ELSE NULL END
  )
  FROM posts p
  JOIN profiles u ON p.author_id = u.id
  LEFT JOIN vehicles v ON p.vehicle_id = v.id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
