import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageInfo {
  keys: string[];
  size: number;
  prefix: string;
}

class StorageService {
  private prefix: string = '@meditracker_';

  // Get prefixed key
  private getPrefixedKey(key: string): string {
    return this.prefix + key;
  }

  // Set item in storage
  async setItem(key: string, value: string | object): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(prefixedKey, stringValue);
      
      if (__DEV__) {
        console.log(`💾 Storage SET: ${key}`, value);
      }
    } catch (error) {
      console.error(`Error setting storage item ${key}:`, error);
      throw new Error(`Failed to save ${key} to storage`);
    }
  }

  // Get item from storage
  async getItem(key: string): Promise<string | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const value = await AsyncStorage.getItem(prefixedKey);
      
      if (__DEV__) {
        console.log(`💾 Storage GET: ${key}`, value);
      }
      
      return value;
    } catch (error) {
      console.error(`Error getting storage item ${key}:`, error);
      return null;
    }
  }

  // Get item and parse as JSON
  async getItemAsJSON<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing JSON for storage item ${key}:`, error);
      return null;
    }
  }

  // Remove item from storage
  async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      await AsyncStorage.removeItem(prefixedKey);
      
      if (__DEV__) {
        console.log(`💾 Storage REMOVE: ${key}`);
      }
    } catch (error) {
      console.error(`Error removing storage item ${key}:`, error);
      throw new Error(`Failed to remove ${key} from storage`);
    }
  }

  // Clear all app storage
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
      
      if (__DEV__) {
        console.log('💾 Storage CLEAR ALL app data');
      }
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // Get multiple items
  async getMultipleItems(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const prefixedKeys = keys.map(key => this.getPrefixedKey(key));
      const keyValuePairs = await AsyncStorage.multiGet(prefixedKeys);
      
      const result: Record<string, string | null> = {};
      keyValuePairs.forEach(([prefixedKey, value]) => {
        const originalKey = prefixedKey.replace(this.prefix, '');
        result[originalKey] = value;
      });
      
      if (__DEV__) {
        console.log('💾 Storage GET MULTIPLE:', result);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting multiple storage items:', error);
      return {};
    }
  }

  // Set multiple items
  async setMultipleItems(keyValuePairs: [string, string | object][]): Promise<void> {
    try {
      const prefixedPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        this.getPrefixedKey(key),
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(prefixedPairs);
      
      if (__DEV__) {
        console.log('💾 Storage SET MULTIPLE:', keyValuePairs);
      }
    } catch (error) {
      console.error('Error setting multiple storage items:', error);
      throw new Error('Failed to save multiple items to storage');
    }
  }

  // Check if key exists
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking storage item ${key}:`, error);
      return false;
    }
  }

  // Get all keys for this app
  async getAllAppKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting all app keys:', error);
      return [];
    }
  }

  // Get storage info
  async getStorageInfo(): Promise<StorageInfo | null> {
    try {
      const keys = await this.getAllAppKeys();
      const size = keys.length;
      
      return {
        keys,
        size,
        prefix: this.prefix,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

// Create singleton instance
export const storageService = new StorageService();