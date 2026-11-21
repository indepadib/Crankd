import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { supabase } from '@/lib/supabase';

// Only database-confirmed posts belong in the shared feed.
// Older versions wrote to localStorage after a failed publish and seeded fake posts.
// We report unpublished local drafts separately, never as public community content.
export function useFeed(userId?: string) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unpublishedCount, setUnpublishedCount] = useState(0);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (userId) {
            try {
                const saved = window.localStorage.getItem('local-posts');
                const parsed: unknown = saved ? JSON.parse(saved) : [];
                const unsent = Array.isArray(parsed)
                    ? parsed.filter((item): item is { id: string; author_id: string } => (
                        item !== null && typeof item === 'object' &&
                        typeof item.id === 'string' && item.id.startsWith('local-post-') &&
                        !item.id.startsWith('seed-post-') &&
                        item.author_id === userId
                    ))
                    : [];
                setUnpublishedCount(unsent.length);
            } catch {
                setUnpublishedCount(0);
            }
        } else {
            setUnpublishedCount(0);
        }

        try {
            const { data, error: queryError } = await supabase.rpc('get_personalized_feed', {
                p_user_id: userId || '00000000-0000-0000-0000-000000000000',
                p_limit: 20,
                p_offset: 0,
            });
            if (queryError) throw queryError;
            setPosts(Array.isArray(data) ? (data as Post[]) : []);
        } catch (cause) {
            console.warn('[VROOQ Feed] Shared feed could not be loaded:', cause);
            setPosts([]);
            setError('Le fil des publications est momentanément indisponible. Réessaie dans un instant.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { void fetchFeed(); }, [fetchFeed]);

    const logView = useCallback(async (postId: string, durationSeconds: number) => {
        if (!userId || durationSeconds < 1 || postId.startsWith('local-')) return;
        try {
            await supabase.from('post_interactions').insert({
                post_id: postId,
                user_id: userId,
                interaction_type: 'view',
                duration_seconds: durationSeconds,
            });
        } catch {
            // Noncritical event logging must not block reading the feed.
        }
    }, [userId]);

    return { posts, loading, error, unpublishedCount, logView, refresh: fetchFeed };
}
