-- Optional owner-only VIN capture. Not an automated VIN decoder.
-- Full VIN is never sent to a third party or copied into part requests.
create table if not exists public.vehicle_private_identifiers (
  vehicle_id uuid primary key references public.vehicles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  vin text not null check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.vehicle_private_identifiers enable row level security;

create policy "private_vin_owner_select" on public.vehicle_private_identifiers for select to authenticated
 using (
   owner_id=(select auth.uid()) and exists (
     select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=(select auth.uid())
   )
 );
create policy "private_vin_owner_insert" on public.vehicle_private_identifiers for insert to authenticated
 with check (
   owner_id=(select auth.uid()) and exists (
     select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=(select auth.uid())
   )
 );
create policy "private_vin_owner_delete" on public.vehicle_private_identifiers for delete to authenticated
 using (
   owner_id=(select auth.uid()) and exists (
     select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=(select auth.uid())
   )
 );
revoke all on public.vehicle_private_identifiers from anon,authenticated;
grant select,insert,delete on public.vehicle_private_identifiers to authenticated;
comment on table public.vehicle_private_identifiers is 'Optional full VIN private to vehicle owner after separate consent; no VIN decoding or matching API connected.';
notify pgrst, 'reload schema';