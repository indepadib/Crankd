-- ALGORITHM LOGIC

-- 1. SCORING FUNCTION
create or replace function calculate_engagement_score(
    p_likes int,
    p_comments int,
    p_shares int,
    p_avg_watch_time float
) returns float as $$
begin
    -- Formula: (Likes * 5) + (Comments * 10) + (Shares * 20) + (WatchTime * 0.5)
    return (p_likes * 5) + (p_comments * 10) + (p_shares * 20) + (p_avg_watch_time * 0.5);
end;
$$ language plpgsql immutable;


-- 2. INTERACTION TRIGGER
create or replace function handle_interaction() returns trigger as $$
declare
    v_post_tags jsonb;
    v_tag text;
begin
    -- Update Post Stats
    if NEW.interaction_type = 'view' then
        update posts 
        set view_count = view_count + 1,
            engagement_score = calculate_engagement_score(like_count, comment_count, share_count, (engagement_score / greatest(view_count + 1, 1))) -- Approximation for MVP
        where id = NEW.post_id;
    elsif NEW.interaction_type = 'like' then
        update posts set like_count = like_count + 1 where id = NEW.post_id;
    elsif NEW.interaction_type = 'comment' then
        update posts set comment_count = comment_count + 1 where id = NEW.post_id;
    elsif NEW.interaction_type = 'share' then
        update posts set share_count = share_count + 1 where id = NEW.post_id;
    end if;

    -- Update User Interests (Personalization)
    if NEW.user_id is not null then
        select tags into v_post_tags from posts where id = NEW.post_id;
        
        if v_post_tags is not null then
            for v_tag in select jsonb_array_elements_text(v_post_tags)
            loop
                insert into user_interests (user_id, tag, score, last_interaction)
                values (NEW.user_id, v_tag, 1.0, now())
                on conflict (user_id, tag) do update
                set score = user_interests.score + 1.0,
                    last_interaction = now();
            end loop;
        end if;
    end if;

    -- COHORT PROMOTION LOGIC (The "TikTok" 100 -> 1000 -> 10k ladder)
    -- Check if we should upgrade the cohort based on View Count landmarks
    update posts
    set cohort_level = case 
        -- Promotion to TIER 1 (Rising): Need > 100 views AND decent score (e.g. > 50)
        when cohort_level = 0 and view_count >= 100 and engagement_score > 50 then 1
        
        -- Promotion to TIER 2 (Trending): Need > 1000 views AND high score (e.g. > 500)
        when cohort_level = 1 and view_count >= 1000 and engagement_score > 500 then 2
        
        -- Promotion to TIER 3 (Viral): Need > 10000 views AND very high score
        when cohort_level = 2 and view_count >= 10000 and engagement_score > 5000 then 3
        
        else cohort_level
    end
    where id = NEW.post_id;

    return NEW;
end;
$$ language plpgsql security definer;

create trigger on_interaction_added
after insert on post_interactions
for each row execute function handle_interaction();


-- 3. FEED QUERY
-- Complex query to fetch mix of content
create or replace function get_personalized_feed(
    p_user_id uuid,
    p_limit int default 20,
    p_offset int default 0
) returns setof posts as $$
declare
    v_user_tags text[];
begin
    -- Get top user interests
    select array_agg(tag) into v_user_tags 
    from (
        select tag from user_interests 
        where user_id = p_user_id 
        order by score desc 
        limit 10
    ) t;

    return query
    with scored_posts as (
        select *,
            case 
                -- Boost if matches user interest
                when tags ?| v_user_tags then 2.0
                else 1.0
            end as personalization_multiplier,
            
            -- Random noise for exploration (Discovery)
            random() * 0.2 as noise
            
        from posts
        where 
             -- COHORT CAPPING LOGIC (The "Testing" Phase)
             -- If in Tier 0, cap exposure at ~120 views unless promoted
             (cohort_level = 0 and view_count < 120) OR
             (cohort_level = 1 and view_count < 1200) OR
             (cohort_level = 2 and view_count < 12000) OR
             (cohort_level = 3) -- Viral has no cap
    )
    select id, author_id, content_type, media_id, log_id, listing_id, convoy_id, title, body, view_count, like_count, comment_count, share_count, engagement_score, cohort_level, tags, created_at
    from scored_posts
    order by 
        (engagement_score * personalization_multiplier) + noise desc
    limit p_limit offset p_offset;
end;
$$ language plpgsql stable;
