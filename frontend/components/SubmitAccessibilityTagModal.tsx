import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLatestAccessibilityTagsPerLocation } from '../hooks/useApi';
// import * as Location from 'expo-location'; // Will be installed separately

interface SubmitAccessibilityTagModalProps {
  visible: boolean;
  onClose: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    status?: 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';
  } | null;
}

type FeatureType = 'Entrance' | 'Ramp' | 'Elevator' | 'Washroom' | 'Parking' | 'Pathway' | 'Stairs' | 'Sidewalk' | 'Crosswalk' | 'Building Access' | 'Seating Area' | 'Information Desk' | 'ATM/Kiosk' | 'Emergency Exit' | 'Lighting' | 'Signage';
type AccessibilityStatus = 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';
type PriorityLevel = 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical' | 'Emergency';

export default function SubmitAccessibilityTagModal({ visible, onClose, initialLocation }: SubmitAccessibilityTagModalProps) {
  const [locationName, setLocationName] = useState('');
  const [featureType, setFeatureType] = useState<FeatureType>('Entrance');
  const [accessibilityStatus, setAccessibilityStatus] = useState<AccessibilityStatus>('Accessible');
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('Medium Priority');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Dropdown states
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Debounce timer for search
  const searchTimeoutRef = React.useRef<any>(null);

  const { createAccessibilityTag } = useLatestAccessibilityTagsPerLocation();

  // Convert TagStatus to AccessibilityStatus
  const convertTagStatusToAccessibilityStatus = (status: string): AccessibilityStatus => {
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
  };

  // Pre-populate form when initialLocation is provided
  React.useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.latitude.toString());
      setLongitude(initialLocation.longitude.toString());
      
      // Set accessibility status if provided
      if (initialLocation.status) {
        setAccessibilityStatus(convertTagStatusToAccessibilityStatus(initialLocation.status));
      }
      
      if (initialLocation.address) {
        setLocationSearch(initialLocation.address);
        // Extract a simple location name from the full address
        const addressParts = initialLocation.address.split(',');
        setLocationName(addressParts[0] || 'New Location');
      }
      setSelectedLocation({
        name: 'Dropped Location',
        formatted_address: initialLocation.address || `${initialLocation.latitude}, ${initialLocation.longitude}`,
        geometry: {
          location: {
            lat: initialLocation.latitude,
            lng: initialLocation.longitude
          }
        }
      });
    }
  }, [initialLocation]);

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300); // 300ms delay
  };

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    try {
      // Using OpenStreetMap Nominatim API for address suggestions
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(query + ', Halifax, Nova Scotia, Canada')}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const formattedResults = data.map((item: any) => ({
          place_id: item.place_id,
          name: item.name || item.display_name.split(',')[0],
          formatted_address: item.display_name,
          geometry: { 
            location: { 
              lat: parseFloat(item.lat), 
              lng: parseFloat(item.lon) 
            } 
          },
          type: item.type || 'address'
        }));
        
        setSearchResults(formattedResults);
        setShowSearchResults(true);
      } else {
        // Fallback to Halifax-specific locations if no results
        const halifaxResults = [
          {
            place_id: 'halifax_1',
            name: 'Halifax Central Library',
            formatted_address: '5440 Spring Garden Rd, Halifax, NS B3J 1E9, Canada',
            geometry: { location: { lat: 44.6448, lng: -63.5752 } },
            type: 'library'
          },
          {
            place_id: 'halifax_2', 
            name: 'Halifax City Hall',
            formatted_address: '1841 Argyle St, Halifax, NS B3J 2R7, Canada',
            geometry: { location: { lat: 44.6476, lng: -63.5728 } },
            type: 'government'
          },
          {
            place_id: 'halifax_3',
            name: 'Halifax Waterfront',
            formatted_address: 'Lower Water St, Halifax, NS, Canada',
            geometry: { location: { lat: 44.6488, lng: -63.5752 } },
            type: 'waterfront'
          },
          {
            place_id: 'halifax_4',
            name: 'Dalhousie University',
            formatted_address: '6299 South St, Halifax, NS B3H 4R2, Canada',
            geometry: { location: { lat: 44.6369, lng: -63.5912 } },
            type: 'university'
          }
        ].filter(location => 
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.formatted_address.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(halifaxResults);
        setShowSearchResults(halifaxResults.length > 0);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectLocation = (location: any) => {
    setSelectedLocation(location);
    setLocationName(location.name);
    setLocationSearch(location.formatted_address);
    setLatitude(location.geometry.location.lat.toString());
    setLongitude(location.geometry.location.lng.toString());
    setShowSearchResults(false);
  };

  const getCurrentLocation = async () => {
    Alert.alert('Location Feature', 'Current location detection requires expo-location package. For now, please search for your location manually.');
    // TODO: Implement after installing expo-location
    // try {
    //   setLoading(true);
    //   const { status } = await Location.requestForegroundPermissionsAsync();
    //   if (status !== 'granted') {
    //     Alert.alert('Permission Denied', 'Location permission is required.');
    //     return;
    //   }
    //   const location = await Location.getCurrentPositionAsync({});
    //   setLatitude(location.coords.latitude.toString());
    //   setLongitude(location.coords.longitude.toString());
    //   Alert.alert('Success', 'Current location detected!');
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to get current location.');
    // } finally {
    //   setLoading(false);
    // }
  };

  const featureOptions: FeatureType[] = [
    'Entrance', 'Ramp', 'Elevator', 'Washroom', 'Parking', 'Pathway',
    'Stairs', 'Sidewalk', 'Crosswalk', 'Building Access', 'Seating Area',
    'Information Desk', 'ATM/Kiosk', 'Emergency Exit', 'Lighting', 'Signage'
  ];

  const statusOptions: AccessibilityStatus[] = [
    'Accessible', 'Inaccessible', 'Pending', 'Unconfirmed'
  ];

  const priorityOptions: PriorityLevel[] = [
    'Low Priority', 'Medium Priority', 'High Priority', 'Critical', 'Emergency'
  ];

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Error', 'Please enter latitude and longitude');
      return;
    }

    try {
      setLoading(true);
      
      // Convert string coordinates to numbers
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert('Error', 'Please enter valid latitude and longitude values');
        return;
      }
      
      // Submit to database
      await createAccessibilityTag({
        locationName: locationName.trim(),
        featureType,
        accessibilityStatus,
        priorityLevel,
        description: description.trim(),
        latitude: lat,
        longitude: lng,
      });
      
      // Reset form
      setLocationName('');
      setFeatureType('Entrance');
      setAccessibilityStatus('Accessible');
      setPriorityLevel('Medium Priority');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setLocationSearch('');
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedLocation(null);
      setShowFeatureDropdown(false);
      setShowStatusDropdown(false);
      setShowPriorityDropdown(false);
      onClose();
      Alert.alert('Success', 'Accessibility tag submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form when canceling
    setLocationName('');
    setFeatureType('Entrance');
    setAccessibilityStatus('Accessible');
    setPriorityLevel('Medium Priority');
    setDescription('');
    setLatitude('');
    setLongitude('');
    setLocationSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedLocation(null);
    setShowFeatureDropdown(false);
    setShowStatusDropdown(false);
    setShowPriorityDropdown(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>Tag4Access</Text>
            <Text style={styles.title}>Submit Accessibility Tag</Text>
            <Text style={styles.subtitle}>Report for Halifax</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Location Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g., City Hall, Metro Station"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type of Feature <Text style={styles.required}>*</Text></Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowFeatureDropdown(!showFeatureDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{featureType}</Text>
                <Ionicons 
                  name={showFeatureDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6B7280" 
                />
              </Pressable>
              {showFeatureDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {featureOptions.map((type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.dropdownOption,
                          featureType === type && styles.dropdownOptionSelected
                        ]}
                        onPress={() => {
                          setFeatureType(type);
                          setShowFeatureDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          featureType === type && styles.dropdownOptionTextSelected
                        ]}>
                          {type}
                        </Text>
                        {featureType === type && (
                          <Ionicons name="checkmark" size={16} color="#3B82F6" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Accessibility Status <Text style={styles.required}>*</Text></Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{accessibilityStatus}</Text>
                <Ionicons 
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6B7280" 
                />
              </Pressable>
              {showStatusDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {statusOptions.map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.dropdownOption,
                          accessibilityStatus === status && styles.dropdownOptionSelected
                        ]}
                        onPress={() => {
                          setAccessibilityStatus(status);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          accessibilityStatus === status && styles.dropdownOptionTextSelected
                        ]}>
                          {status}
                        </Text>
                        {accessibilityStatus === status && (
                          <Ionicons name="checkmark" size={16} color="#3B82F6" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{priorityLevel}</Text>
                <Ionicons 
                  name={showPriorityDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6B7280" 
                />
              </Pressable>
              {showPriorityDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {priorityOptions.map((priority) => (
                      <Pressable
                        key={priority}
                        style={[
                          styles.dropdownOption,
                          priorityLevel === priority && styles.dropdownOptionSelected
                        ]}
                        onPress={() => {
                          setPriorityLevel(priority);
                          setShowPriorityDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          priorityLevel === priority && styles.dropdownOptionTextSelected
                        ]}>
                          {priority}
                        </Text>
                        {priorityLevel === priority && (
                          <Ionicons name="checkmark" size={16} color="#3B82F6" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the accessibility issue or feature in detail..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Search <Text style={styles.required}>*</Text></Text>
              <View style={styles.locationSearchContainer}>
                <TextInput
                  style={[styles.input, styles.locationSearchInput]}
                  value={locationSearch}
                  onChangeText={(text) => {
                    setLocationSearch(text);
                    if (text.length >= 2) {
                      setSearchLoading(true);
                    }
                    debouncedSearch(text);
                  }}
                  placeholder="Type address (e.g., 500 Terry Avenue, Halifax Central Library)"
                  placeholderTextColor="#9CA3AF"
                />
                {searchLoading ? (
                  <ActivityIndicator 
                    size="small" 
                    color="#3B82F6" 
                    style={styles.searchLoadingIndicator}
                  />
                ) : (
                  <Pressable 
                    onPress={getCurrentLocation}
                    style={styles.currentLocationButton}
                    disabled={loading}
                  >
                    <Ionicons 
                      name="location" 
                      size={20} 
                      color={loading ? "#9CA3AF" : "#3B82F6"} 
                    />
                  </Pressable>
                )}
              </View>
              
              {showSearchResults && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <ScrollView 
                    style={styles.searchResultsList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {searchResults.map((item) => (
                      <Pressable
                        key={item.place_id}
                        style={styles.searchResultItem}
                        onPress={() => selectLocation(item)}
                      >
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <View style={styles.searchResultText}>
                          <Text style={styles.searchResultName}>{item.name}</Text>
                          <Text style={styles.searchResultAddress}>{item.formatted_address}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.coordinatesRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="44.6448"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!selectedLocation}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="-63.5752"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!selectedLocation}
                />
              </View>
            </View>
            
            {selectedLocation && (
              <View style={styles.selectedLocationInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.selectedLocationText}>
                  Location selected: {selectedLocation.name}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photo (Optional)</Text>
              <Pressable style={styles.photoButton}>
                <Ionicons name="camera-outline" size={20} color="#6B7280" />
                <Text style={styles.photoButtonText}>Add Photo</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Tag</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 150,
    minHeight: '100%',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  dropdownOptionSelected: {
    backgroundColor: '#EEF6FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 50,
    position: 'relative',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Location search styles
  locationSearchContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationSearchInput: {
    flex: 1,
    paddingRight: 50,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  searchResultsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  coordinateInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 50,
    top: 12,
    padding: 8,
  },
});
