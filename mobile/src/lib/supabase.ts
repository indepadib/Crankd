
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// ------------------------------------------------------------------
// TODO: REPLACE WITH YOUR SUPABASE PROJECT DETAILS
// You can find these in your Supabase Dashboard -> Project Settings -> API
// ------------------------------------------------------------------
const SUPABASE_URL = 'https://hebtanbfbdfhtkykfixq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYnRhbmJmYmRmaHRreWtmaXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzk2MDQsImV4cCI6MjA4NDkxNTYwNH0.sp5unDrgAWL6teQkTHOKGgwsi14upJGNsKV_pJvAuJc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Tells Supabase to auto-refresh auth token when app comes to foreground
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});
