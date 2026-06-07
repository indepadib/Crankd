
-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public User Data)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. VEHICLES
create table if not exists public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id),
  make text not null,
  model text not null,
  year int not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;
create policy "Vehicles are viewable by everyone" on vehicles for select using (true);
create policy "Users can insert vehicles" on vehicles for insert with check (auth.uid() = owner_id);


-- 3. POSTS
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) not null,
  vehicle_id uuid references public.vehicles(id), -- Optional link
  title text,
  body text,
  image_url text, 
  content_type text default 'media', -- media, log, listing
  
  -- Metrics
  like_count int default 0,
  view_count int default 0,
  comment_count int default 0,
  cohort_level int default 0,
  tags text[],
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;
create policy "Posts are public" on posts for select using (true);
create policy "Authors can create posts" on posts for insert with check (auth.uid() = author_id);


-- 4. POST INTERACTIONS
create table if not exists public.post_interactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) not null,
  user_id uuid references public.profiles(id),
  interaction_type text not null, -- view, like
  duration_seconds int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.post_interactions enable row level security;
create policy "Public to insert interactions" on post_interactions for insert with check (true);


-- 5. LISTINGS (Marketplace)
create table if not exists public.listings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_id UUID REFERENCES public.profiles(id),
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

alter table public.listings enable row level security;
create policy "Listings are public" on listings for select using (true);


-- 6. RPC: FEED
-- Drop old version
DROP FUNCTION IF EXISTS get_personalized_feed(uuid, integer, integer);

create or replace function get_personalized_feed(
  p_user_id uuid,
  p_limit integer default 10,
  p_offset integer default 0
)
returns setof json
language plpgsql
as $$
begin
  return query
  select json_build_object(
    'id', p.id,
    'title', p.title,
    'body', p.body,
    'image_url', p.image_url, -- Use direct image_url for simplicity in v1
    'content_type', p.content_type,
    'created_at', p.created_at,
    'like_count', p.like_count,
    'view_count', p.view_count,
    'comment_count', p.comment_count,
    'cohort_level', p.cohort_level,
    'tags', p.tags,
    'author', json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url),
    'vehicle', case when v.id is not null then json_build_object('id', v.id, 'make', v.make, 'model', v.model, 'year', v.year, 'image_url', v.image_url) else null end
  )
  from posts p
  join profiles u on p.author_id = u.id
  left join vehicles v on p.vehicle_id = v.id
  order by p.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;


-- 7. SEED DATA (MOCK)
-- We need execution block to insert data safely
DO $$
DECLARE
  v_user_id uuid;
  v_vehicle_id uuid;
BEGIN
  -- 1. Create a Fake Profile (If auth.users doesn't exist, we can't easily insert profile if FK is strict)
  -- BUT for dev, let's assume we might need to manually insert if we want 'fake' data without real auth users.
  -- Limitation: profiles references auth.users. 
  -- WORKAROUND: We will skip inserting mock profiles here because we can't insert into auth.users via SQL Editor easily (permissions).
  -- instead, we rely on the user Signing Up in the app.
  
  -- Create some Listings (no FK strictness on seller_id in my simplified table def if I removed references, but I kept it via REFERENCES public.profiles(id))
  -- I should probably make seller_id nullable for mock listings or create a mock user.
  
  -- Let's just create 'Posts' without strict FKs specifically for the 'seed' if possible? 
  -- No, let's respect foreign keys.
  
  -- If you want mock data, you need a User.
  -- I will output a message: "Please Sign Up in the app to create the first user."
  NULL; -- Do nothing
END $$;
