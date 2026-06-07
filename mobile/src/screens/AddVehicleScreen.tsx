import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface AddVehicleScreenProps {
    onClose: () => void;
    onComplete: () => void;
}

export const AddVehicleScreen = ({ onClose, onComplete }: AddVehicleScreenProps) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [vin, setVin] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 2 Data
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');

    // Step 3 (Verification)
    const [verificationProgress, setVerificationProgress] = useState(0);

    const handleVinSubmit = () => {
        if (vin.length < 5) return; // Simple validation
        setLoading(true);

        // Simulate VIN Decoding API
        setTimeout(() => {
            setLoading(false);
            setMake('Porsche');
            setModel('911 Carrera S');
            setStep(2);
        }, 1500);
    };

    const handleConfirm = () => {
        setStep(3);
        // Simulate Verification / Hashing Process
        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.1;
            setVerificationProgress(progress);
            if (progress >= 1) {
                clearInterval(interval);
                setTimeout(onComplete, 500);
            }
        }, 300);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Vehicle</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>

                {/* STEP 1: VIN INPUT */}
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Enter VIN</Text>
                        <Text style={styles.stepDescription}>
                            We use your VIN to pull factory specs and verify the chassis history.
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="WPOAA299..."
                            placeholderTextColor="#666"
                            value={vin}
                            onChangeText={setVin}
                            autoCapitalize="characters"
                        />

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handleVinSubmit}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Decode VIN</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* STEP 2: CONFIRM DETAILS */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Confirm Details</Text>

                        <View style={styles.vehicleCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Make</Text>
                                <Text style={styles.value}>{make}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Model</Text>
                                <Text style={styles.value}>{model}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>VIN</Text>
                                <Text style={styles.value}>{vin}</Text>
                            </View>
                        </View>

                        <Text style={styles.disclaimer}>
                            By checking out, you are minting this vehicle to your garage. This action is irreversible on the chain.
                        </Text>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>Mint to Garage</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* STEP 3: VERIFICATION ANIMATION */}
                {step === 3 && (
                    <View style={styles.centerContainer}>
                        <View style={styles.hashCircle}>
                            {/* Simulated Hash Animation */}
                            <Text style={styles.hashText}>
                                0x{Math.random().toString(16).substr(2, 8)}...
                            </Text>
                        </View>
                        <Text style={styles.verifyingText}>Verifying Ownership...</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressBar, { width: `${verificationProgress * 100}%` }]} />
                        </View>
                    </View>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.surface,
    },
    closeButton: {
        padding: 8,
    },
    closeText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    stepContainer: {
        flex: 1,
        paddingTop: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        marginBottom: 12,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 20,
        fontSize: 18,
        color: 'white',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehicleCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    value: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 24,
    },
    verifyingText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 40,
    },
    progressTrack: {
        width: '80%',
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    hashCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    hashText: {
        color: COLORS.primary,
        fontSize: 12,
        fontFamily: 'Courier', // Monospace if available
    }
});
