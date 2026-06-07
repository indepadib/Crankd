
'use client';

import { AuthProvider } from '@/context/AuthProvider';


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {/* Add ThemeProvider or valid replacements if needed later */}
            {children}
        </AuthProvider>
    );
}
