-- VROOQ native polls (apply once; already applied to production 2026-11-22)
create table if not exists public.vrooq_polls (
 post_id uuid primary key references public.posts(id) on delete cascade,
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 6),
 closes_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.vrooq_poll_votes (
 post_id uuid not null references public.vrooq_polls(post_id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 option_index int not null check(option_index between 0 and 5),
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
alter table public.vrooq_polls enable row level security;
alter table public.vrooq_poll_votes enable row level security;
drop policy if exists poll_read on public.vrooq_polls;
create policy poll_read on public.vrooq_polls for select using(true);
drop policy if exists poll_create on public.vrooq_polls;
create policy poll_create on public.vrooq_polls for insert to authenticated with check(exists(select 1 from public.posts p where p.id=post_id and p.author_id=auth.uid()));
drop policy if exists vote_read on public.vrooq_poll_votes;
create policy vote_read on public.vrooq_poll_votes for select using(true);
drop policy if exists vote_create on public.vrooq_poll_votes;
create policy vote_create on public.vrooq_poll_votes for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.vrooq_polls p where p.post_id=vrooq_poll_votes.post_id and (p.closes_at is null or p.closes_at>now()) and option_index<jsonb_array_length(p.options)));
revoke insert,update,delete on public.vrooq_polls,public.vrooq_poll_votes from anon,public;
grant select on public.vrooq_polls,public.vrooq_poll_votes to anon,authenticated;
grant insert on public.vrooq_polls,public.vrooq_poll_votes to authenticated;
