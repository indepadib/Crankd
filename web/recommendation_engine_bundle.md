# Recommendation Engine Code Bundle

Here is the aggregated code for the Recommendation Engine features, including Backend Algorithm, Hooks, and Frontend Components.

## 1. Backend Algorithm (`backend/algorithm.sql`)

```sql
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
```

## 2. useFeed Hook (`web/hooks/useFeed.ts`)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';

// Mock Supabase Client for this demonstration
// In production: import { createClient } from '@/utils/supabase/client';

export function useFeed(userId?: string) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        // SIMULATION of the SQL function `get_personalized_feed`
        // In reality: const { data } = await supabase.rpc('get_personalized_feed', { p_user_id: userId });
        
        await new Promise(r => setTimeout(r, 800)); // Network delay

        // Mock Response matching the Schema
        // We return a mix of different content types to test the polymorphic logic
        const newPosts: Post[] = [
             {
                id: '1', author_id: 'u1', content_type: 'vehicle_showcase',
                title: 'The CSL Project Begins', body: 'Restoration starts now.',
                view_count: 1240, like_count: 284, comment_count: 142, engagement_score: 1500, cohort_level: 1,
                tags: ['BMW', 'E46', 'Restoration', 'High Value'], created_at: new Date().toISOString(),
                author: { id: 'u1', username: 'DriftKing', full_name: 'DK', garage_rank: 50, avatar_url: 'DK' },
                vehicle: { id: 'v1', vin: '...', make: 'BMW', model: 'M3 CSL', year: 2003, health_score: 98, image_url: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop' }
            },
            {
                id: '2', author_id: 'u2', content_type: 'maintenance_log',
                title: 'Values Adjustment', body: 'S54 Valve Adjustment done. Clearances were way off on exhaust side.',
                view_count: 300, like_count: 340, comment_count: 12, engagement_score: 200, cohort_level: 0,
                tags: ['Maintenance', 'DIY', 'Porsche'], created_at: new Date().toISOString(),
                author: { id: 'u2', username: 'PorscheGuy', full_name: 'Flat6 Lover', garage_rank: 80, avatar_url: 'PG' },
                log: { id: 'l1', vehicle_id: 'v1', occurred_at: '2023-10-01', service_type: 'maintenance', title: 'Annual Service', cost_amount: 1200, cost_currency: 'USD', is_verified: true, description: 'Full fluid flush and inspection.' }
            },
            {
                 id: '3', author_id: 'u3', content_type: 'convoy',
                 title: 'Midnight Run', body: 'Heading to the mountains.',
                 view_count: 890, like_count: 890, comment_count: 154, engagement_score: 800, cohort_level: 1,
                 tags: ['Meet', 'Night Run'], created_at: new Date().toISOString(),
                 author: { id: 'u3', username: 'TougeClub', full_name: 'Touge Official', garage_rank: 90, avatar_url: 'TC' },
                 convoy_id: 'c1' 
                 // Note: Convoy details would typically be joined, mocking simplified here
            },
            {
                id: '4', author_id: 'u4', content_type: 'vehicle_showcase',
                title: 'Godzilla Returns', body: 'Fresh from the dyno. 700whp on pump gas.',
                view_count: 5600, like_count: 5600, comment_count: 400, engagement_score: 9000, cohort_level: 2,
                tags: ['High HP', 'Build', 'JDM'], created_at: new Date().toISOString(),
                author: { id: 'u4', username: 'JDM_Legend', full_name: 'R34 God', garage_rank: 95, avatar_url: 'JL' },
                vehicle: { id: 'v4', vin: '...', make: 'Nissan', model: 'Skyline GT-R', year: 1999, trim: 'V-Spec', health_score: 92, image_url: 'https://images.unsplash.com/photo-1619623055909-e33a6933c1eb?q=80&w=2600&auto=format&fit=crop' }
            }
        ];
        
        setPosts(prev => [...prev, ...newPosts]);
        setLoading(false);
    }, [userId]);

    const logView = useCallback(async (postId: string, durationSeconds: number) => {
        if (durationSeconds < 1) return;
        // console.log(`[Algorithm] Logging View: Post ${postId} for ${durationSeconds}s`);
        
        // In reality: 
        // supabase.from('post_interactions').insert({ 
        //    post_id: postId, user_id: userId, interaction_type: 'view', duration_seconds: durationSeconds 
        // });
    }, [userId]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    return { posts, loading, logView, refresh: () => { setPosts([]); fetchFeed(); } };
}
```

## 3. Feed Component (`web/components/Feed.tsx`)

```tsx
'use client';

import { Heart, MessageCircle, Share2, MapPin, Wrench, Calendar, ChevronRight, Sparkles, Sliders, X } from 'lucide-react';
import { Post } from '@/types'; // Use shared type
import { VehicleCard } from './VehicleCard';
import { DiscoverView } from './DiscoverView';
import { DashboardSidebar } from './DashboardSidebar';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFeed } from '@/hooks/useFeed';

function FeedTuner() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="col-span-1 aspect-[4/2] md:aspect-auto md:h-full bg-gradient-to-br from-carbon to-black rounded-3xl border border-white/5 p-6 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-signal-orange mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Crankd Intelligence</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Fine-tune your feed</h3>
                    <p className="text-sm text-text-dim">Our algorithm adapts to your garage.</p>
                </div>

                <div className="space-y-2 mt-4">
                    {['More Track Builds', 'Less Stance', 'Euro Parts'].map(opt => (
                        <button key={opt} className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-signal-orange/30 text-sm text-white transition-all flex items-center justify-between group/btn">
                            {opt}
                            <Sliders className="h-3 w-3 text-white/30 group-hover/btn:text-signal-orange transition-colors" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-signal-orange/10 rounded-full blur-3xl group-hover:bg-signal-orange/20 transition-colors" />
        </motion.div>
    );
}

function FeedItem({ post, onView }: { post: Post; onView: (id: string, duration: number) => void }) {
    // Dynamic Sizing based on Cohort Level (Algorithm Visualization)
    // Level 2+ (Trending) or 3 (Viral) gets larger slot
    const isLarge = post.cohort_level >= 2;
    
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const startTime = useRef<number>(0);

    const handleLike = () => {
        if (!liked) {
            setLiked(true);
            setLikeCount(prev => prev + 1);
        } else {
            setLiked(false);
            setLikeCount(prev => prev - 1);
        }
    };

    // Helper to format content based on polymorphic type
    const getImage = () => {
        if (post.vehicle?.image_url) return post.vehicle.image_url;
        // Fallbacks or other types
        return null;
    };
    
    // AI Context Simulation (Personalization Tag Match)
    const matchScore = post.tags?.includes('BMW') ? 99 : Math.floor(Math.random() * 30 + 70);
    const matchReason = post.tags?.[0] ? `Matches ${post.tags[0]}` : 'Trending';

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            onViewportEnter={() => { startTime.current = Date.now(); }}
            onViewportLeave={() => { 
                const duration = (Date.now() - startTime.current) / 1000;
                onView(post.id, duration);
            }}
            transition={{ duration: 0.5 }}
            className={clsx(
                "group relative overflow-hidden rounded-3xl bg-steel border border-white/5 hover:border-white/10 transition-all duration-300",
                isLarge ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-video' : 'col-span-1 aspect-square md:aspect-[4/5]'
            )}
        >

            {/* Background Image / Content */}
            {getImage() ? (
                <div className="absolute inset-0">
                    <img
                        src={getImage()!}
                        alt={post.title || 'Feed Image'}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent opacity-90" />
                </div>
            ) : post.content_type === 'convoy' ? (
                <div className="absolute inset-0 bg-signal-orange/10">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-carbon to-transparent" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-steel-light to-steel" />
            )}

            {/* AI Context Chip - "Sober AI" */}
            <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-medium text-white shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Sparkles className="h-3 w-3 text-signal-orange" />
                    <span className="text-white/80">Matched:</span>
                    <span className="text-white font-bold">{matchScore}%</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/80">{matchReason}</span>
                </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white border border-white/10 overflow-hidden">
                        {post.author?.avatar_url || post.author?.username?.[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white drop-shadow-md">{post.author?.username}</span>
                        {/* <span className="text-xs text-white/50">{post.created_at}</span> */} 
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        {post.title && (
                            <h3 className={`font-black uppercase tracking-tighter text-white drop-shadow-lg ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
                                {post.title}
                            </h3>
                        )}

                        {post.body && (
                            <p className="text-white/70 text-sm line-clamp-2">{post.body}</p>
                        )}

                        {post.content_type === 'maintenance_log' && post.log && (
                            <div className="bg-carbon/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <Wrench className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Maintenance Record</span>
                                </div>
                                <div className="text-white font-bold text-lg">{post.log.title}</div>
                                <div className="text-white/50 text-sm">{post.log.occurred_at} • {post.log.cost_currency} {post.log.cost_amount}</div>
                            </div>
                        )}

                        {post.content_type === 'convoy' && (
                            <div className="bg-carbon/80 backdrop-blur-md rounded-xl p-4 border border-signal-orange/30 group-hover:border-signal-orange transition-colors">
                                <div className="flex items-center gap-3 mb-2 text-signal-orange">
                                    <MapPin className="h-5 w-5" />
                                    <span className="font-bold text-sm uppercase">Convoy Invite</span>
                                </div>
                                <h4 className="font-black text-xl text-white uppercase italic">{post.title}</h4>
                                <div className="mt-2 text-white/70 text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {/* Mock date for now */}
                                    Sat, Oct 28 • 10:00 PM
                                </div>
                                <div className="mt-4">
                                    <button className="w-full py-2 bg-signal-orange text-white font-bold rounded-lg text-sm hover:bg-orange-600 transition-colors">
                                        RSVP
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Stats Row */}
                    {post.content_type !== 'convoy' && (
                        <div className="flex items-center gap-6 pt-2">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 group/btn"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Heart className={clsx("h-5 w-5 transition-colors", liked ? "fill-signal-orange text-signal-orange" : "text-white group-hover/btn:text-signal-orange")} />
                                </motion.div>
                                <span className={clsx("text-sm font-bold", liked ? "text-white" : "text-white/50")}>{likeCount}</span>
                            </button>

                            <button className="flex items-center gap-2 group/btn">
                                <MessageCircle className="h-5 w-5 text-white/50 group-hover/btn:text-white transition-colors" />
                                <span className="text-sm font-bold text-white/50">{post.comment_count}</span>
                            </button>

                            <button className="flex items-center gap-2 group/btn ml-auto">
                                <Share2 className="h-5 w-5 text-white/50 group-hover/btn:text-white transition-colors" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export function Feed() {
    const [view, setView] = useState<'following' | 'discover'>('discover');
    const { posts, loading, logView } = useFeed('current-user');

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header / Filter */}
            <header className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
                        {view === 'following' ? 'Good Evening, Driver' : 'Discover'}
                    </h1>
                    <p className="text-text-dim text-sm">
                        {view === 'following' ? 'Here is your command center.' : 'Trending stories and builds.'}
                    </p>
                </div>
                <div className="flex gap-4 relative">
                    <button
                        onClick={() => setView('following')}
                        className={`text-sm font-bold pb-2 transition-colors relative ${view === 'following' ? 'text-white' : 'text-text-dim hover:text-white'}`}
                    >
                        Following
                        {view === 'following' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-signal-orange" />}
                    </button>
                    <button
                        onClick={() => setView('discover')}
                        className={`text-sm font-bold pb-2 transition-colors relative ${view === 'discover' ? 'text-white' : 'text-text-dim hover:text-white'}`}
                    >
                        Discover
                        {view === 'discover' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-signal-orange" />}
                    </button>
                </div>
            </header>

            {/* Content Switcher */}
            {view === 'following' ? (
                <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Feed */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
                        {loading && posts.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-white/50">Loading Feed...</div>
                        ) : (
                            posts.map((post, idx) => (
                                <>
                                    {/* Insert Tuner randomly (e.g. at index 2) */}
                                    {idx === 1 && <FeedTuner key="tuner" />}
                                    <FeedItem key={post.id} post={post} onView={logView} />
                                </>
                            ))
                        )}
                    </div>

                    {/* Dashboard Sidebar (Desktop) */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <DashboardSidebar />
                    </div>
                </div>
            ) : (
                <DiscoverView />
            )}
        </div>
    );
}
```

## 4. Types (`web/types/index.ts`)

```typescript
// web/types/index.ts

export interface Vehicle {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    specs?: Record<string, any>;
    health_score: number;
    image_url?: string; // Derived/Mocked
}

export interface MaintenanceLog {
    id: string;
    vehicle_id: string;
    occurred_at: string;
    service_type: 'maintenance' | 'modification' | 'repair' | 'detailing';
    title: string;
    description?: string;
    cost_amount?: number;
    cost_currency: string;
    odometer_reading?: number;
    is_verified: boolean;
}

export interface UserProfile {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    garage_rank: number;
}

export interface Post {
    id: string;
    author_id: string;
    content_type: 'media' | 'maintenance_log' | 'listing' | 'convoy' | 'vehicle_showcase';
    media_id?: string;
    log_id?: string;
    listing_id?: string;
    convoy_id?: string;
    
    title?: string;
    body?: string;
    
    view_count: number;
    like_count: number;
    comment_count: number;
    engagement_score: number;
    cohort_level: number;
    tags?: string[];
    created_at: string;

    // Joined Data (Supabase Relations)
    author?: UserProfile;
    vehicle_id?: string; // Sometimes linked
    vehicle?: Vehicle;
    log?: MaintenanceLog;
}
```
