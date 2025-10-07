import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NavigationProps {
  currentPage?: string;
  adminStats?: {
    totalTags: number;
    resolvedIssues: number;
  };
  onSubmitTag?: () => void;
}

export default function StandardNavigation({ currentPage, adminStats, onSubmitTag }: NavigationProps) {
  const router = useRouter();

  const navigationItems = [
    { 
      name: 'Map', 
      route: '/home', 
      icon: 'map' as const,
      isActive: currentPage === 'home'
    },
    { 
      name: 'Submit Tag', 
      route: null, 
      icon: 'add-circle' as const,
      isActive: false,
      customAction: onSubmitTag || (() => router.push('/home?openModal=true'))
    },
    { 
      name: 'Events', 
      route: null, 
      icon: 'calendar' as const,
      isActive: false
    },
    { 
      name: 'Awareness', 
      route: null, 
      icon: 'bulb' as const,
      isActive: false
    },
    { 
      name: 'Progress Log', 
      route: '/progress', 
      icon: 'trending-up' as const,
      isActive: currentPage === 'progress'
    },
    { 
      name: 'Review Tags', 
      route: '/review-tags', 
      icon: 'checkmark-circle' as const,
      isActive: currentPage === 'review-tags'
    },
    { 
      name: 'Manage Events', 
      route: null, 
      icon: 'settings' as const,
      isActive: false
    },
    { 
      name: 'Manage Podcasts', 
      route: null, 
      icon: 'mic' as const,
      isActive: false
    },
    { 
      name: 'Admin Dashboard', 
      route: '/admin', 
      icon: 'shield-checkmark' as const,
      isActive: currentPage === 'admin'
    },
  ];

  const renderNavItem = (item: typeof navigationItems[0]) => {
    if (item.route || item.customAction) {
      return (
        <Pressable
          key={item.name}
          style={({ pressed }) => [
            styles.navItem,
            item.isActive && styles.activeNavItem,
            pressed && { backgroundColor: '#F3F4F6' }
          ]}
          onPress={() => {
            if (item.customAction) {
              item.customAction();
            } else if (item.route) {
              router.push(item.route as any);
            }
          }}
        >
          <Ionicons 
            name={item.icon} 
            size={16} 
            color={item.isActive ? '#3B82F6' : '#6B7280'} 
          />
          <Text style={[
            styles.navItemText,
            item.isActive && styles.activeNavText
          ]}>
            {item.name}
          </Text>
        </Pressable>
      );
    } else {
      return (
        <View key={item.name} style={styles.navItem}>
          <Ionicons name={item.icon} size={16} color="#6B7280" />
          <Text style={styles.navItemText}>{item.name}</Text>
        </View>
      );
    }
  };

  return (
    <View>
      <Text style={styles.sidebarTitle}>NAVIGATION</Text>
      {navigationItems.map(renderNavItem)}

      <Text style={[styles.sidebarTitle, { marginTop: 12 }]}>QUICK STATS</Text>
      <View style={styles.quickStat}>
        <Ionicons name="location" size={14} color="#6B7280" />
        <Text style={styles.quickStatText}>Current City</Text>
        <Text style={styles.quickStatValue}>Halifax</Text>
      </View>
      <View style={styles.quickStat}>
        <Ionicons name="people" size={14} color="#6B7280" />
        <Text style={styles.quickStatText}>Tags Submitted</Text>
        <Text style={styles.quickStatValue}>{adminStats?.totalTags || 0}</Text>
      </View>
      <View style={styles.quickStat}>
        <Ionicons name="checkmark" size={14} color="#6B7280" />
        <Text style={styles.quickStatText}>Confirmed</Text>
        <Text style={styles.quickStatValue}>{adminStats?.resolvedIssues || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarTitle: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
    minHeight: 32,
  },
  activeNavItem: {
    backgroundColor: '#EEF6FF',
  },
  navItemText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#374151',
  },
  activeNavText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quickStatText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
