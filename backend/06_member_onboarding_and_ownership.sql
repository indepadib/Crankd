-- VROOQ onboarding phase 2: private member profile and basic ownership safety.
-- No national ID, number plate or VIN is stored here.
create table if not exists public.member_details (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 2 and 70),
  last_name text not null check (char_length(btrim(last_name)) between 2 and 70),
  contact_phone text not null check (char_length(btrim(contact_phone)) between 9 and 20),
  city text not null check (char_length(btrim(city)) between 2 and 100),
  account_intent text not null default 'explore' check (account_intent in ('buy','sell','explore')),
  marketing_opt_in boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.member_details enable row level security;
drop policy if exists member_details_select_own on public.member_details;
create policy member_details_select_own on public.member_details for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists member_details_insert_own on public.member_details;
create policy member_details_insert_own on public.member_details for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists member_details_update_own on public.member_details;
create policy member_details_update_own on public.member_details for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.member_details from anon, authenticated;
grant select, insert on public.member_details to authenticated;
grant update(first_name,last_name,contact_phone,city,account_intent,marketing_opt_in,updated_at) on public.member_details to authenticated;

-- Existing legacy policies were open to inserts for other users. Correct ownership.
drop policy if exists "Users can insert vehicles" on public.vehicles;
create policy "Users can insert own vehicles" on public.vehicles for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "Users can join communities" on public.community_members;
create policy "Users can join own memberships" on public.community_members for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Enable insert for authenticated users" on public.profiles;
create policy "Users can create own public profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));

notify pgrst, 'reload schema';
