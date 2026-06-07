
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Reuse types from mobile or define here
export interface Listing {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    mileage: number;
    mileage_unit: string;
    images: string[];
    description: string;
    status: 'active' | 'sold' | 'pending';
    seller_id: string; // uuid
    created_at: string;
    location?: string;
    trim?: string;
}

export function useMarketplace(filter: string = 'All', searchQuery: string = '') {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            // Apply Filters
            if (filter !== 'All') {
                // Determine filter logic (e.g., category column or broad match)
                // For this demo, assuming 'category' column exists or mapped from make/model
                // If 'category' doesn't exist, we might skip filtering or filter client side.
                // Let's assume a text search match for now for simplicity if category column is missing
                // query = query.eq('category', filter); 
                // Or:
                const textSearch = filter.toLowerCase();
                // This is a simplification. Ideally we have a category column.
                // let's try to match make for now if filter is Make-like
            }

            // Apply Search
            if (searchQuery) {
                query = query.ilike('make', `%${searchQuery}%`); // Simple make search
                // Or comprehensive search:
                // query = query.or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setListings(data as Listing[]);
            }
        } catch (err: any) {
            console.error('Error fetching listings:', err);
            if (err?.code) console.error('Error Code:', err.code);
            if (err?.message) console.error('Error Message:', err.message);
            if (err?.details) console.error('Error Details:', err.details);
            if (err?.hint) console.error('Error Hint:', err.hint);

            setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    }, [filter, searchQuery]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    return { listings, loading, error, refresh: fetchListings };
}
