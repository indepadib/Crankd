'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';

// Morocco is the launch market. Historical records must keep their original
// currency: no invented static exchange rates or implicit USD->MAD conversion.
export interface Preferences {
    currency: string;
    measurement_unit: 'km' | 'mi';
    country_code: string;
}

// Legacy garage expenses may still use this mapping. Never apply it to listing
// prices; real exchange rates must come from a timestamped FX provider.
export const CURRENCY_RATES: Record<string, number> = {
    USD: 1, EUR: 0.92, AED: 3.67, GBP: 0.79, JPY: 156, MAD: 1,
};

const DEFAULT_PREFERENCES: Preferences = {
    currency: 'MAD',
    measurement_unit: 'km',
    country_code: 'MA',
};

export function usePreferences() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

    const readPreferences = useCallback(() => {
        if (!user) {
            setPreferences(DEFAULT_PREFERENCES);
            return;
        }
        try {
            const raw = localStorage.getItem('user-profile-' + user.id);
            const saved = raw ? JSON.parse(raw) as Partial<Preferences> : {};
            const country = saved.country_code === 'MA' || !saved.country_code ? 'MA' : saved.country_code;
            const currency = country === 'MA'
                ? 'MAD' // Always launch a Moroccan account in its local market.
                : /^[A-Z]{3}$/.test(saved.currency || '') ? saved.currency! : 'MAD';
            const units = country === 'MA' ? 'km' : saved.measurement_unit === 'mi' ? 'mi' : 'km';
            setPreferences({ currency, measurement_unit: units, country_code: country });
        } catch {
            setPreferences(DEFAULT_PREFERENCES);
        }
    }, [user]);

    useEffect(() => {
        readPreferences();
        const onStorage = () => readPreferences();
        window.addEventListener('storage', onStorage);
        window.addEventListener('profile-updated', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('profile-updated', onStorage);
        };
    }, [readPreferences]);

    const formatCurrency = (amount: number, fromCurrency = 'USD') => {
        if (amount === undefined || amount === null || !Number.isFinite(amount)) return '';
        const currency = /^[A-Z]{3}$/.test(fromCurrency) ? fromCurrency : 'USD';
        // Do not mutate the price's original currency. All new Moroccan listings
        // explicitly declare MAD; older records declared USD and stay USD.
        try {
            return new Intl.NumberFormat('fr-MA', {
                style: 'currency', currency, maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return amount.toLocaleString('fr-MA') + ' ' + currency;
        }
    };

    const formatDistance = (distance: number, sourceUnit: 'km' | 'mi' = 'mi') => {
        if (distance === undefined || distance === null || !Number.isFinite(distance)) return '';
        const km = sourceUnit === 'km' ? distance : distance * 1.609344;
        const display = preferences.measurement_unit === 'km' ? km : km / 1.609344;
        return Math.round(display).toLocaleString('fr-MA') + ' ' + preferences.measurement_unit;
    };

    const convertDistanceValue = (miles: number) => {
        if (miles === undefined || miles === null || !Number.isFinite(miles)) return 0;
        return Math.round(preferences.measurement_unit === 'km' ? miles * 1.609344 : miles);
    };

    return {
        preferences,
        formatCurrency,
        formatDistance,
        convertDistanceValue,
        currencySymbol: 'DH',
        unitLabel: preferences.measurement_unit,
    };
}
