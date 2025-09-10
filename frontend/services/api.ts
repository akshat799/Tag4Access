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
  accessibilityStatus: 'Fully Accessible' | 'Partially Accessible' | 'Not Accessible' | 'Temporarily Inaccessible' | 'Under Construction' | 'Needs Repair' | 'Unknown Status';
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
  accessibilityStatus: 'Fully Accessible' | 'Partially Accessible' | 'Not Accessible' | 'Temporarily Inaccessible' | 'Under Construction' | 'Needs Repair' | 'Unknown Status';
  priorityLevel: 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical' | 'Emergency';
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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

  async createAccessibilityTag(tagData: CreateAccessibilityTagData): Promise<AccessibilityTag> {
    return this.request<AccessibilityTag>('/accessibility-tags', {
      method: 'POST',
      body: tagData,
    });
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
