
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: We are using a simpler approach since we haven't installed auth-helpers-nextjs yet
// For now, we'll do client-side protection or a basic cookie check if possible.
// Given the current setup (supabase-js only), rigorous server-side middleware requires more setup.
// We will add a basic redirect if no cookie, or rely on client-side AuthProvider for now to avoid complexity of new deps.

// UPDATED PLAN: Let's stick to client-side protection for the MVP steps to avoid "Module not found" for auth-helpers.
// If user really needs middleware, we must install @supabase/auth-helpers-nextjs.

// Placeholder middleware that just passes through for now. 
// Real protection will happen in Layout or Client Components checking `useAuth`.
export async function middleware(req: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
