-- VROOQ community foundation. Applied to production on 2026-11-22; kept here for reproducibility.
create table if not exists public.vrooq_tribes (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, name text not null check (char_length(trim(name)) between 3 and 100), description text not null default '', city text, created_at timestamptz not null default now());
create table if not exists public.vrooq_tribe_members (tribe_id uuid not null references public.vrooq_tribes(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, joined_at timestamptz not null default now(), primary key(tribe_id,user_id));
create table if not exists public.vrooq_events (id uuid primary key default gen_random_uuid(), organizer_id uuid not null references auth.users(id) on delete cascade, tribe_id uuid references public.vrooq_tribes(id) on delete set null, title text not null check (char_length(trim(title)) between 5 and 160), description text not null default '', meeting_place text not null check (char_length(trim(meeting_place)) between 3 and 250), starts_at timestamptz not null, ends_at timestamptz, capacity integer check (capacity between 1 and 10000), status text not null default 'published' check (status in ('published','cancelled')), created_at timestamptz not null default now(), constraint event_end_after_start check (ends_at is null or ends_at>starts_at));
create table if not exists public.vrooq_event_rsvps (event_id uuid not null references public.vrooq_events(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, status text not null default 'going' check (status in ('going','interested')), created_at timestamptz not null default now(), primary key(event_id,user_id));
alter table public.vrooq_tribes enable row level security;
alter table public.vrooq_tribe_members enable row level security;
alter table public.vrooq_events enable row level security;
alter table public.vrooq_event_rsvps enable row level security;
create policy tribes_read on public.vrooq_tribes for select to anon,authenticated using (true);
create policy tribes_create on public.vrooq_tribes for insert to authenticated with check (owner_id=(select auth.uid()));
create policy tribes_owner_delete on public.vrooq_tribes for delete to authenticated using (owner_id=(select auth.uid()));
create policy members_read on public.vrooq_tribe_members for select to authenticated using (true);
create policy members_join on public.vrooq_tribe_members for insert to authenticated with check (user_id=(select auth.uid()));
create policy members_leave on public.vrooq_tribe_members for delete to authenticated using (user_id=(select auth.uid()));
create policy events_read on public.vrooq_events for select to anon,authenticated using (true);
create policy events_create on public.vrooq_events for insert to authenticated with check (organizer_id=(select auth.uid()) and (tribe_id is null or exists (select 1 from public.vrooq_tribes t where t.id=tribe_id and t.owner_id=(select auth.uid()))));
create policy events_owner_cancel on public.vrooq_events for update to authenticated using (organizer_id=(select auth.uid())) with check (organizer_id=(select auth.uid()));
create policy rsvps_read on public.vrooq_event_rsvps for select to authenticated using (user_id=(select auth.uid()) or exists (select 1 from public.vrooq_events e where e.id=event_id and e.organizer_id=(select auth.uid())));
create policy rsvps_join on public.vrooq_event_rsvps for insert to authenticated with check (user_id=(select auth.uid()) and exists (select 1 from public.vrooq_events e where e.id=event_id and e.status='published' and e.starts_at>now()));
create policy rsvps_leave on public.vrooq_event_rsvps for delete to authenticated using (user_id=(select auth.uid()));
grant select on public.vrooq_tribes,public.vrooq_events to anon;
grant select,insert,delete on public.vrooq_tribes,public.vrooq_tribe_members,public.vrooq_event_rsvps to authenticated;
grant select,insert,update on public.vrooq_events to authenticated;

create policy rsvps_change on public.vrooq_event_rsvps for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and exists (select 1 from public.vrooq_events e where e.id=event_id and e.status='published' and e.starts_at>now())); grant update on public.vrooq_event_rsvps to authenticated;
