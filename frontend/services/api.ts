// services/api.ts

// Type definitions to avoid circular imports
export interface Tag {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Item {
  _id: string;
  name: string;
  description?: string;
  tags: Tag[];
  location?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  tags: string[];
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface AccessibilityTag {
  _id: string;
  locationName: string;
  featureType: 'Entrance' | 'Ramp' | 'Elevator' | 'Washroom' | 'Parking' | 'Pathway' | 'Stairs' | 'Sidewalk' | 'Crosswalk' | 'Building Access' | 'Seating Area' | 'Information Desk' | 'ATM/Kiosk' | 'Emergency Exit' | 'Lighting' | 'Signage';
  accessibilityStatus: 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';
  priorityLevel: 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical' | 'Emergency';
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessibilityTagData {
  locationName: string;
  featureType: 'Entrance' | 'Ramp' | 'Elevator' | 'Washroom' | 'Parking' | 'Pathway' | 'Stairs' | 'Sidewalk' | 'Crosswalk' | 'Building Access' | 'Seating Area' | 'Information Desk' | 'ATM/Kiosk' | 'Emergency Exit' | 'Lighting' | 'Signage';
  accessibilityStatus: 'Accessible' | 'Inaccessible' | 'Pending' | 'Unconfirmed';
  priorityLevel: 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical' | 'Emergency';
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

// Use different URLs based on platform
const getApiBaseUrl = () => {
  // For iOS simulator, use localhost
  // For physical device, use your computer's IP
  // Uncomment the line below if testing on physical device:
  // return 'http://172.17.112.153:3001/api';
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class ApiService {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('Making API request to:', url);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]) as Response;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API request successful:', endpoint);
      return data;
    } catch (error) {
      console.error('API request failed:', url, error);
      throw error;
    }
  }

  // Tag methods
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags');
  }

  async createTag(tagData: CreateTagData): Promise<Tag> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: tagData,
    });
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/items');
  }

  async createItem(itemData: CreateItemData): Promise<Item> {
    return this.request<Item>('/items', {
      method: 'POST',
      body: itemData,
    });
  }

  async searchItems(query: string): Promise<Item[]> {
    return this.request<Item[]>(`/items/search?query=${encodeURIComponent(query)}`);
  }

  // Accessibility Tag methods
  async getAccessibilityTags(): Promise<AccessibilityTag[]> {
    return this.request<AccessibilityTag[]>('/accessibility-tags');
  }

  async getLatestAccessibilityTagsPerLocation(): Promise<AccessibilityTag[]> {
    return this.request<AccessibilityTag[]>('/accessibility-tags/latest-per-location');
  }

  async createAccessibilityTag(tagData: CreateAccessibilityTagData): Promise<AccessibilityTag> {
    return this.request<AccessibilityTag>('/accessibility-tags', {
      method: 'POST',
      body: tagData,
    });
  }

  async getAccessibilityTagsByLocation(latitude: number, longitude: number, radius?: number): Promise<{
    location: { latitude: number; longitude: number };
    radius: number;
    count: number;
    tags: AccessibilityTag[];
  }> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) {
      params.append('radius', radius.toString());
    }
    return this.request(`/accessibility-tags/by-location?${params}`);
  }

  async approveAccessibilityTag(tagId: string): Promise<AccessibilityTag> {
    return this.request<AccessibilityTag>(`/accessibility-tags/${tagId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectAccessibilityTag(tagId: string): Promise<{ message: string; deletedTag: AccessibilityTag }> {
    return this.request(`/accessibility-tags/${tagId}/reject`, {
      method: 'DELETE',
    });
  }

  async getAdminStats(): Promise<{
    totalTags: number;
    accessibleTags: number;
    pendingTags: number;
    unconfirmedTags: number;
    inaccessibleTags: number;
    resolvedIssues: number;
    pendingReview: number;
  }> {
    return this.request('/admin/stats');
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    const url = 'http://localhost:3001/';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export default new ApiService();
