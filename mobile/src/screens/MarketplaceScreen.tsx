import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import { StatusBar } from 'expo-status-bar';
import { useMarketplace } from '../hooks/useMarketplace';

const FILTERS = ['All', 'Porsche', 'BMW', 'JDM', 'Under $50k', 'Manual'];

export const MarketplaceScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Connect to Real Backend
    const { listings, loading, refresh } = useMarketplace(activeFilter, searchQuery);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <StatusBar style="light" />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Marketplace</Text>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search make, model, or year..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Filter Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {FILTERS.map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Listing Grid */}
                {loading && listings.length === 0 ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={listings}
                        renderItem={({ item }) => (
                            <View style={styles.listingWrapper}>
                                <ListingCard listing={item} onPress={() => { }} />
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={refresh}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={{ color: '#666', marginTop: 40 }}>No active listings found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27272A',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
        fontSize: 16,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
    filterContainer: {
        gap: 8,
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#27272A',
        borderWidth: 1,
        borderColor: '#3F3F46',
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: '#A1A1AA',
        fontSize: 14,
        fontWeight: '600',
    },
    activeFilterText: {
        color: 'white',
    },
    listContent: {
        padding: 20,
    },
    listingWrapper: {
        marginBottom: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
