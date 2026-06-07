import { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';
import { supabase } from '../lib/supabase';

export function useFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Call the Postgres function we defined in the backend
            // RPC: remote procedure call
            const { data, error: rpcError } = await supabase
                .rpc('get_personalized_feed', {
                    p_user_id: (await supabase.auth.getUser()).data.user?.id
                });

            if (rpcError) throw rpcError;

            if (data) {
                // Map the raw data to our Post type if necessary
                // The RPC return type matches our Post structure closely
                setPosts(data as Post[]);
            }
        } catch (err: any) {
            console.error('Error fetching feed:', err);
            setError(err.message || 'Failed to load feed');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    return { posts, loading, error, refresh: fetchFeed };
}
