import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Listing } from '../types';

const { width } = Dimensions.get('window');

interface ListingCardProps {
    listing: Listing;
    onPress: () => void;
}

export const ListingCard = ({ listing, onPress }: ListingCardProps) => {
    // Format Price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: listing.price_currency,
        maximumFractionDigits: 0,
    }).format(listing.price_amount);

    // Format Mileage
    const formattedMileage = `${(listing.mileage_value / 1000).toFixed(1)}k ${listing.mileage_unit}`;

    // Image Source
    const imageSource = listing.vehicle?.image_url
        ? { uri: listing.vehicle.image_url }
        : { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2600' };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={imageSource} style={styles.image} resizeMode="cover" />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{formattedPrice}</Text>
                </View>
                {listing.status === 'pending' && (
                    <View style={[styles.statusTag, { backgroundColor: '#EAB308' }]}>
                        <Text style={styles.statusText}>Pending</Text>
                    </View>
                )}
                {listing.status === 'sold' && (
                    <View style={[styles.statusTag, { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.statusText}>Sold</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {listing.vehicle?.year} {listing.vehicle?.make} {listing.vehicle?.model}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {listing.vehicle?.trim}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formattedMileage}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>Clean Title</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                        {/* Mock location for now */}
                        <Text style={styles.statValue}>CA</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    priceTag: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    priceText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    content: {
        padding: 12,
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        color: '#A1A1AA', // Gray
        fontSize: 14,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
    },
    statValue: {
        color: '#D4D4D8',
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: '#3F3F46',
        marginHorizontal: 8,
    }
});
