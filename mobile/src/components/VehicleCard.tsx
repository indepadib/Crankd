// src/components/VehicleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { Vehicle } from '../types';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
    vehicle: Vehicle;
    style?: ViewStyle;
}

export const VehicleCard: React.FC<Props> = ({ vehicle, style }) => {
    return (
        <View style={[styles.container, style]}>
            {/* Background/Image Placeholder - In real app, this is an ImageBackground */}
            <View style={styles.imageArea}>
                {vehicle.image_url ? (
                    <Image source={{ uri: vehicle.image_url }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>{vehicle.make}</Text>
                    </View>
                )}

                <View style={styles.badgeContainer}>
                    <View style={styles.healthBadge}>
                        <Text style={styles.healthScore}>{vehicle.health_score}</Text>
                        <Text style={styles.healthLabel}>HP</Text>
                    </View>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.year}>{vehicle.year}</Text>
                <Text style={styles.model}>
                    {vehicle.make} {vehicle.model}
                </Text>
                <Text style={styles.trim}>{vehicle.trim}</Text>

                <View style={styles.footer}>
                    <Text style={styles.vin}>VIN: •••••{vehicle.vin.slice(-4)}</Text>
                    <View style={styles.verifiedTag}>
                        <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    imageArea: {
        height: 180,
        backgroundColor: COLORS.surfaceHighlight,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202022',
    },
    placeholderText: {
        color: COLORS.border,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    badgeContainer: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
    },
    healthBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderColor: COLORS.success,
        borderWidth: 1,
        borderRadius: 50,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)', // iOS only usually, but good to have
    },
    healthScore: {
        color: COLORS.success,
        fontSize: 18,
        fontWeight: 'bold',
    },
    healthLabel: {
        color: COLORS.success,
        fontSize: 8,
        marginTop: -2,
    },
    details: {
        padding: SPACING.m,
    },
    year: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    model: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800', // Heavy font
        letterSpacing: -0.5,
    },
    trim: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginBottom: SPACING.m,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.s,
    },
    vin: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.mono,
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: 'bold',
    }
});
