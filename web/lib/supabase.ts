import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (supabaseUrl) {
    supabaseUrl = supabaseUrl.replace(/\/+$/, '');
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1$/, '');
}
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] Required public configuration is missing.');
}

// One shared browser client. Never use a service-role/secret key in NEXT_PUBLIC_.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const publishableKey = supabaseKey || 'placeholder-key';
const authErrorEvent = 'vrooq:auth-expired';

// A stale browser clock, suspended tab or refresh failure may leave a Supabase
// client sending a token after its server-side expiry. Our AuthProvider checks
// sessions proactively; this fetch wrapper is the last line of defense when
// PostgREST confirms the token has expired.
let refreshInFlight: Promise<string | null> | null = null;
let lastFailedToken: string | null = null;
let lastFailedAt = 0;

function notifyReauthenticationRequired() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(authErrorEvent));
    }
}

async function recoverAccessToken(rejectedToken: string): Promise<string | null> {
    // An expired token can appear on multiple requests. Do not retry the same
    // invalid refresh token repeatedly or cause parallel refresh storms.
    if (lastFailedToken === rejectedToken && Date.now() - lastFailedAt < 30_000) {
        return null;
    }
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        try {
            const { data: current } = await supabase.auth.getSession();
            if (current.session?.access_token &&
                current.session.access_token !== rejectedToken) {
                lastFailedToken = null;
                return current.session.access_token;
            }

            // Force a refresh even if the browser clock mistakenly considers
            // the rejected JWT valid. The server's PGRST303 is authoritative.
            const { data, error } = await supabase.auth.refreshSession();
            const token = !error ? data.session?.access_token : null;
            if (!token || token === rejectedToken) {
                lastFailedToken = rejectedToken;
                lastFailedAt = Date.now();
                return null;
            }
            lastFailedToken = null;
            return token;
        } catch {
            lastFailedToken = rejectedToken;
            lastFailedAt = Date.now();
            return null;
        }
    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}

async function fetchWithExpiredJwtRecovery(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    // Do not reconstruct Auth, Storage or multipart upload requests. Their
    // Request bodies and streaming semantics must remain completely untouched.
    const incomingUrl = input instanceof Request ? input.url : String(input);
    let target: URL;
    try {
        target = new URL(incomingUrl);
    } catch {
        return fetch(input, init);
    }
    if (target.origin !== url || !target.pathname.startsWith('/rest/v1/')) {
        return fetch(input, init);
    }

    const request = new Request(input, init);
    const requestUrl = target;
    const isRest = true;
    const readOnlyRpc = request.method === 'POST' &&
        requestUrl.pathname === '/rest/v1/rpc/get_personalized_feed';
    const canReplay = request.method === 'GET' || request.method === 'HEAD' || readOnlyRpc;
    const safeCopy = canReplay ? request.clone() : null;

    const response = await fetch(request);
    if (typeof window === 'undefined' || response.status !== 401 || !isRest) {
        return response;
    }

    let error: { code?: string; message?: string };
    try {
        error = (await response.clone().json()) as { code?: string; message?: string };
    } catch {
        return response;
    }
    if (error.code !== 'PGRST303' || !/jwt expired/i.test(error.message || '')) {
        return response;
    }

    const oldAuth = request.headers.get('authorization');
    const rejectedToken = oldAuth?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!rejectedToken || rejectedToken === publishableKey) {
        // A rejected public key is a configuration issue, not a user refresh.
        return response;
    }

    const token = await recoverAccessToken(rejectedToken);
    if (!token) {
        notifyReauthenticationRequired();
        return response;
    }

    // Retrying non-idempotent writes may duplicate an order or post. A failed
    // write should instead be repeated explicitly by the user after recovery.
    if (!safeCopy) return response;

    const headers = new Headers(safeCopy.headers);
    headers.set('authorization', 'Bearer ' + token);
    const retried = await fetch(new Request(safeCopy, { headers }));
    if (retried.status === 401) {
        try {
            const retryError = (await retried.clone().json()) as { code?: string; message?: string };
            if (retryError.code === 'PGRST303' && /jwt expired/i.test(retryError.message || '')) {
                notifyReauthenticationRequired();
            }
        } catch { /* Non-JSON auth failure. */ }
    }
    return retried;
}

export const supabase = createClient(url, publishableKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
    global: {
        fetch: fetchWithExpiredJwtRecovery,
    },
});
