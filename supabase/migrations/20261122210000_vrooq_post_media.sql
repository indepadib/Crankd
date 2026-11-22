insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('vrooq-post-media','vrooq-post-media',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists vrooq_post_media_read on storage.objects;
create policy vrooq_post_media_read on storage.objects for select using(bucket_id='vrooq-post-media');
drop policy if exists vrooq_post_media_insert on storage.objects;
create policy vrooq_post_media_insert on storage.objects for insert to authenticated with check(bucket_id='vrooq-post-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists vrooq_post_media_delete on storage.objects;
create policy vrooq_post_media_delete on storage.objects for delete to authenticated using(bucket_id='vrooq-post-media' and (storage.foldername(name))[1]=auth.uid()::text);
