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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibilityTags } from '../hooks/useApi';

interface SubmitAccessibilityTagModalProps {
  visible: boolean;
  onClose: () => void;
}

type FeatureType = 'Entrance' | 'Ramp' | 'Elevator' | 'Washroom' | 'Parking' | 'Pathway' | 'Stairs' | 'Sidewalk' | 'Crosswalk' | 'Building Access' | 'Seating Area' | 'Information Desk' | 'ATM/Kiosk' | 'Emergency Exit' | 'Lighting' | 'Signage';
type AccessibilityStatus = 'Fully Accessible' | 'Partially Accessible' | 'Not Accessible' | 'Temporarily Inaccessible' | 'Under Construction' | 'Needs Repair' | 'Unknown Status';
type PriorityLevel = 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical' | 'Emergency';

export default function SubmitAccessibilityTagModal({ visible, onClose }: SubmitAccessibilityTagModalProps) {
  const [locationName, setLocationName] = useState('');
  const [featureType, setFeatureType] = useState<FeatureType>('Entrance');
  const [accessibilityStatus, setAccessibilityStatus] = useState<AccessibilityStatus>('Fully Accessible');
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('Medium Priority');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dropdown states
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const { createAccessibilityTag } = useAccessibilityTags();

  const featureOptions: FeatureType[] = [
    'Entrance', 'Ramp', 'Elevator', 'Washroom', 'Parking', 'Pathway',
    'Stairs', 'Sidewalk', 'Crosswalk', 'Building Access', 'Seating Area',
    'Information Desk', 'ATM/Kiosk', 'Emergency Exit', 'Lighting', 'Signage'
  ];

  const statusOptions: AccessibilityStatus[] = [
    'Fully Accessible', 'Partially Accessible', 'Not Accessible',
    'Temporarily Inaccessible', 'Under Construction', 'Needs Repair', 'Unknown Status'
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
      setAccessibilityStatus('Fully Accessible');
      setPriorityLevel('Medium Priority');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setShowFeatureDropdown(false);
      setShowStatusDropdown(false);
      setShowPriorityDropdown(false);
      
      Alert.alert('Success', 'Accessibility tag submitted successfully!');
      onClose();
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
    setAccessibilityStatus('Fully Accessible');
    setPriorityLevel('Medium Priority');
    setDescription('');
    setLatitude('');
    setLongitude('');
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
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="49.2862564491517"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="-123.127319176309"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

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
});
