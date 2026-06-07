// src/screens/VehicleProfileScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { VehicleCard } from '../components/VehicleCard';
import { COLORS, SPACING } from '../constants/theme';
import { MaintenanceLog, Vehicle } from '../types';

// MOCK DATA for Phase 1 Demo
const MOCK_VEHICLE: Vehicle = {
    id: '1',
    vin: 'WBA333X...',
    make: 'BMW',
    model: 'M3',
    year: 2003,
    trim: 'E46 CSL',
    health_score: 98,
    image_url: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop'
};

const MOCK_LOGS: MaintenanceLog[] = [
    {
        id: 'l1',
        vehicle_id: '1',
        occurred_at: '2023-10-15',
        service_type: 'maintenance',
        title: 'Rod Bearings Replacement',
        description: 'Preventative replacement. ACL Race bearings used. ARP bolts.',
        cost_amount: 2400.00,
        cost_currency: 'USD',
        is_verified: true,
    },
    {
        id: 'l2',
        vehicle_id: '1',
        occurred_at: '2023-08-01',
        service_type: 'modification',
        title: 'CSL Airbox Install',
        description: 'Carbon fiber intake with Alpha-N tune.',
        is_verified: true,
    },
    {
        id: 'l3',
        vehicle_id: '1',
        occurred_at: '2023-05-20',
        service_type: 'maintenance',
        title: '10W60 Oil Change',
        description: 'Liqui Moly 10W-60. Mahle Filter.',
        cost_amount: 180.00,
        cost_currency: 'USD',
        is_verified: false,
    }
];

interface VehicleProfileScreenProps {
    onAddVehicle?: () => void;
}

export const VehicleProfileScreen = ({ onAddVehicle }: VehicleProfileScreenProps) => {
    const renderLogItem = ({ item, index }: { item: MaintenanceLog; index: number }) => (
        <View style={styles.logItem}>
            <View style={styles.timelineContainer}>
                <View style={[styles.dot, item.is_verified ? styles.dotVerified : styles.dotPending]} />
                {index !== MOCK_LOGS.length - 1 && <View style={styles.line} />}
            </View>

            <View style={styles.logContent}>
                <Text style={styles.logDate}>{item.occurred_at}</Text>
                <Text style={styles.logTitle}>{item.title}</Text>
                <Text style={styles.logDesc}>{item.description}</Text>

                {item.is_verified && (
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                    </View>
                )}
            </View>

            <View style={styles.logMeta}>
                <Text style={styles.logCost}>
                    {item.cost_amount ? `$${item.cost_amount}` : ''}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenTitle}>Garage</Text>

                <VehicleCard vehicle={MOCK_VEHICLE} style={styles.headerCard} />

                <Text style={styles.sectionHeader}>History Timeline</Text>

                <View style={styles.listContainer}>
                    {MOCK_LOGS.map((item, index) => (
                        <View key={item.id}>
                            {renderLogItem({ item, index })}
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Add Vehicle FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onAddVehicle}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.m,
    },
    screenTitle: {
        color: COLORS.textPrimary,
        fontSize: 32,
        fontWeight: '900',
        marginBottom: SPACING.l,
        marginTop: SPACING.s,
        letterSpacing: -1,
    },
    headerCard: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: SPACING.m,
        letterSpacing: 1,
    },
    listContainer: {
        paddingLeft: SPACING.s,
    },
    logItem: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
        minHeight: 80,
    },
    timelineContainer: {
        alignItems: 'center',
        width: 20,
        marginRight: SPACING.m,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.border,
        zIndex: 2,
    },
    dotVerified: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.background,
        borderWidth: 2,
    },
    dotPending: {
        backgroundColor: COLORS.textSecondary,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.surfaceHighlight,
        position: 'absolute',
        top: 12,
        bottom: -SPACING.l, // Connect to next item
        left: 9, // Center of dot (12/2 + margin?) No, dot is 12, center is 6. 
        // Wait, width is 20. Center is 10. Dot is 12.
    },
    logContent: {
        flex: 1,
        paddingBottom: SPACING.m,
    },
    logDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'Courier', // Monospace for dates looks technical
    },
    logTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    logDesc: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1,
    },
    verifiedBadgeText: {
        color: COLORS.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    logMeta: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        minWidth: 60,
    },
    logCost: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    fabIcon: {
        fontSize: 32,
        color: 'white',
        fontWeight: '300',
        lineHeight: 34, // Adjust for vertical alignment
    }
});
