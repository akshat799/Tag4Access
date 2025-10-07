import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StandardNavigation from './StandardNavigation';
import SubmitAccessibilityTagModal from './SubmitAccessibilityTagModal';

interface SidebarProps {
  currentPage?: string;
  adminStats?: {
    totalTags: number;
    resolvedIssues: number;
  };
  onLogout: () => void;
  userName?: string;
  userInitial?: string;
  userRole?: string;
  onSubmitTag?: () => void;
  onTagSubmitted?: () => void; // Callback to refresh data after tag submission
}

const SIDEBAR_WIDTH = Math.min(260, Math.max(220, Dimensions.get('window').width * 0.36));

export default function StandardSidebar({ 
  currentPage, 
  adminStats, 
  onLogout, 
  userName = "Admin User",
  userInitial = "A",
  userRole = "Admin",
  onSubmitTag,
  onTagSubmitted
}: SidebarProps) {
  const router = useRouter();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmitTag = () => {
    if (currentPage === 'home') {
      // If on home page, use the custom callback (opens modal on home page)
      if (onSubmitTag) {
        onSubmitTag();
      }
    } else {
      // If on any other page, open modal locally
      setShowSubmitModal(true);
    }
  };

  return (
    <View style={styles.sidebar}>
      <ScrollView 
        contentContainerStyle={{ paddingVertical: 6 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Ionicons name="location" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.logoTitle}>Tag4Access</Text>
            <Text style={styles.logoSubtitle}>Community Accessibility</Text>
          </View>
        </View>

        {/* Navigation */}
        <StandardNavigation 
          currentPage={currentPage} 
          adminStats={adminStats}
          onSubmitTag={handleSubmitTag}
        />

        {/* User Profile Section */}
        <View style={styles.userProfile}>
          <View style={[styles.avatar, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{userName}</Text>
            <View style={[styles.roleBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable onPress={onLogout} style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      {/* Submit Modal - only show when not on home page */}
      {currentPage !== 'home' && (
        <SubmitAccessibilityTagModal
          visible={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            // Refresh data after modal closes (in case tag was submitted)
            if (onTagSubmitted) {
              onTagSubmitted();
            }
          }}
          initialLocation={null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoutText: { 
    color: '#EF4444', 
    fontWeight: '600', 
    fontSize: 13 
  },
});

export { SIDEBAR_WIDTH };
