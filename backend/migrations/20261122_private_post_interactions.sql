-- Security review required before applying to production.
-- Prevent public browsing of individual users' interaction histories and spoofed writes.
-- This change may affect clients that currently read all interactions; test in staging first.
begin;
-- Remove any permissive legacy policies, including renamed SELECT/INSERT/ALL policies.
do $
declare p record;
begin
  for p in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'post_interactions'
      and cmd in ('SELECT','INSERT','ALL')
  loop
    execute format('drop policy if exists %I on public.post_interactions', p.policyname);
  end loop;
end $;
create policy "Users read own interactions"
  on public.post_interactions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users insert own interactions"
  on public.post_interactions for insert to authenticated
  with check ((select auth.uid()) = user_id
    and interaction_type in ('view','like','comment','share')
    and (duration_seconds is null or (duration_seconds >= 0 and duration_seconds <= 86400)));
-- Keep permissions least-privilege even when an existing GRANT was broad.
-- SELECT/INSERT policies above apply only to authenticated users.
commit;
