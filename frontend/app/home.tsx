import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Stack, useRouter, type Href } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type TagStatus = 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';

type Pin = {
  id: string;
  title: string;
  status: TagStatus;
  coord: { latitude: number; longitude: number };
  type: 'Ramp' | 'Entrance' | 'Elevator' | 'Washroom';
};

const START_REGION: Region = {
  latitude: 44.6488,
  longitude: -63.5752,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const PINS: Pin[] = [
  { id: '1', title: 'Public Library Entrance', status: 'Accessible', type: 'Entrance', coord: { latitude: 44.6489, longitude: -63.5753 } },
  { id: '2', title: 'Sidewalk Curb Ramp',     status: 'Pending',     type: 'Ramp',     coord: { latitude: 44.6458, longitude: -63.572 } },
  { id: '3', title: 'Elevator Outage',         status: 'Inaccessible',type: 'Elevator', coord: { latitude: 44.651,  longitude: -63.5795 } },
  { id: '4', title: 'Washroom (Unverified)',   status: 'Unconfirmed', type: 'Washroom', coord: { latitude: 44.6464, longitude: -63.5842 } },
];

export default function HomeScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TagStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | Pin['type']>('All');

  const router = useRouter();
  const toLogin = '/' satisfies Href;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => router.replace(toLogin),
      },
    ]);
  };

  const filteredPins = useMemo(() => {
    return PINS.filter(
      (p) =>
        (statusFilter === 'All' || p.status === statusFilter) &&
        (typeFilter === 'All' || p.type === typeFilter),
    );
  }, [statusFilter, typeFilter]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Accessibility Map',
          headerLargeTitle: true,
          headerLeft: () => (
            <Pressable onPress={() => setSidebarOpen((s) => !s)} style={styles.headerIconBtn}>
              <Ionicons name="menu" size={22} color="#0A84FF" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => {}} style={styles.headerIconBtn}>
              <Ionicons name="add" size={22} color="#0A84FF" />
            </Pressable>
          ),
        }}
      />

      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.contentRow}>
          {sidebarOpen && (
            <View style={styles.sidebar}>
              <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
                <Text style={styles.sidebarTitle}>Navigation</Text>
                <Text style={styles.navItem}>Map</Text>
                <Text style={styles.navItem}>Submit Tag</Text>
                <Text style={styles.navItem}>Events</Text>
                <Text style={styles.navItem}>Awareness</Text>
                <Text style={styles.navItem}>Progress Log</Text>
                <Text style={styles.navItem}>Review Tags</Text>
                <Text style={styles.navItem}>Manage Events</Text>
                <Text style={styles.navItem}>Manage Podcasts</Text>
                <Text style={styles.navItem}>Admin Dashboard</Text>

                <Text style={[styles.sidebarTitle, { marginTop: 16 }]}>Quick Stats</Text>
                <Text style={styles.statRow}>Current City: Halifax</Text>
                <Text style={styles.statRow}>Tags Submitted: 0</Text>
                <Text style={styles.statRow}>Confirmed: 0</Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* 🔴 Logout item in the menu */}
                <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.85 }]}>
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  <Text style={styles.logoutText}>Log out</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          <View style={styles.mapWrap}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              initialRegion={START_REGION}
              showsCompass
            >
              {filteredPins.map((pin) => (
                <Marker
                  key={pin.id}
                  coordinate={pin.coord}
                  title={pin.title}
                  description={`${pin.type} • ${pin.status}`}
                  pinColor={statusColor(pin.status)}
                />
              ))}
            </MapView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

function statusColor(s: TagStatus) {
  switch (s) {
    case 'Accessible':
      return '#22C55E';
    case 'Inaccessible':
      return '#EF4444';
    case 'Pending':
      return '#F59E0B';
    case 'Unconfirmed':
      return '#6B7280';
  }
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
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightColor: '#E5E7EB',
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  sidebarTitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  navItem: { paddingVertical: 6, color: '#111827' },
  statRow: { marginTop: 6, color: '#374151' },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 14,
    marginBottom: 8,
  },

  // 🔴 Logout styling
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: '600' },

  mapWrap: { flex: 1 },
});
