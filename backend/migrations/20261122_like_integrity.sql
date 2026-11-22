-- Staging-first dependency for PR #56. Requires private interaction policies (#54).
-- Existing database audit: no trigger or unique constraint on post_interactions.
begin;
-- Fail clearly if historic duplicate likes exist; never silently delete user data.
do $
begin
  if exists (
    select 1 from public.post_interactions
    where interaction_type = 'like'
    group by user_id, post_id having count(*) > 1
  ) then
    raise exception 'Duplicate likes detected: reconcile in staging before creating unique index';
  end if;
end $;
create unique index if not exists post_interactions_unique_like
  on public.post_interactions (user_id, post_id)
  where interaction_type = 'like';

drop policy if exists "Users delete own interactions" on public.post_interactions;
create policy "Users delete own interactions"
  on public.post_interactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Trigger privilege review: security definer must be owned by a trusted DB role.
create or replace function public.sync_post_like_count()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' and NEW.interaction_type = 'like' then
    update public.posts set like_count = coalesce(like_count,0) + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' and OLD.interaction_type = 'like' then
    update public.posts set like_count = greatest(coalesce(like_count,0) - 1,0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;
revoke all on function public.sync_post_like_count() from public, anon, authenticated;
-- Trigger executes as function owner; confirm owner has only the necessary rights.
drop trigger if exists post_interaction_like_counter on public.post_interactions;
create trigger post_interaction_like_counter
after insert or delete on public.post_interactions
for each row execute function public.sync_post_like_count();
commit;

-- REVIEW BEFORE APPLY: existing likes may be duplicated; deduplicate in staging first.
-- SECURITY REVIEW: this narrowly scoped SECURITY DEFINER trigger is privileged.
-- Audit function owner, EXECUTE grants, trigger abuse, RLS, and cross-user inserts/deletes.
-- DO NOT APPLY until cross-user tests pass.
