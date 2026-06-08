import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { supabase } from '@/lib/supabase';

// Rich mock data so the feed always looks alive even without a backend
const MOCK_POSTS: Post[] = [
    {
        id: '1',
        author_id: 'u1',
        content_type: 'media',
        title: 'TRACK DAY PREP — M3 GETS CAGED',
        body: 'Spent the weekend fitting a custom rollcage. The power-to-weight ratio after stripping the interior is insane.',
        view_count: 8420,
        like_count: 1203,
        comment_count: 87,
        engagement_score: 0.95,
        cohort_level: 3,
        tags: ['BMW', 'M3', 'TrackDay', 'Cage'],
        created_at: '2026-06-06T10:00:00Z',
        author: { id: 'u1', username: '@DriftKing', garage_rank: 1, avatar_url: '' },
        vehicle: { id: 'v1', vin: '', make: 'BMW', model: 'M3', year: 2019, health_score: 98, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
    },
    {
        id: '2',
        author_id: 'u2',
        content_type: 'maintenance_log',
        title: 'FULL ENGINE REBUILD',
        body: 'Documenting my full 2JZ rebuild with forged internals.',
        view_count: 5100,
        like_count: 934,
        comment_count: 62,
        engagement_score: 0.88,
        cohort_level: 2,
        tags: ['2JZ', 'Supra', 'BuildLog'],
        created_at: '2026-06-05T14:30:00Z',
        author: { id: 'u2', username: '@MechanicMike', garage_rank: 3, avatar_url: '' },
        vehicle: { id: 'v2', vin: '', make: 'Toyota', model: 'Supra', year: 1997, health_score: 82, image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80' },
        log: { id: 'l1', vehicle_id: 'v2', occurred_at: '2026-06-01', service_type: 'repair', title: '2JZ Forged Rebuild — 700whp Target', cost_amount: 14500, cost_currency: 'USD', is_verified: true },
    },
    {
        id: '3',
        author_id: 'u3',
        content_type: 'convoy',
        title: 'MIDNIGHT CANYON RUN — DUBAI',
        body: '{"startPoint":"Marina Mall","endPoint":"Jebel Jais Peak","dateTime":"Oct 28 • 10:00 PM","location":"Dubai","cruiseStyle":"Canyon Run","pace":"Spirited","requiredGear":["Walkie-Talkie (Comms)","Full Tank of Gas"],"text":"Angeles Crest styling canyon route. Meeting at Marina Mall parking lot. Safety briefing at 9:45 PM. Dynamic elevation and sweeps."}',
        view_count: 3200,
        like_count: 672,
        comment_count: 44,
        engagement_score: 0.80,
        cohort_level: 2,
        tags: ['Convoy', 'Dubai', 'NightRun'],
        created_at: '2026-06-04T22:00:00Z',
        author: { id: 'u3', username: '@SheikhSpeed', garage_rank: 5, avatar_url: '' },
    },
    {
        id: '4',
        author_id: 'u4',
        content_type: 'media',
        title: 'WIDEBODY GT-R — FINAL REVEAL',
        body: 'Two years in the making. LBWK widebody, 800whp. This is it.',
        view_count: 12800,
        like_count: 2340,
        comment_count: 198,
        engagement_score: 0.97,
        cohort_level: 3,
        tags: ['GTR', 'Widebody', 'LBWK', 'Build'],
        created_at: '2026-06-03T09:00:00Z',
        author: { id: 'u4', username: '@NightRacerJP', garage_rank: 2, avatar_url: '' },
        vehicle: { id: 'v4', vin: '', make: 'Nissan', model: 'GT-R', year: 2012, health_score: 91, image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80' },
    },
    {
        id: '5',
        author_id: 'u5',
        content_type: 'media',
        title: 'PORSCHE 911 — SINGER STYLE BUILD',
        body: 'Restomod with a passion. Every bolt torqued by hand.',
        view_count: 7300,
        like_count: 1560,
        comment_count: 120,
        engagement_score: 0.92,
        cohort_level: 2,
        tags: ['Porsche', '911', 'Restomod', 'Singer'],
        created_at: '2026-06-02T12:00:00Z',
        author: { id: 'u5', username: '@ClassicGarage', garage_rank: 4, avatar_url: '' },
        vehicle: { id: 'v5', vin: '', make: 'Porsche', model: '911', year: 1973, health_score: 96, image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80' },
    },
];

export function useFeed(userId?: string) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        setError(null);

        let dbPosts: Post[] = [];
        try {
            const { data, error } = await supabase
                .rpc('get_personalized_feed', {
                    p_user_id: userId || '00000000-0000-0000-0000-000000000000',
                    p_limit: 20,
                    p_offset: 0
                });

            if (!error && data) {
                dbPosts = data as unknown as Post[];
            }
        } catch (err: any) {
            console.warn('[Feed] RPC query failed, using offline fallback:', err?.message);
        }

        // Fetch local posts
        const savedLocal = localStorage.getItem('local-posts');
        const localList = savedLocal ? JSON.parse(savedLocal) : [];

        // Combine: Local Posts -> DB Posts -> Mock Posts
        const combined = [
            ...localList,
            ...dbPosts,
            ...MOCK_POSTS
        ];

        // Filter out duplicate IDs
        const uniquePosts = combined.reduce((acc: Post[], current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        setPosts(uniquePosts);
        setLoading(false);
    }, [userId]);

    const logView = useCallback(async (postId: string, durationSeconds: number) => {
        if (durationSeconds < 1 || !userId) return;
        try {
            await supabase.from('post_interactions').insert({
                post_id: postId,
                user_id: userId,
                interaction_type: 'view',
                duration_seconds: durationSeconds
            });
        } catch (e) {
            // Silent fail
        }
    }, [userId]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    return { posts, loading, error, logView, refresh: fetchFeed };
}
