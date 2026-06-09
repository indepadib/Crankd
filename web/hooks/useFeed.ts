import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { supabase } from '@/lib/supabase';

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
        let savedLocal = localStorage.getItem('local-posts');
        let localList = savedLocal ? JSON.parse(savedLocal) : [];

        const hasSeeds = localList.some((p: any) => p.id && p.id.startsWith('seed-post'));
        if (!hasSeeds) {
            const seedPosts = [
                {
                    id: 'seed-post-1',
                    author_id: 'seed-author-1',
                    title: 'Toyota Supra JZA80 Dyno Run',
                    body: JSON.stringify({
                        chassis: 'JZA80 / 2JZ-GTE',
                        hp: '820',
                        mods: 'Garrett G35-900, HKS Exhaust, Link G4X',
                        cost: '14500',
                        text: 'Tuning session on the twin-turbo setup. Screaming to 8000 RPM under load!'
                    }),
                    image_url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-in-a-parking-lot-40439-large.mp4',
                    content_type: 'video',
                    tags: ['JDM', 'Supra', 'Dyno'],
                    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                    like_count: 1240,
                    view_count: 5400,
                    comment_count: 2,
                    author: { id: 'seed-author-1', username: 'SupraSupremacy', avatar_url: '', garage_rank: 2 }
                },
                {
                    id: 'seed-post-2',
                    author_id: 'seed-author-2',
                    title: 'Singer Porsche 911 Mountain Run',
                    body: JSON.stringify({
                        chassis: '964 / 4.0L Flat-6',
                        hp: '390',
                        mods: 'Singer Custom Engine, Ohlins Suspension, Brembo Brakes',
                        cost: '125000',
                        text: 'Testing the flat-six response on high-altitude twists. Aircooled perfection.'
                    }),
                    image_url: 'https://assets.mixkit.co/videos/preview/mixkit-porsche-car-driving-on-a-curved-road-41482-large.mp4',
                    content_type: 'video',
                    tags: ['Porsche', 'Singer', 'MountainRun'],
                    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
                    like_count: 3820,
                    view_count: 12500,
                    comment_count: 3,
                    author: { id: 'seed-author-2', username: 'Flat6Fever', avatar_url: '', garage_rank: 3 }
                },
                {
                    id: 'seed-post-3',
                    author_id: 'seed-author-3',
                    title: 'S54 Valve Clearance Adjustment',
                    body: JSON.stringify({
                        chassis: 'E46 M3 / S54',
                        hp: '343',
                        mods: 'OEM Valve Shims, Beisan VANOS Kit',
                        cost: '450',
                        text: 'DIY garage day. Restoring the clearances on the E46 M3 engine block.'
                    }),
                    image_url: 'https://assets.mixkit.co/videos/preview/mixkit-mechanic-hands-repairing-a-car-engine-40488-large.mp4',
                    content_type: 'video',
                    tags: ['Maintenance', 'DIY', 'BMW'],
                    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
                    like_count: 850,
                    view_count: 2100,
                    comment_count: 1,
                    author: { id: 'seed-author-3', username: 'E46_Wrench', avatar_url: '', garage_rank: 1 }
                }
            ];
            localList = [...seedPosts, ...localList];
            localStorage.setItem('local-posts', JSON.stringify(localList));
            localStorage.setItem('feed-seeded', 'true');
        }

        // Combine: Local Posts -> DB Posts
        const combined = [
            ...localList,
            ...dbPosts
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
