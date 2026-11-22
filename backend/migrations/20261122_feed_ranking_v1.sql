-- VROOQ For You V1: candidate ranking, review in staging before deployment.
-- Keeps the live RPC signature/JSON response and the existing public read semantics.
-- No fabricated engagement or arbitrary exposure caps.
-- Important: do not deploy until RLS, query plan and EXPLAIN are verified in staging.
create or replace function public.get_personalized_feed(
  p_user_id uuid,
  p_limit integer default 10,
  p_offset integer default 0
)
returns setof json
language sql
stable
security invoker
set search_path = ''
as $$
  with user_signals as (
    select pi.post_id, pi.interaction_type, pi.duration_seconds
    from public.post_interactions pi
    where pi.user_id = p_user_id
      and pi.created_at >= now() - interval '90 days'
  ),
  interest_tags as (
    select unnest(p.tags) as tag,
      sum(case s.interaction_type
        when 'like' then 3.0
        when 'comment' then 4.0
        when 'share' then 5.0
        when 'view' then least(greatest(coalesce(s.duration_seconds,0),0),60) / 30.0
        else 0.0 end) as weight
    from user_signals s
    join public.posts p on p.id = s.post_id
    where p.tags is not null
    group by 1
  ),
  candidates as (
    select p.*, u.username, u.avatar_url,
      v.id as linked_vehicle_id, v.make, v.model, v.year, v.image_url as vehicle_image_url,
      c.name as community_name,
      coalesce((
        select sum(i.weight)
        from interest_tags i
        where i.tag = any(p.tags)
      ),0) as affinity,
      extract(epoch from (now() - p.created_at)) / 3600.0 as age_hours
    from public.posts p
    join public.profiles u on u.id = p.author_id
    left join public.vehicles v on v.id = p.vehicle_id
    left join public.communities c on c.id = p.community_id
  )
  select json_build_object(
    'id', p.id, 'title', p.title, 'body', p.body, 'image_url', p.image_url,
    'content_type', p.content_type, 'created_at', p.created_at,
    'like_count', p.like_count, 'view_count', p.view_count,
    'comment_count', p.comment_count, 'cohort_level', p.cohort_level,
    'tags', p.tags, 'community_id', p.community_id,
    'community', case when p.community_name is not null then
      json_build_object('id',p.community_id,'name',p.community_name) else null end,
    'author', json_build_object('id',p.author_id,'username',p.username,'avatar_url',p.avatar_url),
    'vehicle', case when p.linked_vehicle_id is not null then
      json_build_object('id',p.linked_vehicle_id,'make',p.make,'model',p.model,
        'year',p.year,'image_url',p.vehicle_image_url) else null end
  )
  from candidates p
  order by (
    -- Capped interest fit avoids letting a single tag dominate forever.
    least(p.affinity, 12.0) * 0.5
    -- Smoothed engagement, not raw popularity; never a fixed view-count gate.
    + ln(1 + greatest(coalesce(p.like_count,0),0) * 2
             + greatest(coalesce(p.comment_count,0),0) * 3)
      / sqrt(1 + greatest(coalesce(p.view_count,0),0))
    -- Freshness: gradually decays, no hard cutoff.
    + 4.0 / (1.0 + greatest(p.age_hours,0) / 48.0)
    -- Stable exploration bonus, independent of request time and random().
    + case when mod(abs(hashtext(p.id::text)), 7) = 0 then 0.8 else 0 end
  ) desc, p.created_at desc, p.id desc
  limit least(greatest(coalesce(p_limit,10),1),50)
  offset greatest(coalesce(p_offset,0),0);
$$;
