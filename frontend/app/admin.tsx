import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useItems, useApiHealth, useLatestAccessibilityTagsPerLocation, useAdminStats } from '../hooks/useApi';
import StandardSidebar from '../components/StandardSidebar';

type TabType = 'User Management' | 'Youth Applications' | 'City Overview';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('User Management');
  const router = useRouter();

  // API hooks for data
  const { items, loading, error } = useItems();
  const { isHealthy, checking } = useApiHealth();
  const { accessibilityTags, loading: tagsLoading, error: tagsError } = useLatestAccessibilityTagsPerLocation();
  const { stats: adminStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();

  // Mock data for demonstration - in production, fetch from backend
  const mockUsers = [
    {
      id: '1',
      name: 'bhawna manchanda',
      email: 'bhawna.stena@gmail.com',
      role: 'Admin',
      location: 'Halifax',
      tagsSubmitted: 0,
      tagsConfirmed: 0,
      avatar: 'b'
    }
  ];

  const mockYouthApplications = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'Pending',
      submittedDate: '2024-01-15'
    }
  ];

  // Use real admin stats from backend
  const stats = useMemo(() => {
    return {
      totalUsers: mockUsers.length, // Will be dynamic when user management is implemented
      totalTags: adminStats.totalTags,
      pendingReview: adminStats.pendingReview,
      resolvedIssues: adminStats.resolvedIssues,
      youthApplications: mockYouthApplications.length
    };
  }, [adminStats, mockUsers, mockYouthApplications]);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);
  };

  const renderStatCard = (title: string, value: number | string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderUserManagement = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>👤 User Management</Text>
      {mockUsers.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <View style={[styles.roleBadge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
                <Text style={styles.userLocation}>{user.location}</Text>
              </View>
            </View>
          </View>
          <View style={styles.userStats}>
            <Text style={styles.userStatText}>{user.tagsSubmitted} tags submitted</Text>
            <Text style={styles.userStatText}>{user.tagsConfirmed} tags confirmed</Text>
            <Pressable style={styles.roleDropdown}>
              <Text style={styles.dropdownText}>Admin ▼</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );

  const renderYouthApplications = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🎓 Youth Applications ({mockYouthApplications.length})</Text>
      {mockYouthApplications.map((application) => (
        <View key={application.id} style={styles.applicationCard}>
          <Text style={styles.applicationName}>{application.name}</Text>
          <Text style={styles.applicationEmail}>{application.email}</Text>
          <Text style={styles.applicationDate}>Submitted: {application.submittedDate}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.statusText}>{application.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCityOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🏙️ City Overview</Text>
      <View style={styles.cityCard}>
        <Text style={styles.cityName}>Halifax</Text>
        <Text style={styles.cityDescription}>Current active city for accessibility mapping</Text>
        <View style={styles.cityStats}>
          <Text style={styles.cityStatText}>Total Accessibility Tags: {adminStats.totalTags}</Text>
          <Text style={styles.cityStatText}>Active Users: {mockUsers.length}</Text>
          <Text style={styles.cityStatText}>Backend Status: {isHealthy ? '✅ Online' : '❌ Offline'}</Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'User Management':
        return renderUserManagement();
      case 'Youth Applications':
        return renderYouthApplications();
      case 'City Overview':
        return renderCityOverview();
      default:
        return renderUserManagement();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Admin Dashboard',
          headerLargeTitle: true,
          headerLeft: () => (
            <Pressable onPress={() => setSidebarOpen((s) => !s)} style={styles.headerIconBtn}>
              <Ionicons name="menu" size={22} color="#0A84FF" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
              <Ionicons name="arrow-back" size={22} color="#0A84FF" />
            </Pressable>
          ),
        }}
      />

      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.contentRow}>
          {sidebarOpen && (
            <StandardSidebar
              currentPage="admin"
              adminStats={{
                totalTags: adminStats.totalTags,
                resolvedIssues: adminStats.resolvedIssues
              }}
              onLogout={handleLogout}
              userName="bhawna manchanda"
              userInitial="b"
              userRole="Admin"
              onTagSubmitted={() => {
                // Refresh data when a tag is submitted
                refetchStats();
              }}
            />
          )}

          <View style={styles.mainContent}>
            <ScrollView 
              style={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEventThrottle={16}
              decelerationRate="normal"
              contentInsetAdjustmentBehavior="automatic"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.pageTitle}>Admin Dashboard</Text>
                <Text style={styles.pageSubtitle}>Manage users, monitor system activity, and oversee accessibility data</Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsGrid}>
                {renderStatCard('Total Users', stats.totalUsers, 'people', '#3B82F6')}
                {renderStatCard('Total Tags', stats.totalTags, 'location', '#22C55E')}
                {renderStatCard('Pending Review', stats.pendingReview, 'warning', '#F59E0B')}
                {renderStatCard('Resolved Issues', stats.resolvedIssues, 'trending-up', '#8B5CF6')}
                {renderStatCard('Youth Applications', stats.youthApplications, 'school', '#F59E0B')}
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabNavigation}>
                {(['User Management', 'Youth Applications', 'City Overview'] as TabType[]).map((tab) => (
                  <Pressable
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                      {tab} {tab === 'Youth Applications' && `(${mockYouthApplications.length})`}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Tab Content */}
              {renderTabContent()}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const SIDEBAR_WIDTH = Math.min(260, Math.max(220, Dimensions.get('window').width * 0.36));

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  headerIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EEF6FF',
  },
  contentRow: { flex: 1, flexDirection: 'row' },
  
  // Sidebar Styles
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightColor: '#E5E7EB',
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
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
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },

  // Main Content Styles
  mainContent: { 
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: { 
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Tab Content
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // User Management
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userStatText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  roleDropdown: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 12,
    color: '#374151',
  },

  // Youth Applications
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  applicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  applicationEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // City Overview
  cityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cityDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cityStats: {
    gap: 8,
  },
  cityStatText: {
    fontSize: 14,
    color: '#374151',
  },
});
