'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export function SessionHealthNotice() {
    const { authError, recovering, retryAuth } = useAuth();
    if (!authError) return null;
    return (
        <div role="alert" className="sticky top-0 z-[70] border-b border-amber-400/30 bg-[#292016] px-4 py-3 text-amber-100 md:ml-24">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 text-sm">
                <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-400" />
                <p className="min-w-0 flex-1 leading-5">{authError} Tes données n'ont pas été supprimées.</p>
                <button
                    type="button"
                    disabled={recovering}
                    onClick={() => void retryAuth()}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 px-3 py-2 font-bold hover:bg-white/10 disabled:opacity-50"
                >
                    <RefreshCw aria-hidden="true" className={'h-4 w-4 ' + (recovering ? 'animate-spin' : '')} />
                    {recovering ? 'Vérification…' : 'Réessayer'}
                </button>
                <Link href="/login" className="rounded-lg bg-orange-500 px-3 py-2 font-bold text-black hover:bg-orange-400">Se reconnecter</Link>
            </div>
        </div>
    );
}
