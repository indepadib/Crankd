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
        const savedLocal = localStorage.getItem('local-posts');
        const localList = savedLocal ? JSON.parse(savedLocal) : [];

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
