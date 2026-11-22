-- Security review required before applying to production.
-- Prevent public browsing of individual users' interaction histories and spoofed writes.
-- This change may affect clients that currently read all interactions; test in staging first.
begin;
drop policy if exists "Public to view interactions" on public.post_interactions;
drop policy if exists "Public to insert interactions" on public.post_interactions;
create policy "Users read own interactions"
  on public.post_interactions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users insert own interactions"
  on public.post_interactions for insert to authenticated
  with check ((select auth.uid()) = user_id
    and interaction_type in ('view','like','comment','share')
    and (duration_seconds is null or (duration_seconds >= 0 and duration_seconds <= 86400)));
commit;
