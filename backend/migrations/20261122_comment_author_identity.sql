-- Add verifiable author identity to new comments without misattributing legacy rows.
begin;
alter table public.post_comments
  add column if not exists author_id uuid references public.profiles(id);

-- Preserve existing SELECT policies while replacing INSERT access.
-- Remove any existing permissive INSERT policy, regardless of its historic name.
-- ALL policies require a separate staging audit: dropping them can remove SELECT/UPDATE/DELETE access.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'post_comments' and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.post_comments', p.policyname);
  end loop;
end $$;

create policy "Authenticated author can create comments"
  on public.post_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and length(btrim(comment_text)) between 1 and 2000
    and author_username = (
      select username from public.profiles where id = (select auth.uid())
    )
  );
commit;
-- Legacy rows retain author_id=NULL; do not infer identities from usernames.
-- Staging gate: confirm SELECT policies, existing data, and Feed/TV inserts.
