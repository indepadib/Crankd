// src/screens/GarageScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { VehicleCard } from '../components/VehicleCard';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Vehicle } from '../types';

// MOCK DATA: User's Garage
const CURRENT_GARAGE: Vehicle[] = [
    {
        id: '1',
        vin: 'WBA333X...',
        make: 'BMW',
        model: 'M3 CSL',
        year: 2003,
        trim: 'E46',
        health_score: 98,
        image_url: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop'
    },
    {
        id: '2',
        vin: 'WPOZZZ99...',
        make: 'Porsche',
        model: '911 GT3',
        year: 2022,
        trim: '992 Touring',
        health_score: 100,
        image_url: 'https://images.unsplash.com/photo-1611016186353-9af29c778601?q=80&w=2600&auto=format&fit=crop'
    }
];

const PAST_GARAGE: Vehicle[] = [
    {
        id: '3',
        vin: 'JHMAP1...',
        make: 'Honda',
        model: 'S2000',
        year: 2005,
        trim: 'AP2',
        health_score: 94, // Snapshot at time of sale
        image_url: 'https://images.unsplash.com/photo-1592853625608-f46328325a7f?q=80&w=2600&auto=format&fit=crop'
    }
];

type TabState = 'collection' | 'legacy';

export const GarageScreen = () => {
    const [activeTab, setActiveTab] = useState<TabState>('collection');

    const data = activeTab === 'collection' ? CURRENT_GARAGE : PAST_GARAGE;

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.avatar} />
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>98</Text>
                    </View>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.username}>@DriftKing</Text>
                    <Text style={styles.bio}>Purist. 3 Pedals or nothing. Tokyo, JP.</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>3</Text>
                            <Text style={styles.statLabel}>Cars</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>12.4k</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>LVL 7</Text>
                            <Text style={styles.statLabel}>Wrench</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'collection' && styles.activeTab]}
                    onPress={() => setActiveTab('collection')}
                >
                    <Text style={[styles.tabText, activeTab === 'collection' && styles.activeTabText]}>COLLECTION</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'legacy' && styles.activeTab]}
                    onPress={() => setActiveTab('legacy')}
                >
                    <Text style={[styles.tabText, activeTab === 'legacy' && styles.activeTabText]}>LEGACY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={data}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <VehicleCard vehicle={item} />
                        {activeTab === 'legacy' && (
                            <View style={styles.soldOverlay}>
                                <Text style={styles.soldText}>SOLD</Text>
                            </View>
                        )}
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingBottom: SPACING.xxl,
    },
    header: {
        padding: SPACING.m,
        paddingTop: SPACING.l,
        backgroundColor: COLORS.background,
    },
    profileRow: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: SPACING.m,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    rankBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    rankText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 10,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    bio: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: SPACING.m,
    },
    statsRow: {
        flexDirection: 'row',
    },
    stat: {
        marginRight: SPACING.l,
    },
    statValue: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceHighlight,
    },
    tab: {
        paddingVertical: SPACING.s,
        marginRight: SPACING.l,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeTabText: {
        color: COLORS.textPrimary,
    },
    cardWrapper: {
        padding: SPACING.m,
        paddingTop: 0,
        marginBottom: SPACING.m,
        position: 'relative',
    },
    soldOverlay: {
        position: 'absolute',
        top: 20,
        right: 20 + SPACING.m,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    soldText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 2,
    }
});
