
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    image_url?: string;
    health_score?: number; // Not in DB yet, mock it or simple calc
    mods?: string[]; // Not in DB yet
    owner_id: string;
}

export function useGarage(userId?: string) {
    const { session, loading: authLoading, recovering } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGarage = useCallback(async () => {
        if (authLoading || recovering) return;
        if (userId && !session?.access_token) {
            setVehicles([]);
            setError('Ta session a expiré. Reconnecte-toi pour accéder au garage.');
            setLoading(false);
            return;
        }
        if (!userId) {
            setVehicles([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Enrich data with mock props if missing from DB schema v1
                const enrichedData = data.map(v => ({
                    ...v,
                    health_score: 98, // Mock default
                    mods: ['Stock'],  // Mock default
                }));
                setVehicles(enrichedData as Vehicle[]);
            }
        } catch (err: unknown) {
            console.error('Error fetching garage:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch garage');
        } finally {
            setLoading(false);
        }
    }, [userId, authLoading, recovering, session?.access_token]);

    useEffect(() => {
        fetchGarage();
    }, [fetchGarage]);

    const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'owner_id' | 'health_score' | 'mods'>) => {
        if (!userId) throw new Error('User not logged in');

        try {
            const { error } = await supabase.from('vehicles').insert({
                owner_id: userId,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                image_url: vehicle.image_url
            });

            if (error) throw error;
            fetchGarage(); // Refresh list
        } catch (err) {
            console.error('Error adding vehicle:', err);
            throw err;
        }
    };

    return { vehicles, loading, error, refresh: fetchGarage, addVehicle };
}
