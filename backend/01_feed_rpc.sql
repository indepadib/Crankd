
-- Drop the function if it exists with a different signature to avoid conflicts
DROP FUNCTION IF EXISTS get_personalized_feed(uuid, integer, integer);

create or replace function get_personalized_feed(
  p_user_id uuid,
  p_limit integer default 10,
  p_offset integer default 0
)
returns setof json
language plpgsql
as $$
begin
  return query
  select json_build_object(
    'id', p.id,
    'title', p.title,
    'body', p.body,
    'content_type', p.content_type, -- Important for frontend logic
    'created_at', p.created_at,
    'like_count', p.like_count,
    'view_count', p.view_count,
    'comment_count', p.comment_count,
    'cohort_level', p.cohort_level,
    'tags', p.tags,
    'author', json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url, 'full_name', u.full_name),
    'vehicle', case when v.id is not null then json_build_object('id', v.id, 'make', v.make, 'model', v.model, 'year', v.year, 'image_url', v.image_url) else null end
  )
  from posts p
  join users u on p.author_id = u.id
  left join vehicles v on p.vehicle_id = v.id
  -- Add simple recommendation logic: Filter out seen posts if needed, order by score
  order by p.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;
