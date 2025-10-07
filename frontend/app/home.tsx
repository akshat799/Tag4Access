import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams, type Href } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useItems, useApiHealth, useLatestAccessibilityTagsPerLocation, useAdminStats } from '../hooks/useApi';
import StandardSidebar from '../components/StandardSidebar';
import SubmitAccessibilityTagModal from '../components/SubmitAccessibilityTagModal';

type TagStatus = 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';

type Pin = {
  id: string;
  title: string;
  status: TagStatus;
  coord: { latitude: number; longitude: number };
  type: 'Ramp' | 'Entrance' | 'Elevator' | 'Washroom' | 'Parking' | 'Pathway' | 'Stairs' | 'Sidewalk' | 'Crosswalk' | 'Building Access' | 'Seating Area' | 'Information Desk' | 'ATM/Kiosk' | 'Emergency Exit' | 'Lighting' | 'Signage';
};

// Function to convert AccessibilityTag status to Pin status
function convertAccessibilityStatus(status: string): TagStatus {
  switch (status) {
    case 'Accessible':
      return 'Accessible';
    case 'Inaccessible':
      return 'Inaccessible';
    case 'Pending':
      return 'Pending';
    case 'Unconfirmed':
    default:
      return 'Unconfirmed';
  }
}

const START_REGION: Region = {
  latitude: 44.6488,
  longitude: -63.5752,
  latitudeDelta: 0.2,  // Increased from 0.08 to zoom out more
  longitudeDelta: 0.2, // Increased from 0.08 to zoom out more
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
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [draggedLocation, setDraggedLocation] = useState<{latitude: number, longitude: number, address?: string, status?: TagStatus} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedStatus, setDraggedStatus] = useState<TagStatus | null>(null);

  const router = useRouter();
  const { openModal } = useLocalSearchParams();
  const toLogin = '/' satisfies Href;
  const mapRef = useRef<MapView>(null);
  const dragIconPosition = useRef(new Animated.ValueXY()).current;
  
  // MongoDB integration
  const { items, loading, error, refetch } = useItems();
  const { isHealthy, checking } = useApiHealth();
  const { accessibilityTags, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useLatestAccessibilityTagsPerLocation();
  const { stats: adminStats } = useAdminStats();

  // Auto-open modal when navigated with openModal parameter
  useEffect(() => {
    if (openModal === 'true') {
      setShowSubmitModal(true);
      // Clear the parameter from URL after opening modal
      router.replace('/home');
    }
  }, [openModal, router]);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Using a simple reverse geocoding approach
      // In production, you'd use Google Maps Geocoding API or similar
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // Create PanResponder for dragging status icons
  const createStatusPanResponder = (status: TagStatus) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        setDraggedStatus(status);
        
        // Set initial position to the touch location
        const initialX = evt.nativeEvent.pageX;
        const initialY = evt.nativeEvent.pageY;
        
        dragIconPosition.setValue({ x: initialX, y: initialY });
        dragIconPosition.setOffset({ x: 0, y: 0 });
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Update position to follow the finger/cursor
        dragIconPosition.setValue({
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY
        });
      },
      
      onPanResponderRelease: async (evt) => {
        // Convert screen coordinates to map coordinates
        const dropX = evt.nativeEvent.pageX;
        const dropY = evt.nativeEvent.pageY;
        const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH : 0;
        
        // Check if dropped on map area (not on sidebar or legend)
        if (dropX > sidebarWidth && mapRef.current) {
          try {
            const coordinate = await mapRef.current.coordinateForPoint({
              x: dropX - sidebarWidth,
              y: dropY - 100 // Adjust for header height
            });
            
            const address = await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
            
            setDraggedLocation({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              address: address,
              status: status
            });
            
            setShowSubmitModal(true);
          } catch (error) {
            console.error('Error converting coordinates:', error);
            Alert.alert('Info', `Couldn't place marker there. Try dropping on the map area.`);
          }
        } else {
          Alert.alert('Info', 'Drag the icon onto the map to place an accessibility marker!');
        }
        
        // Reset drag state
        setIsDragging(false);
        setDraggedStatus(null);
        dragIconPosition.setValue({ x: 0, y: 0 });
      },
    });
  };

  // Handle map press to convert screen coordinates to map coordinates
  const handleMapPress = async (event: any) => {
    if (isDragging && draggedStatus) {
      const { coordinate } = event.nativeEvent;
      const address = await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
      
      setDraggedLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: address,
        status: draggedStatus
      });
      
      setIsDragging(false);
      setDraggedStatus(null);
      setShowSubmitModal(true);
    }
  };

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

  // Convert MongoDB accessibility tags to pins format (latest per location only)
  const mongodbPins = useMemo(() => {
    console.log('Converting latest accessibility tags to pins:', accessibilityTags.length, 'tags (one per location)');
    
    return accessibilityTags.map(tag => {
      console.log('Converting tag:', tag.locationName, 'at', tag.latitude, tag.longitude, '- Status:', tag.accessibilityStatus);
      
      return {
        id: tag._id,
        title: tag.locationName,
        status: convertAccessibilityStatus(tag.accessibilityStatus),
        coord: { 
          latitude: tag.latitude, 
          longitude: tag.longitude 
        },
        type: tag.featureType as Pin['type']
      };
    });
  }, [accessibilityTags]);

  // Combine static pins with MongoDB pins (you can remove PINS if you want only MongoDB data)
  const allPins = useMemo(() => {
    const combined = [...PINS, ...mongodbPins];
    console.log('Total pins on map:', combined.length, '(Static:', PINS.length, ', MongoDB:', mongodbPins.length, ')');
    return combined;
  }, [mongodbPins]);

  const filteredPins = useMemo(() => {
    return allPins.filter(
      (p) =>
        (statusFilter === 'All' || p.status === statusFilter) &&
        (typeFilter === 'All' || p.type === typeFilter),
    );
  }, [allPins, statusFilter, typeFilter]);

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
            <Pressable onPress={() => setShowSubmitModal(true)} style={styles.headerIconBtn}>
              <Ionicons name="add" size={22} color="#0A84FF" />
            </Pressable>
          ),
        }} 
      />

      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.contentRow}>
          {sidebarOpen && (
            <StandardSidebar
              currentPage="home"
              adminStats={{
                totalTags: adminStats.totalTags,
                resolvedIssues: adminStats.resolvedIssues
              }}
              onLogout={handleLogout}
              userName="Admin User"
              userInitial="A"
              userRole="Admin"
              onSubmitTag={() => setShowSubmitModal(true)}
            />
          )}

          <View style={styles.mapWrap}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              initialRegion={START_REGION}
              showsCompass
              onPress={handleMapPress}
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
            
            {/* Accessibility Status Legend */}
            <View style={styles.accessibilityLegend}>
              <Text style={styles.legendTitle}>Drag to Map</Text>
              
              <Animated.View 
                style={[styles.legendItem, styles.draggableLegendItem]}
                {...createStatusPanResponder('Accessible').panHandlers}
              >
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.legendText}>Accessible</Text>
              </Animated.View>
              
              <Animated.View 
                style={[styles.legendItem, styles.draggableLegendItem]}
                {...createStatusPanResponder('Inaccessible').panHandlers}
              >
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Inaccessible</Text>
              </Animated.View>
              
              <Animated.View 
                style={[styles.legendItem, styles.draggableLegendItem]}
                {...createStatusPanResponder('Pending').panHandlers}
              >
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Pending</Text>
              </Animated.View>
              
              <Animated.View 
                style={[styles.legendItem, styles.draggableLegendItem]}
                {...createStatusPanResponder('Unconfirmed').panHandlers}
              >
                <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
                <Text style={styles.legendText}>Unconfirmed</Text>
              </Animated.View>
            </View>
          </View>
        </View>
        
        {/* Floating drag icon when dragging - positioned over entire screen */}
        {isDragging && draggedStatus && (
          <Animated.View
            style={[
              styles.floatingDragIcon,
              {
                left: Animated.subtract(dragIconPosition.x, 40), // Center the icon
                top: Animated.subtract(dragIconPosition.y, 20),
              },
            ]}
            pointerEvents="none"
          >
            <View style={[styles.legendDot, { backgroundColor: statusColor(draggedStatus) }]} />
            <Text style={styles.legendText}>{draggedStatus}</Text>
          </Animated.View>
        )}
      </SafeAreaView>

      <SubmitAccessibilityTagModal
        visible={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setDraggedLocation(null);
          // Refresh the accessibility tags when modal closes after submission
          console.log('Modal closed, refreshing accessibility tags...');
          refetchTags();
        }}
        initialLocation={draggedLocation}
      />
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
    padding: 8,
  },
  sidebarTitle: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  navItem: { paddingVertical: 3, color: '#111827', fontSize: 12 },
  navItemPressable: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 4,
    minHeight: 28,
    justifyContent: 'center',
  },
  statRow: { marginTop: 2, color: '#374151', fontSize: 12 },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 4,
  },

  // 🔴 Logout styling
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  logoutText: { color: '#EF4444', fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },

  mapWrap: { flex: 1 },
  
  // Accessibility Legend Styles
  accessibilityLegend: {
    position: 'absolute',
    top: 160,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    letterSpacing: 0.2,
  },
  
  // Drag Icon Styles
  dragIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  dragIconText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  
  // Draggable Legend Styles
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  draggableLegendItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  floatingDragIcon: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  
  // Refresh Button Styles
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
