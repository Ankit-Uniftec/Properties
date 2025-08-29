import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BottomNavigation() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', screen: '/MainScreen', icon: 'home-outline' },
    { id: 'explore', label: 'Explore', screen: '/ExploreScreen', icon: 'search-outline' },
    { id: 'properties', label: 'Properties', screen: '/PropertiesScreen', icon: 'business-outline' },
    { id: 'menu', label: 'Menu', screen: '/MenuScreen', icon: 'person-outline' },
  ];

  const navigateToScreen = (screen: string, tabId: string) => {
    setActiveTab(tabId);
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => navigateToScreen(tab.screen, tab.id)}
        >
          <Ionicons
            name={tab.icon}
            size={22}
            color={activeTab === tab.id ? "#007AFF" : "#666"}
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.label, activeTab === tab.id && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffffff',
    borderTopWidth: 2,
    borderTopColor: 'hsla(0, 54%, 98%, 1.00)',
    paddingVertical: 2,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
