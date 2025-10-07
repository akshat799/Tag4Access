import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibilityTags } from '../hooks/useApi';
import ApiService from '../services/api';
import StandardSidebar from '../components/StandardSidebar';

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

// Helper function to get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical':
    case 'Emergency':
      return '#EF4444';
    case 'High Priority':
      return '#F59E0B';
    case 'Medium Priority':
      return '#3B82F6';
    case 'Low Priority':
    default:
      return '#6B7280';
  }
}

export default function ReviewTags() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'unconfirmed'>('all');
  const router = useRouter();

  // API hooks for data
  const { accessibilityTags, loading, error, refetch } = useAccessibilityTags();

  // Filter tags based on current filter
  const filteredTags = useMemo(() => {
    switch (filter) {
      case 'pending':
        return accessibilityTags.filter(tag => tag.accessibilityStatus === 'Pending');
      case 'unconfirmed':
        return accessibilityTags.filter(tag => tag.accessibilityStatus === 'Unconfirmed');
      default:
        return accessibilityTags;
    }
  }, [accessibilityTags, filter]);

  const handleApprove = async (tagId: string) => {
    Alert.alert(
      'Approve Tag',
      'Are you sure you want to approve this accessibility tag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await ApiService.approveAccessibilityTag(tagId);
              Alert.alert('Success', 'Tag approved successfully');
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve tag');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (tagId: string) => {
    Alert.alert(
      'Reject Tag',
      'Are you sure you want to reject this accessibility tag? This will permanently delete the tag.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.rejectAccessibilityTag(tagId);
              Alert.alert('Success', 'Tag rejected and deleted successfully');
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject tag');
            }
          }
        }
      ]
    );
  };

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

  const renderTagCard = (tag: any) => (
    <View key={tag._id} style={styles.tagCard}>
      <View style={styles.tagHeader}>
        <View style={styles.tagInfo}>
          <Text style={styles.tagTitle}>{tag.locationName}</Text>
          <Text style={styles.tagFeature}>{tag.featureType}</Text>
        </View>
        <View style={styles.tagBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tag.accessibilityStatus) }]}>
            <Text style={styles.badgeText}>{tag.accessibilityStatus}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(tag.priorityLevel) }]}>
            <Text style={styles.badgeText}>{tag.priorityLevel}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.tagDescription}>{tag.description}</Text>
      
      <View style={styles.tagMeta}>
        <Text style={styles.tagMetaText}>
          📍 {tag.latitude.toFixed(4)}, {tag.longitude.toFixed(4)}
        </Text>
        <Text style={styles.tagMetaText}>
          📅 {new Date(tag.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(tag._id)}
        >
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Approve</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(tag._id)}
        >
          <Ionicons name="close" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Review Tags',
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
              currentPage="review-tags"
              adminStats={{
                totalTags: accessibilityTags.length,
                resolvedIssues: accessibilityTags.filter(tag => tag.accessibilityStatus === 'Accessible').length
              }}
              onLogout={handleLogout}
              userName="Admin User"
              userInitial="A"
              userRole="Admin"
              onTagSubmitted={() => {
                // Refresh data when a tag is submitted
                refetch();
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
                <Text style={styles.pageTitle}>Review Tags</Text>
                <Text style={styles.pageSubtitle}>Review and approve accessibility tags submitted by users</Text>
              </View>

              {/* Filter Buttons */}
              <View style={styles.filterContainer}>
                <Pressable
                  style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                    All ({accessibilityTags.length})
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
                  onPress={() => setFilter('pending')}
                >
                  <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
                    Pending ({accessibilityTags.filter(tag => tag.accessibilityStatus === 'Pending').length})
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterButton, filter === 'unconfirmed' && styles.activeFilter]}
                  onPress={() => setFilter('unconfirmed')}
                >
                  <Text style={[styles.filterText, filter === 'unconfirmed' && styles.activeFilterText]}>
                    Unconfirmed ({accessibilityTags.filter(tag => tag.accessibilityStatus === 'Unconfirmed').length})
                  </Text>
                </Pressable>
              </View>

              {/* Tags List */}
              <View style={styles.tagsContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading tags...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#EF4444" />
                    <Text style={styles.errorTitle}>Error Loading Tags</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={refetch}>
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                  </View>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map(renderTagCard)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No Tags to Review</Text>
                    <Text style={styles.emptyDescription}>
                      {filter === 'all' 
                        ? 'No accessibility tags have been submitted yet.'
                        : `No ${filter} tags found.`
                      }
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
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  headerIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EEF6FF',
  },
  contentRow: { flex: 1, flexDirection: 'row' },
  
  // Sidebar Styles (same as admin dashboard)
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

  // Filter Buttons
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Tags Container
  tagsContainer: {
    padding: 16,
    paddingTop: 0,
  },

  // Tag Card
  tagCard: {
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
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  tagBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagMeta: {
    marginBottom: 16,
    gap: 4,
  },
  tagMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#22C55E',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },
});
