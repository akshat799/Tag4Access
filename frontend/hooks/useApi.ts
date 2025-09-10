// hooks/useApi.ts
import { useState, useEffect } from 'react';
import ApiService, { Tag, Item, CreateItemData, CreateTagData, AccessibilityTag, CreateAccessibilityTagData } from '../services/api';

// Re-export types for convenience
export type { Tag, Item, CreateItemData, CreateTagData, AccessibilityTag, CreateAccessibilityTagData };

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTags();
      setTags(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tagData: CreateTagData) => {
    try {
      const newTag = await ApiService.createTag(tagData);
      setTags(prev => [newTag, ...prev]);
      return newTag;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
    createTag,
  };
};

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getItems();
      setItems(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: CreateItemData) => {
    try {
      const newItem = await ApiService.createItem(itemData);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const searchItems = async (query: string) => {
    try {
      setLoading(true);
      const data = await ApiService.searchItems(query);
      setItems(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    createItem,
    searchItems,
  };
};

export const useAccessibilityTags = () => {
  const [accessibilityTags, setAccessibilityTags] = useState<AccessibilityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessibilityTags = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAccessibilityTags();
      setAccessibilityTags(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccessibilityTag = async (tagData: CreateAccessibilityTagData) => {
    try {
      const newTag = await ApiService.createAccessibilityTag(tagData);
      setAccessibilityTags(prev => [newTag, ...prev]);
      return newTag;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAccessibilityTags();
  }, []);

  return {
    accessibilityTags,
    loading,
    error,
    refetch: fetchAccessibilityTags,
    createAccessibilityTag,
  };
};

export const useApiHealth = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkHealth = async () => {
    try {
      setChecking(true);
      await ApiService.healthCheck();
      setIsHealthy(true);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    isHealthy,
    checking,
    checkHealth,
  };
};
