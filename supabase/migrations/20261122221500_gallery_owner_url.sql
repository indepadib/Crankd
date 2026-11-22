drop policy if exists media_owner_insert on public.vrooq_post_media;
create policy media_owner_insert on public.vrooq_post_media for insert to authenticated with check(
 exists(select 1 from public.posts p where p.id=post_id and p.author_id=auth.uid())
 and url like ('%/storage/v1/object/public/vrooq-post-media/' || auth.uid()::text || '/%')
);