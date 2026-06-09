'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface Preferences {
    currency: string;
    measurement_unit: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    AED: 'د.إ',
    GBP: '£',
    JPY: '¥'
};

export const CURRENCY_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    AED: 3.67,
    GBP: 0.79,
    JPY: 156.0
};

export function usePreferences() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<Preferences>({
        currency: 'USD',
        measurement_unit: 'mi'
    });

    const loadPreferences = () => {
        if (!user) return;
        let profileData: any = null;

        // 1. Try local storage first (instant)
        const localProfileKey = `user-profile-${user.id}`;
        const localSaved = localStorage.getItem(localProfileKey);
        if (localSaved) {
            try {
                profileData = JSON.parse(localSaved);
            } catch (e) {}
        }

        if (profileData) {
            setPreferences({
                currency: profileData.currency || 'USD',
                measurement_unit: profileData.measurement_unit || 'mi'
            });
        }
    };

    useEffect(() => {
        if (!user) return;

        loadPreferences();

        // Listen for storage updates
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `user-profile-${user.id}`) {
                try {
                    const parsed = JSON.parse(e.newValue || '{}');
                    setPreferences({
                        currency: parsed.currency || 'USD',
                        measurement_unit: parsed.measurement_unit || 'mi'
                    });
                } catch (err) {}
            }
        };

        // Custom event triggered by savings in settings page
        const handleProfileUpdated = () => {
            loadPreferences();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profile-updated', handleProfileUpdated);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profile-updated', handleProfileUpdated);
        };
    }, [user]);

    const formatCurrency = (amount: number, fromCurrency = 'USD') => {
        if (amount === undefined || amount === null) return '';
        // Convert to USD first if not already (assuming inputs in database are in USD base)
        const usdAmount = fromCurrency === 'USD' ? amount : amount / (CURRENCY_RATES[fromCurrency] || 1.0);
        
        // Convert to selected currency
        const converted = usdAmount * (CURRENCY_RATES[preferences.currency] || 1.0);
        const symbol = CURRENCY_SYMBOLS[preferences.currency] || '$';
        
        // Format with thousands separator
        return `${symbol}${Math.round(converted).toLocaleString()}`;
    };

    const formatDistance = (miles: number) => {
        if (miles === undefined || miles === null) return '';
        if (preferences.measurement_unit === 'km') {
            const km = miles * 1.60934;
            return `${Math.round(km).toLocaleString()} km`;
        }
        return `${Math.round(miles).toLocaleString()} mi`;
    };

    const convertDistanceValue = (miles: number) => {
        if (miles === undefined || miles === null) return 0;
        if (preferences.measurement_unit === 'km') {
            return Math.round(miles * 1.60934);
        }
        return Math.round(miles);
    };

    return {
        preferences,
        formatCurrency,
        formatDistance,
        convertDistanceValue,
        currencySymbol: CURRENCY_SYMBOLS[preferences.currency] || '$',
        unitLabel: preferences.measurement_unit === 'km' ? 'km' : 'mi'
    };
}
