// src/constants/theme.ts

export const COLORS = {
    background: '#09090B', // Deep Carbon
    surface: '#18181B', // Dark Steel
    surfaceHighlight: '#27272A', // Brighter Steel
    primary: '#F97316', // Signal Orange (High Visibility)
    textPrimary: '#FAFAFA', // White / Platinum
    textSecondary: '#A1A1AA', // Aluminum
    border: '#3F3F46', // Gunmetal
    success: '#10B981',
    danger: '#EF4444',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const FONTS = {
    // In a real app, we'd load custom fonts like 'Inter' or 'Space Grotesk'
    regular: 'System',
    bold: 'System',
    mono: 'System',
};

export const TYPOGRAPHY = {
    h1: { fontSize: 32, fontWeight: '800' },
    h2: { fontSize: 24, fontWeight: '700' },
    h3: { fontSize: 20, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 12, color: COLORS.textSecondary },
};
