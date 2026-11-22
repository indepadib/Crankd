'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    authError: string | null;
    recovering: boolean;
    retryAuth: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    authError: null,
    recovering: false,
    retryAuth: async () => {},
    signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Profile synchronization is deliberately OUTSIDE onAuthStateChange.
// Supabase warns that asynchronous Supabase API calls from inside that callback
// can deadlock the auth lock and prevent token refresh.
async function ensureProfileExists(currentUser: User): Promise<boolean> {
    try {
        const { data, error } = await supabase.from('profiles')
            .select('id').eq('id', currentUser.id).maybeSingle();
        if (error) throw error; // Never try an insert after a failed SELECT (e.g., 401).

        if (!data) {
            const rawUsername = String(currentUser.user_metadata?.username ||
                currentUser.email?.split('@')[0] || 'user_' + currentUser.id.substring(0, 5));
            const baseUsername = rawUsername.trim().replace(/[^a-zA-Z0-9_.]/g, '_').slice(0, 28)
                || 'user_' + currentUser.id.substring(0, 5);
            const fullName = String(currentUser.user_metadata?.full_name || baseUsername);
            const avatarUrl = String(currentUser.user_metadata?.avatar_url || '');
            let inserted = false;

            for (let suffix = 0; suffix < 8; suffix++) {
                const username = suffix === 0 ? baseUsername : baseUsername.slice(0, 24) + '_' + suffix;
                const { error: insertError } = await supabase.from('profiles').insert({
                    id: currentUser.id, username, full_name: fullName, avatar_url: avatarUrl,
                });
                if (!insertError) { inserted = true; break; }
                if (insertError.code !== '23505') throw insertError;
            }
            if (!inserted) throw new Error('Aucun pseudo disponible pour ce compte.');
        }

        const meta = currentUser.user_metadata || {};
        const firstName = typeof meta.first_name === 'string' ? meta.first_name.trim() : '';
        const lastName = typeof meta.last_name === 'string' ? meta.last_name.trim() : '';
        const contactPhone = typeof meta.contact_phone === 'string' ? meta.contact_phone.trim() : '';
        const city = typeof meta.city === 'string' ? meta.city.trim() : '';
        const intent = ['buy', 'sell', 'explore'].includes(meta.account_intent)
            ? meta.account_intent : 'explore';

        if (firstName.length >= 2 && lastName.length >= 2 && contactPhone.length >= 9 && city.length >= 2) {
            const { error: memberError } = await supabase.from('member_details').upsert({
                user_id: currentUser.id, first_name: firstName, last_name: lastName,
                contact_phone: contactPhone, city, account_intent: intent,
                marketing_opt_in: meta.marketing_opt_in === true,
            }, { onConflict: 'user_id', ignoreDuplicates: true });
            if (memberError) console.warn('[Auth] Optional member detail sync failed:', memberError.code);
        }
        return true;
    } catch (cause) {
        console.warn('[Auth] Profile sync failed:', cause);
        return false;
    }
}

const EXPIRY_BUFFER_SECONDS = 90;
function requiresRefresh(session: Session | null): boolean {
    return !!session?.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + EXPIRY_BUFFER_SECONDS;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [recovering, setRecovering] = useState(false);
    const router = useRouter();
    const recoveryInFlight = useRef<Promise<void> | null>(null);
    const profileSyncUser = useRef<string | null>(null);
    const hadUserSession = useRef(false);
    const rejectedByServer = useRef(false);

    const syncState = useCallback((fresh: Session | null) => {
        // A cached expired access token must NEVER be treated as an authenticated session.
        const valid = fresh && !requiresRefresh(fresh) ? fresh : null;
        if (valid) hadUserSession.current = true;
        setSession(valid);
        setUser(valid?.user ?? null);
    }, []);

    const retryAuth = useCallback(async () => {
        if (recoveryInFlight.current) return recoveryInFlight.current;

        const task = (async () => {
            setRecovering(true);
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                let fresh = data.session;
                if (requiresRefresh(fresh) || rejectedByServer.current) {
                    // A single explicit refresh also covers inactive tabs which resumed after expiry.
                    const refreshed = await supabase.auth.refreshSession();
                    if (refreshed.error) throw refreshed.error;
                    fresh = refreshed.data.session;
                }
                if (requiresRefresh(fresh)) throw new Error('La session ne peut pas être renouvelée.');

                rejectedByServer.current = false;
                syncState(fresh);
                setAuthError(!fresh && hadUserSession.current ? 'Ta session a expiré. Reconnecte-toi pour continuer.' : null);
            } catch (cause) {
                console.warn('[Auth] Session renewal failed:', cause);
                // Do not revoke tokens on a transient network/Auth service outage.
                // Do not claim the user is authenticated while their JWT is expired.
                syncState(null);
                setAuthError('La session ne peut pas être vérifiée. Réessaie ou reconnecte-toi.');
            } finally {
                setLoading(false);
                setRecovering(false);
            }
        })();

        recoveryInFlight.current = task;
        try { await task; } finally { recoveryInFlight.current = null; }
    }, [syncState]);

    useEffect(() => {
        let mounted = true;
        const scheduledSyncs: number[] = [];

        const scheduleProfileSync = (currentUser: User) => {
            if (profileSyncUser.current === currentUser.id) return;
            profileSyncUser.current = currentUser.id;
            // Never start a database request synchronously in onAuthStateChange.
            const id = window.setTimeout(() => {
                if (!mounted) return;
                void ensureProfileExists(currentUser).then((ok) => {
                    if (!ok && profileSyncUser.current === currentUser.id) {
                        profileSyncUser.current = null; // Allow retry after an actual later sign-in.
                    }
                });
            }, 0);
            scheduledSyncs.push(id);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT') {
                profileSyncUser.current = null;
                hadUserSession.current = false;
                rejectedByServer.current = false;
                syncState(null);
                setAuthError(null);
            } else if (nextSession && !requiresRefresh(nextSession)) {
                syncState(nextSession);
                rejectedByServer.current = false;
                setAuthError(null);
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    scheduleProfileSync(nextSession.user);
                }
            } else if (nextSession && requiresRefresh(nextSession)) {
                syncState(null);
                setAuthError('Session expirée. Renouvelle la connexion.');
            } else {
                syncState(null);
            }
            setLoading(false);
        });

        // getSession refreshes cached sessions on load; our own preflight also
        // explicitly refreshes old tokens if auth initialization returned a stale JWT.
        void retryAuth();

        // The API can reject a JWT even when the device clock says it has not
        // expired. A PostgREST JWT-expired error takes precedence over local time.
        const whenServerRejectsJwt = () => {
            if (!mounted) return;
            rejectedByServer.current = true;
            syncState(null);
            setAuthError('Ta session est expirée. Réessaie ou reconnecte-toi pour poursuivre.');
            setLoading(false);
        };
        window.addEventListener('vrooq:auth-expired', whenServerRejectsJwt);

        let lastVisibilityCheck = 0;
        const whenVisible = () => {
            if (document.visibilityState !== 'visible') return;
            if (Date.now() - lastVisibilityCheck < 15_000) return;
            lastVisibilityCheck = Date.now();
            void retryAuth();
        };
        window.addEventListener('focus', whenVisible);
        document.addEventListener('visibilitychange', whenVisible);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            scheduledSyncs.forEach((id) => window.clearTimeout(id));
            window.removeEventListener('vrooq:auth-expired', whenServerRejectsJwt);
            window.removeEventListener('focus', whenVisible);
            document.removeEventListener('visibilitychange', whenVisible);
        };
    }, [retryAuth, syncState]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch (cause) {
            console.warn('[Auth] Sign out failed:', cause);
        } finally {
            syncState(null);
            profileSyncUser.current = null;
            hadUserSession.current = false;
            rejectedByServer.current = false;
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, authError, recovering, retryAuth, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
