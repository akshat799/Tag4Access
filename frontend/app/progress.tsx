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

type TimeFilter = 'All Time' | 'Last 30 Days' | 'Last 7 Days' | 'Today';

// Helper function to get status color
function getStatusColor(status: string): string {
  switch (status) {
    case 'Accessible':
      return '#22C55E';
    case 'Inaccessible':
      return '#EF4444';
    case 'Pending':
      return '#F59E0B';
    case 'Unconfirmed':
    default:
      return '#6B7280';
  }
}

export default function ProgressLog() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All Time');
  const router = useRouter();

  // API hooks for data
  const { items, loading, error } = useItems();
  const { isHealthy, checking } = useApiHealth();
  const { accessibilityTags, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useLatestAccessibilityTagsPerLocation();
  const { stats: adminStats, loading: statsLoading, refetch: refetchStats } = useAdminStats();

  // Calculate progress statistics using both local and admin stats
  const progressStats = useMemo(() => {
    // Use admin stats for more comprehensive data
    const totalTags = adminStats.totalTags || accessibilityTags.length;
    const resolvedIssues = adminStats.accessibleTags || accessibilityTags.filter(tag => 
      tag.accessibilityStatus === 'Accessible'
    ).length;
    const pendingTags = adminStats.pendingTags || accessibilityTags.filter(tag => 
      tag.accessibilityStatus === 'Pending'
    ).length;
    const inaccessibleTags = adminStats.inaccessibleTags || accessibilityTags.filter(tag => 
      tag.accessibilityStatus === 'Inaccessible'
    ).length;
    const unconfirmedTags = adminStats.unconfirmedTags || accessibilityTags.filter(tag => 
      tag.accessibilityStatus === 'Unconfirmed'
    ).length;
    
    const accessibilityRate = totalTags > 0 ? Math.round((resolvedIssues / totalTags) * 100) : 0;
    const avgResolution = resolvedIssues > 0 ? '2d' : '0d'; // Mock data for average resolution time

    return {
      totalTags,
      resolvedIssues,
      pendingTags,
      inaccessibleTags,
      unconfirmedTags,
      accessibilityRate,
      avgResolution
    };
  }, [accessibilityTags, adminStats]);

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

  const renderStatCard = (title: string, value: string | number, icon: string, color: string, bgColor: string) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
    </View>
  );

  const renderTimeFilterDropdown = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>All Time</Text>
      <Ionicons name="chevron-down" size={16} color="#6B7280" />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {/* Custom Fixed Header */}
        <View style={styles.customHeader}>
          <Pressable onPress={() => setSidebarOpen((s) => !s)} style={styles.headerIconBtn}>
            <Ionicons name="menu" size={22} color="#0A84FF" />
          </Pressable>
          <Text style={styles.customHeaderTitle}>Progress Log</Text>
          <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={22} color="#0A84FF" />
          </Pressable>
        </View>
        
        <View style={styles.contentRow}>
          {sidebarOpen && (
            <StandardSidebar
              currentPage="progress"
              adminStats={{
                totalTags: adminStats.totalTags,
                resolvedIssues: adminStats.resolvedIssues
              }}
              onLogout={handleLogout}
              userName="Admin User"
              userInitial="A"
              userRole="Admin"
              onTagSubmitted={() => {
                // Refresh data when a tag is submitted
                refetchTags();
                refetchStats();
              }}
            />
          )}
          
          <View style={styles.mainContent}>
            <ScrollView 
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              bounces={false}
              scrollEnabled={true}
              removeClippedSubviews={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* Stats Cards */}
              <View style={styles.statsGrid}>
                {renderStatCard('Total Tags', progressStats.totalTags, 'location', '#3B82F6', '#EEF6FF')}
                {renderStatCard('Accessible', progressStats.resolvedIssues, 'checkmark-circle', '#22C55E', '#F0FDF4')}
                {renderStatCard('Pending Review', progressStats.pendingTags, 'time', '#F59E0B', '#FFFBEB')}
                {renderStatCard('Inaccessible', progressStats.inaccessibleTags, 'close-circle', '#EF4444', '#FEF2F2')}
                {renderStatCard('Unconfirmed', progressStats.unconfirmedTags, 'help-circle', '#6B7280', '#F9FAFB')}
                {renderStatCard('Success Rate', `${progressStats.accessibilityRate}%`, 'trending-up', '#8B5CF6', '#F5F3FF')}
              </View>

              {/* Red-to-Green Log Section */}
              <View style={styles.logSection}>
                <View style={styles.logHeader}>
                  <View style={styles.logTitleContainer}>
                    <Ionicons name="trending-up" size={20} color="#22C55E" />
                    <Text style={styles.logTitle}>Red-to-Green Log</Text>
                  </View>
                  {renderTimeFilterDropdown()}
                </View>

                {/* Tags List */}
              {accessibilityTags.length > 0 ? (
                <View style={styles.tagsList}>
                  {accessibilityTags.map((tag) => (
                    <View key={tag._id} style={styles.tagItem}>
                      <View style={styles.tagHeader}>
                        <View style={styles.tagInfo}>
                          <Text style={styles.tagTitle}>{tag.locationName}</Text>
                          <Text style={styles.tagFeature}>{tag.featureType}</Text>
                        </View>
                        <View style={[styles.tagStatus, { backgroundColor: getStatusColor(tag.accessibilityStatus) }]}>
                          <Text style={styles.tagStatusText}>{tag.accessibilityStatus}</Text>
                        </View>
                      </View>
                      <Text style={styles.tagDescription}>{tag.description}</Text>
                      <View style={styles.tagMeta}>
                        <Text style={styles.tagMetaText}>Priority: {tag.priorityLevel}</Text>
                        <Text style={styles.tagMetaText}>
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
                  </View>
                  <Text style={styles.emptyTitle}>No Accessibility Tags</Text>
                  <Text style={styles.emptyDescription}>
                    No accessibility tags have been submitted yet.
                  </Text>
                </View>
              )}
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const SIDEBAR_WIDTH = Math.min(260, Math.max(220, Dimensions.get('window').width * 0.36));

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#F7F8FA',
  },
  headerIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EEF6FF',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  contentRow: { 
    flex: 1, 
    flexDirection: 'row',
  },
  
  // Sidebar Styles
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightColor: '#E5E7EB',
    borderRightWidth: StyleSheet.hairlineWidth,
    flex: 0,
  },
  sidebarScroll: {
    flex: 1,
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
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },

  // Main Content Styles
  mainContent: { 
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: { 
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100,
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
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Log Section
  logSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },

  // Tags List Styles
  tagsList: {
    gap: 12,
  },
  tagItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tagInfo: {
    flex: 1,
    marginRight: 12,
  },
  tagTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tagFeature: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  tagStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
