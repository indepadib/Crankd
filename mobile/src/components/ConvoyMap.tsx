// src/components/ConvoyMap.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

// In a real app, this would import from @rnmapbox/maps
// import MapboxGL from '@rnmapbox/maps';

const { width } = Dimensions.get('window');

interface MemberLocation {
    user_id: string;
    lat: number;
    lng: number;
    speed: number; // km/h
}

export const ConvoyMap = () => {
    const [members, setMembers] = useState<MemberLocation[]>([
        { user_id: 'me', lat: 35.6812, lng: 139.7671, speed: 120 },
        { user_id: 'friend1', lat: 35.6810, lng: 139.7680, speed: 118 }
    ]);

    // MOCK: Simulate real-time movement
    useEffect(() => {
        const interval = setInterval(() => {
            setMembers(prev => prev.map(p => ({
                ...p,
                lat: p.lat + 0.0001,
                lng: p.lng + 0.0001,
                speed: Math.floor(Math.random() * 10) + 110
            })));
        }, 3000); // Update every 3s

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapSurface}>
                <Text style={styles.placeholderText}>MAPBOX GL SURFACE</Text>

                {/* Simulate Markers */}
                {members.map((m, i) => (
                    <View key={m.user_id} style={styles.markerContainer}>
                        <View style={[styles.marker, m.user_id === 'me' ? styles.markerMe : styles.markerOther]} />
                        <Text style={styles.label}>{m.speed} KM/H</Text>
                    </View>
                ))}
            </View>

            {/* Convoy HUD */}
            <View style={styles.hud}>
                <Text style={styles.hudTitle}>MIDNIGHT RUN #24</Text>
                <Text style={styles.hudStatus}>{members.length} DRIVERS ACTIVE</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,
        backgroundColor: '#1E1E20',
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 16,
    },
    mapSurface: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A', // Dark Blue/Black Map Style
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.1)',
        fontWeight: '900',
        fontSize: 24,
        position: 'absolute',
    },
    markerContainer: {
        alignItems: 'center',
        margin: 5, // Just stacked for demo
    },
    marker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    markerMe: {
        backgroundColor: COLORS.primary,
    },
    markerOther: {
        backgroundColor: COLORS.textSecondary,
    },
    label: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        fontFamily: FONTS.mono,
    },
    hud: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    hudTitle: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    hudStatus: {
        color: COLORS.success,
        fontSize: 10,
        marginTop: 2,
    }
});
