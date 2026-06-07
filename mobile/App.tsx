import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, Modal } from 'react-native';
import { VehicleProfileScreen } from './src/screens/VehicleProfileScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { AddVehicleScreen } from './src/screens/AddVehicleScreen';
import { COLORS } from './src/constants/theme';
import { StatusBar } from 'expo-status-bar';

type Tab = 'Feed' | 'Marketplace' | 'Garage';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Feed');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'Feed':
        return <FeedScreen />;
      case 'Marketplace':
        return <MarketplaceScreen />;
      case 'Garage':
        // Pass the callback to open modal
        // @ts-ignore - Temporary until we update VehicleProfileScreen props
        return <VehicleProfileScreen onAddVehicle={() => setShowAddVehicle(true)} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content Area */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Add Vehicle Modal */}
      <Modal visible={showAddVehicle} animationType="slide" presentationStyle="pageSheet">
        <AddVehicleScreen
          onClose={() => setShowAddVehicle(false)}
          onComplete={() => {
            setShowAddVehicle(false);
            setActiveTab('Garage'); // Ensure we are on garage to see it
          }}
        />
      </Modal>

      {/* Bottom Tab Bar */}
      <SafeAreaView style={styles.tabBar}>
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Feed')}
          >
            <Text style={[styles.tabLabel, activeTab === 'Feed' && styles.activeTabLabel]}>
              {activeTab === 'Feed' ? '🏠' : '⌂'}
            </Text>
            <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Marketplace')}
          >
            {/* Text icons for simplicity without vector-icons setup */}
            <Text style={[styles.tabLabel, activeTab === 'Marketplace' && styles.activeTabLabel]}>
              {activeTab === 'Marketplace' ? '🛍️' : '🛍'}
            </Text>
            <Text style={[styles.tabText, activeTab === 'Marketplace' && styles.activeTabText]}>Market</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Garage')}
          >
            <Text style={[styles.tabLabel, activeTab === 'Garage' && styles.activeTabLabel]}>
              {activeTab === 'Garage' ? '🏎️' : '🏎'}
            </Text>
            <Text style={[styles.tabText, activeTab === 'Garage' && styles.activeTabText]}>Garage</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Match feed background
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#0F0F0F',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#0F0F0F',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 24,
    color: '#666',
    marginBottom: 4,
  },
  activeTabLabel: {
    color: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  }
});
