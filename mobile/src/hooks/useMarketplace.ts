import { useState, useEffect, useCallback } from 'react';
import { Listing } from '../types';
import { supabase } from '../lib/supabase';

export function useMarketplace(activeFilter: string = 'All', searchQuery: string = '') {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = useCallback(async () => {
        try {
            setLoading(true);

            // Construct Query
            let query = supabase
                .from('listings')
                .select(`
                    *,
                    seller:users!seller_id(*),
                    vehicle:vehicles!vehicle_id(*)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            // Apply Filters (Mock-ish logic since we need complex joins)
            // In a real app we'd filter on the joined vehicle table or using a View
            // For now, we fetch all active listings and filter in memory for 'Make' 
            // because Supabase filtering on related tables is tricky in JS client without exact FK knowledge setup

            const { data, error } = await query;
            if (error) throw error;

            if (data) {
                let filtered = data as Listing[];

                // Filter by Make
                if (activeFilter !== 'All' && activeFilter !== 'Under $50k' && activeFilter !== 'Manual') {
                    filtered = filtered.filter(l => l.vehicle?.make === activeFilter);
                }

                // Filter by Price
                if (activeFilter === 'Under $50k') {
                    filtered = filtered.filter(l => l.price_amount < 50000);
                }

                // Filter by Query
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    filtered = filtered.filter(l =>
                        l.vehicle?.make.toLowerCase().includes(q) ||
                        l.vehicle?.model.toLowerCase().includes(q)
                    );
                }

                setListings(filtered);
            }
        } catch (err) {
            console.error('Error fetching marketplace:', err);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, searchQuery]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    return { listings, loading, refresh: fetchListings };
}
