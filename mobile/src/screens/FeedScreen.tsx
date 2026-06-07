import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Post } from '../types';
import { StatusBar } from 'expo-status-bar';
import { useFeed } from '../hooks/useFeed';

const { width, height } = Dimensions.get('window');

// MOCK DATA (Synced with Web)
const MOCK_POSTS: Post[] = [
    {
        id: '1', author_id: 'u1', content_type: 'vehicle_showcase',
        title: 'The CSL Project', body: 'Restoration starts next week.',
        view_count: 1240, like_count: 284, comment_count: 142, engagement_score: 1500, cohort_level: 1,
        tags: ['BMW', 'E46', 'Restoration'], created_at: new Date().toISOString(),
        author: { id: 'u1', username: 'DriftKing', garage_rank: 50, avatar_url: 'DK' },
        vehicle: { id: 'v1', vin: '...', make: 'BMW', model: 'M3 CSL', year: 2003, health_score: 98, image_url: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop' }
    },
    {
        id: '2', author_id: 'u2', content_type: 'maintenance_log',
        title: 'Valve Adjustment', body: 'Clearances were way off on exhaust side. Running smooth now.',
        view_count: 300, like_count: 340, comment_count: 12, engagement_score: 200, cohort_level: 0,
        tags: ['Maintenance', 'DIY', 'Porsche'], created_at: new Date().toISOString(),
        author: { id: 'u2', username: 'PorscheGuy', garage_rank: 80, avatar_url: 'PG' },
        log: { id: 'l1', vehicle_id: 'v1', occurred_at: '2023-10-01', service_type: 'maintenance', title: 'Annual Service', cost_amount: 1200, cost_currency: 'USD', is_verified: true, description: 'Full fluid flush and inspection.' }
    },
    {
        id: '4', author_id: 'u4', content_type: 'vehicle_showcase',
        title: 'Godzilla Returns', body: 'Fresh from the dyno. 700whp on pump gas.',
        view_count: 5600, like_count: 5600, comment_count: 400, engagement_score: 9000, cohort_level: 2,
        tags: ['High HP', 'Build', 'JDM'], created_at: new Date().toISOString(),
        author: { id: 'u4', username: 'JDM_Legend', garage_rank: 95, avatar_url: 'JL' },
        vehicle: { id: 'v4', vin: '...', make: 'Nissan', model: 'Skyline GT-R', year: 1999, trim: 'V-Spec', health_score: 92, image_url: 'https://images.unsplash.com/photo-1619623055909-e33a6933c1eb?q=80&w=2600&auto=format&fit=crop' }
    }
];

const FeedItem = ({ item, index }: { item: Post, index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [liked, setLiked] = useState(false);

    // Determine Image Source
    let imageSource = null;
    if (item.vehicle?.image_url) {
        imageSource = { uri: item.vehicle.image_url };
    } else {
        imageSource = { uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000' };
    }

    const handleLike = () => {
        setLiked(!liked);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true })
        ]).start();
    };

    return (
        <View style={styles.itemContainer}>
            {/* Background Image */}
            <Image source={imageSource} style={styles.backgroundImage} resizeMode="cover" />

            {/* Simulated Gradient Overlay (Bottom Up) */}
            <View style={styles.gradientSimulation} />

            {/* Content Container */}
            <View style={styles.contentContainer}>

                {/* Right Side Action Bar */}
                <View style={styles.actionBar}>
                    <View style={styles.actionButton}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{item.author?.username?.substring(0, 2).toUpperCase() || '?'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                        <Animated.Text style={[styles.iconText, { transform: [{ scale: scaleAnim }], color: liked ? COLORS.primary : 'white' }]}>
                            ♥
                        </Animated.Text>
                        <Text style={styles.actionLabel}>{item.like_count + (liked ? 1 : 0)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.iconText}>💬</Text>
                        <Text style={styles.actionLabel}>{item.comment_count}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.iconText}>↗</Text>
                        <Text style={styles.actionLabel}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Text Content */}
                <View style={styles.textContainer}>
                    <View style={styles.userRow}>
                        <Text style={styles.username}>@{item.author?.username}</Text>
                        {item.cohort_level >= 2 && <Text style={styles.badge}>Trending</Text>}
                    </View>

                    <Text style={[styles.title, TYPOGRAPHY.h2]}>{item.title}</Text>
                    <Text style={[styles.body, TYPOGRAPHY.body]}>{item.body}</Text>

                    {item.content_type === 'maintenance_log' && (
                        <View style={styles.logBadge}>
                            <Text style={styles.logBadgeText}>🛠 {item.log?.title}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export function FeedScreen() {
    const { posts, loading, error, refresh } = useFeed();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {loading && posts.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: 'white' }}>Loading Feed...</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={({ item, index }) => <FeedItem item={item} index={index} />}
                    keyExtractor={item => item.id}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    snapToInterval={height - 80} // Approx tab bar offset, adjusting makes it clearer
                    snapToAlignment="start"
                    decelerationRate="fast"
                    refreshing={loading}
                    onRefresh={refresh}
                />
            )}

            {/* Top Overlay Tabs */}
            <SafeAreaView style={styles.header}>
                <View style={styles.tabContainer}>
                    <Text style={[styles.tabText, styles.activeTab]}>For You</Text>
                    <View style={styles.divider} />
                    <Text style={styles.tabText}>Following</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        width: width,
        height: height - 80, // Leave room for tab bar
        position: 'relative',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    gradientSimulation: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)', // Simplified for MVP without LinearGradient
        // For better simulation without LinearGradient, you can stack specific views with increasing opacity
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingRight: 10,
    },
    userData: {
        marginBottom: 8,
    },
    actionBar: {
        width: 50,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 0,
        gap: 24,
    },
    actionButton: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
        marginBottom: 12,
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    iconText: {
        color: 'white',
        fontSize: 32,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    actionLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17,
        marginRight: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    badge: {
        backgroundColor: COLORS.primary,
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    title: {
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginBottom: 4,
    },
    body: {
        color: 'rgba(255,255,255,0.95)',
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    logBadge: {
        backgroundColor: 'rgba(249, 115, 22, 0.2)', // Orange tint
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    logBadgeText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: 50, // Safe area approx
    },
    tabContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 17,
        fontWeight: '600',
        paddingHorizontal: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    activeTab: {
        color: 'white',
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
    }
});
