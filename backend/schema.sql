-- CRANKD Database Schema
-- Phase 1: The Logbook

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS (Extends Supabase Auth)
-- We keep this thin. The 'Garage' concept is the user's primary identity.
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  reputation_score int default 0, -- "Garage Rank"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VEHICLES (The Atomic Unit)
-- Immutable identity of the machine.
create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  vin text unique not null, -- Hashed in production for privacy unless verified owner viewing
  make text not null,
  model text not null,
  year int not null,
  trim text,
  specs jsonb, -- { engine: "S54B32", transmission: "6MT", color: "Interlagos Blue" }
  health_score int default 100, -- Dynamic score based on logs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. OWNERSHIP_PERIODS ( The Chain of Custody )
-- This is how we decouple the car from the user.
create table public.ownership_periods (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) not null,
  user_id uuid references public.profiles(id) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone, -- NULL implies current ownership
  is_verified boolean default false, -- True if verified by VIN check/Registration doc in onboarding
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint: A vehicle can only have ONE active owner (end_date is NULL) at a time.
  constraint unique_active_owner unique (vehicle_id, end_date) 
  -- Note: This partial unique index syntax might need adjustment for NULLs in Postgres, 
  -- but logically we enforce only one OPEN period per vehicle.
);

create unique index unique_active_owner_idx on public.ownership_periods (vehicle_id) where end_date is null;


-- 4. MAINTENANCE_LOGS (The Value)
create type service_type as enum ('maintenance', 'modification', 'repair', 'detailing');

create table public.maintenance_logs (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) not null,
  performed_by_user_id uuid references public.profiles(id) not null, -- The user who logged it
  occurred_at timestamp with time zone not null, -- Actual date of service
  
  service_type service_type not null,
  title text not null, -- "Rod Bearings Replacement"
  description text,
  cost_amount decimal(12,2),
  cost_currency text default 'USD',
  odometer_reading int, -- Critical for history
  
  is_verified boolean default false, -- True if OCR/Admin verified proof
  verification_confidence float, -- 0.0 to 1.0 from AI
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. VERIFICATION_PROOFS (The Evidence)
-- Private data (receipts) linked to public logs.
create table public.verification_proofs (
  id uuid default uuid_generate_v4() primary key,
  log_id uuid references public.maintenance_logs(id) not null,
  storage_path text not null, -- Path in R2/S3
  extracted_data jsonb, -- Raw OCR data
  manual_review_status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MEDIA_ASSETS (The Glory)
create table public.media_assets (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) not null,
  uploader_id uuid references public.profiles(id) not null,
  log_id uuid references public.maintenance_logs(id), -- Optional: Link photo to a specific job
  
  storage_path text not null,
  media_type text not null, -- 'image', 'video'
  is_featured boolean default false, -- "Cover Photo" candidate
  
  metadata jsonb, -- EXIF data, location, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SOCIAL GRAPH
create table public.follows (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- 8. CONVOY ENGINE (Real-Time Meets)
create table public.convoy_sessions (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) not null,
  title text not null, -- "Midnight Run to Daikoku"
  start_location jsonb, -- { lat: 35.6, lng: 139.7 }
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.convoy_members (
  convoy_id uuid references public.convoy_sessions(id) not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_ping_location jsonb, -- { lat, lng, speed, heading }
  primary key (convoy_id, user_id)
);


-- ROW LEVEL SECURITY (RLS) POLICIES (Draft)

alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table ownership_periods enable row level security;
alter table maintenance_logs enable row level security;
alter table verification_proofs enable row level security;
alter table follows enable row level security;
alter table convoy_sessions enable row level security;
alter table convoy_members enable row level security;

-- Public read access to Vehicles
create policy "Vehicles are viewable by everyone" on vehicles
  for select using (true);

-- Maintenance logs: Detailed view logic needed (some might be private)
-- For MVP, verified logs on public profiles are public.
create policy "Logs are viewable by everyone" on maintenance_logs
  for select using (true);

-- Proofs (Receipts) should be PRIVATE to the owner unless explicitly shared.
create policy "Proofs are viewable by owner only" on verification_proofs
  for select using (
    exists (
      select 1 from maintenance_logs ml
      join ownership_periods op on ml.vehicle_id = op.vehicle_id
      where ml.id = verification_proofs.log_id
      and op.user_id = auth.uid()
      and (op.end_date is null or (ml.occurred_at between op.start_date and op.end_date))
    )
  );

-- Social & Convoy RLS
create policy "Follows are public" on follows
  for select using (true);

create policy "Convoys are public" on convoy_sessions
  for select using (true);

create policy "Convoy members are public" on convoy_members
  for select using (true);

-- 9. MARKETPLACE
create type listing_status as enum ('draft', 'active', 'sold', 'withdrawn');

create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  price_amount decimal(12,2) not null,
  price_currency text default 'USD',
  title text not null, -- "E46 M3 CSL - Collector Grade"
  description text,
  status listing_status default 'draft',
  
  is_verified_listing boolean default false, -- Paid Tier
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROMOTIONS (The Monetization Layer)
create table public.listing_promotions (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  promo_type text not null, -- 'verified_listing', 'featured'
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  payment_intent_id text, -- Stripe ID
  amount_paid decimal(12,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MARKETPLACE RLS
alter table listings enable row level security;
alter table listing_promotions enable row level security;

-- Everyone can view ACTIVE listings
create policy "Active listings are public" on listings
  for select using (status = 'active');

-- Sellers manage their own listings
create policy "Sellers manage own listings" on listings
  for all using (auth.uid() = seller_id);


-- 10. UNIFIED FEED & RECOMMENDATION ENGINE
-- The core of the "User Interest" graph

create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) not null,
  
  -- Polymorphic link to content
  content_type text not null, -- 'media', 'maintenance_log', 'listing', 'convoy'
  media_id uuid references public.media_assets(id),
  log_id uuid references public.maintenance_logs(id),
  listing_id uuid references public.listings(id),
  convoy_id uuid references public.convoy_sessions(id),
  
  title text,
  body text,
  
  -- Algorithm Data
  view_count int default 0,
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  
  engagement_score float default 0, -- Calculated (Likes * 5 + Comments * 10 + Shares * 20 + WatchTime)
  cohort_level int default 0, -- 0=New(100), 1=Rising(1000), 2=Trending(10k), 3=Viral(100k+)
  
  tags jsonb, -- ["BMW", "E46", "Restoration", "Track"]
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.post_interactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) not null,
  user_id uuid references public.profiles(id), -- Can be null for anonymous stats
  
  interaction_type text not null, -- 'view', 'like', 'comment', 'share', 'bookmark'
  duration_seconds int default 0, -- For 'view'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aggregated User Interests
create table public.user_interests (
  user_id uuid references public.profiles(id) not null,
  tag text not null,
  score float default 0, -- Increment on interaction
  last_interaction timestamp with time zone default now(),
  primary key (user_id, tag)
);

-- RLS
alter table posts enable row level security;
alter table post_interactions enable row level security;
alter table user_interests enable row level security;

create policy "Posts are public" on posts for select using (true);
create policy "Interactions are private" on post_interactions for all using (auth.uid() = user_id);
create policy "Interests are private" on user_interests for all using (auth.uid() = user_id);


