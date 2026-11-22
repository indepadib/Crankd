-- VROOQ Morocco-first: owner-only technical vehicle information.
-- No VIN, plate number, ID card number or registration photo is stored.
-- Apply to Supabase Crankd after the previous member_details migration.
alter table public.member_details
  add column if not exists country_code text not null default 'MA'
    check (country_code = 'MA');

create table if not exists public.vehicle_specs (
  vehicle_id uuid primary key references public.vehicles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  fuel_type text check (fuel_type in ('diesel','petrol','hybrid','phev','electric','lpg','other')),
  engine_description text check (char_length(engine_description) <= 100),
  engine_code text check (char_length(engine_code) <= 60),
  trim_name text check (char_length(trim_name) <= 100),
  fiscal_power integer check (fiscal_power between 1 and 80),
  first_registration_date date,
  source_method text not null default 'manual' check (source_method in ('manual','card_transcription')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_specs enable row level security;
drop policy if exists "vehicle_specs_owner_select" on public.vehicle_specs;
create policy "vehicle_specs_owner_select" on public.vehicle_specs for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists "vehicle_specs_owner_insert" on public.vehicle_specs;
create policy "vehicle_specs_owner_insert" on public.vehicle_specs for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=(select auth.uid()))
  );
drop policy if exists "vehicle_specs_owner_update" on public.vehicle_specs;
create policy "vehicle_specs_owner_update" on public.vehicle_specs for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=(select auth.uid()))
  );
drop policy if exists "vehicle_specs_owner_delete" on public.vehicle_specs;
create policy "vehicle_specs_owner_delete" on public.vehicle_specs for delete to authenticated
  using ((select auth.uid()) = owner_id);

revoke all on public.vehicle_specs from anon,authenticated;
grant select, insert, delete on public.vehicle_specs to authenticated;
grant update(fuel_type,engine_description,engine_code,trim_name,fiscal_power,first_registration_date,source_method,updated_at)
  on public.vehicle_specs to authenticated;

-- Seller-declared match refinements are optional and NEVER OEM certified.
alter table public.part_listings add column if not exists compatible_fuel text
  check (compatible_fuel in ('diesel','petrol','hybrid','phev','electric','lpg','other'));
alter table public.part_listings add column if not exists compatible_engine_code text
  check (char_length(compatible_engine_code) <= 60);

comment on table public.vehicle_specs is 'Private voluntary vehicle characteristics transcribed by its owner; not official registration verification.';
comment on column public.part_listings.compatible_engine_code is 'Seller-declared engine code, no third-party fitment verification.';

notify pgrst, 'reload schema';
