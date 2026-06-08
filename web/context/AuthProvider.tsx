'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const ensureProfileExists = async (currentUser: User) => {
        if (!currentUser) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (!data) {
                const baseUsername = currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || `user_${currentUser.id.substring(0, 5)}`;
                const fullName = currentUser.user_metadata?.full_name || baseUsername;
                const avatarUrl = currentUser.user_metadata?.avatar_url || '';

                let success = false;
                let suffix = 0;
                let triedUsername = baseUsername;

                while (!success && suffix < 10) {
                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: currentUser.id,
                        username: triedUsername,
                        full_name: fullName,
                        avatar_url: avatarUrl
                    });

                    if (!insertError) {
                        success = true;
                        console.log(`[Auth] Profile automatically created with username: ${triedUsername}`);
                    } else if (insertError.code === '23505') {
                        // Unique violation (username taken), try appending suffix
                        suffix++;
                        triedUsername = `${baseUsername}_${suffix}`;
                    } else {
                        throw insertError;
                    }
                }
            }
        } catch (e) {
            console.warn('[Auth] Auto profile creation failed:', e);
        }
    };

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (!mounted) return;
                if (error) {
                    console.warn('[Auth] Session check failed:', error.message);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        ensureProfileExists(session.user);
                    }
                }
            } catch (error) {
                console.warn('[Auth] Unexpected error during session check:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user) {
                ensureProfileExists(session.user);
            }
        });

        // Safety net: always resolve loading after 3s max
        const timeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn('[Auth] Sign out error:', e);
        } finally {
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
